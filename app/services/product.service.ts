import * as woo from '~/_libs/woo';
import type {
  WooProductCreate,
  WooProductUpdate,
} from '~/_libs/woo/products/types';
import {
  TAKE_DEFAULT_ROWS,
  TAKE_MAX_ROWS,
  WOO_PRODUCT_CATEGORY_BUTIKK_ID,
  WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
  WOO_PRODUCT_SHIPPING_CLASS_DEFAULT,
  WOO_PRODUCT_WEIGHT_DEFAULT,
} from '~/settings';
import { areEqual } from '~/utils/are-equal';
import { ensureDataSourceInitialized } from '~/typeorm/data-source';
import {
  ProductEntity,
  ProductStatus,
  ProductStockStatus,
} from '~/services/entities';
import {
  WOO_PRODUCT_STATUS_DRAFT,
  WOO_PRODUCT_STOCK_STATUS_INSTOCK,
  WOO_PRODUCT_STOCK_STATUS_ONBACKORDER,
  WOO_PRODUCT_STOCK_STATUS_OUTOFSTOCK,
} from '~/_libs/woo/constants';
import {
  createFullProductDescription,
  createFullProductName,
} from '~/utils/product-utils';
import { In } from 'typeorm';
import { DefaultCoffeeImages } from '~/settings';

// WOO IMPORT
export type WooApiUpdateProductData = Pick<
  ProductEntity,
  | 'status'
  | 'stockStatus'
  | 'wooProductId'
  | 'wooProductUrl'
  | 'wooCreatedAt'
  | 'wooUpdatedAt'
>;

async function getRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(ProductEntity);
}

async function getAllProducts(filter?: any) {
  filter = filter || {};

  // emulate defaults
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;

  const repo = await getRepo();
  const where = filter.where || {};
  const order = filter.orderBy || { updatedAt: 'desc' };
  const take = filter.take;
  const select = filter.select;
  return repo.find({ where, order, take, select });
}

export async function getInventoryProducts(filter?: any) {
  filter = filter || {};
  filter.where = filter.where || {};
  filter.where.category = 'inventory';
  return await getAllProducts(filter);
}

export async function getCoffeeProducts(filter?: any) {
  filter = filter || {};
  filter.where = filter.where || {};
  filter.where.category = 'coffee';
  return await getAllProducts(filter);
}

export async function getPublishedProducts(filter?: any) {
  filter = filter || {};
  filter.where = filter.where || {};
  filter.where.status = ProductStatus.PUBLISHED;
  return await getAllProducts(filter);
}

export async function getProductById(id: number) {
  const repo = await getRepo();
  return repo.findOne({ where: { id } });
}

//
// MUTATIONS
//

export async function createProduct(data: Partial<ProductEntity>) {
  data = cleanProductData(data);
  let wooData = toCreateWooProductData(data);

  // Create product in Woo
  let wooResult = await woo.productCreate(wooData);

  if (wooResult.kind !== 'success') {
    console.error('createProduct error', wooResult.error);
    return { kind: 'error', error: wooResult.error };
  }

  // Save product in database
  const repo = await getRepo();
  let productId = await repo.save(
    repo.create({
      ...data,
      wooProductId: wooResult.productId || null,
      wooProductUrl: wooResult.productUrl || null,
    })
  );

  return { kind: 'success', productId };
}

export async function updateProductSortOrder(ids: number[]) {
  const repo = await getRepo();

  const products = await repo.find({
    where: { id: In(ids) },
    order: { sortOrder: 'desc' },
  });

  for (const product of products) {
    product.sortOrder = ids.length - ids.indexOf(product.id);
  }

  return await repo.save(products);
}

export async function updateProduct(id: number, data: Partial<ProductEntity>) {
  const repo = await getRepo();
  const existingProduct = await repo.findOne({ where: { id } });

  if (!existingProduct) {
    console.error('Product not found', id);
    return { kind: 'error', error: 'Product not found' };
  }

  data = cleanProductData(data);

  // Check if any data that are relevant for Woo is changed
  const doUpdateInWoo =
    existingProduct.wooProductId &&
    ((data.name !== undefined && existingProduct.name != data.name) ||
      (data.coffee_country !== undefined &&
        existingProduct.coffee_country != data.coffee_country) ||
      (data.description !== undefined &&
        existingProduct.description != data.description) ||
      (data.coffee_beanType !== undefined &&
        existingProduct.coffee_beanType != data.coffee_beanType) ||
      (data.coffee_processType !== undefined &&
        existingProduct.coffee_processType != data.coffee_processType) ||
      (data.coffee_cuppingScore !== undefined &&
        existingProduct.coffee_cuppingScore != data.coffee_cuppingScore) ||
      (data.retailPrice !== undefined &&
        existingProduct.retailPrice != data.retailPrice) ||
      (data.stockStatus !== undefined &&
        existingProduct.stockStatus != data.stockStatus));

  // We only trigger Woo Update if there are Woo-specific data that needs to be updated
  if (doUpdateInWoo) {
    let wooData = toUpdateWooProductData(data);

    let wooResult = await woo.productUpdate(
      existingProduct.wooProductId as number,
      wooData
    );

    if (wooResult.kind !== 'success') {
      console.error('updateProduct error', wooResult.error);
      return { kind: 'error', error: wooResult.error };
    }
  }

  // Update Backoffice database
  const entity = await repo.preload({ id, ...data } as any);
  if (!entity) {
    return { kind: 'error', error: 'Failed to preload entity' };
  }

  let saved = await repo.save(entity);

  return { kind: 'success', productId: saved.id };
}

//
// Special update to be used when products are synced from Woo => Backoffice
//

export type WooSyncProductWithDataFromWooInput = {
  wooProductId: number;
  status: string;
  stockStatus: string;
  images: { wooMediaId: number; src: string }[];
  wooUpdatedAt: Date;
  wooProductUrl: string;
};

export async function woo_syncProductWithDataFromWoo(
  data: WooSyncProductWithDataFromWooInput
): Promise<
  | {
      result: 'updated' | 'notChanged';
      productId: number;
    }
  | {
      result: 'notFound';
    }
> {
  const repo = await getRepo();
  const existing = await repo.findOne({
    where: { wooProductId: data.wooProductId as number | undefined },
  });

  if (!existing) {
    return { result: 'notFound' };
  }

  const keys = Object.keys(
    data
  ) as (keyof WooSyncProductWithDataFromWooInput)[];
  let isChanged = false;
  for (const key of keys) {
    if (!areEqual((existing as any)[key], data[key])) {
      isChanged = true;
      break;
    }
  }

  if (!isChanged) {
    return { result: 'notChanged', productId: existing.id };
  }

  const toSave = await repo.preload({
    id: existing.id,
    status: data.status,
    stockStatus: data.stockStatus,
    images: data.images,
    wooUpdatedAt: data.wooUpdatedAt,
    wooProductUrl: data.wooProductUrl,
  } as Partial<ProductEntity>);

  if (toSave) {
    await repo.save(toSave);
    return { result: 'updated', productId: existing.id };
  }

  console.warn('woo_syncProductWithDataFromWoo: toSave is null');
  return { result: 'notChanged', productId: existing.id };
}

export async function setProductsAsDeleted(wooProductIds: number[]) {
  const repo = await getRepo();
  const products = await repo.find({
    where: { wooProductId: In(wooProductIds) },
    select: {
      id: true,
      status: true,
    },
  });

  console.debug(
    `Setting ${products.map((p) => p.id).join(',')} products as deleted`
  );

  const updatedProducts = products.map((product) => ({
    id: product.id,
    status: ProductStatus.DELETED,
  }));

  await repo.save(updatedProducts);
}

//
// Helpers
//

function cleanProductData(data: Partial<ProductEntity>) {
  if (data.productCode) data.productCode = data.productCode.toUpperCase();

  return data;
}

function toCreateWooProductData(
  data: Partial<ProductEntity>
): WooProductCreate {
  let stock_status =
    data.stockStatus === ProductStockStatus.ON_BACKORDER
      ? WOO_PRODUCT_STOCK_STATUS_ONBACKORDER
      : WOO_PRODUCT_STOCK_STATUS_INSTOCK;

  return {
    status: WOO_PRODUCT_STATUS_DRAFT,
    stock_status,
    categories: [{ id: WOO_PRODUCT_CATEGORY_BUTIKK_ID }],
    name: createFullProductName(data),
    short_description: createFullProductDescription(data),
    // TODO: Images is work-in-progress, not sure we shold ever set it in Backoffice
    // images: createDefaultWooProductImage(data),
    regular_price: data.retailPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
    weight: WOO_PRODUCT_WEIGHT_DEFAULT,
    shipping_class: WOO_PRODUCT_SHIPPING_CLASS_DEFAULT,
  };
}

function toUpdateWooProductData(
  data: Partial<ProductEntity>
): WooProductUpdate {
  return {
    stock_status: toWooStockStatus(data.stockStatus as ProductStockStatus),
    name: data.name !== undefined ? createFullProductName(data) : undefined,
    short_description:
      data.description !== undefined
        ? createFullProductDescription(data)
        : undefined,
    regular_price:
      data.retailPrice !== undefined ? data.retailPrice || '' : undefined,
  };
}

function toWooStockStatus(stockStatus: ProductStockStatus): string {
  switch (stockStatus) {
    case ProductStockStatus.ON_BACKORDER:
      return WOO_PRODUCT_STOCK_STATUS_ONBACKORDER;
    case ProductStockStatus.IN_STOCK:
      return WOO_PRODUCT_STOCK_STATUS_INSTOCK;
    case ProductStockStatus.OUT_OF_STOCK:
      return WOO_PRODUCT_STOCK_STATUS_OUTOFSTOCK;
    default:
      return WOO_PRODUCT_STOCK_STATUS_OUTOFSTOCK;
  }
}

function createDefaultWooProductImage(data: Partial<ProductEntity>) {
  let wooMediaId = DefaultCoffeeImages.find(
    (image) => image.country === data.coffee_country
  )?.wooMediaId;

  if (!wooMediaId) {
    return [];
  }

  return [
    {
      id: wooMediaId,
    },
  ];
}
