import * as woo from '~/_libs/woo';
import type { WooProductUpdate } from '~/_libs/woo/products/types';
import {
  TAKE_DEFAULT_ROWS,
  TAKE_MAX_ROWS,
  WOO_PRODUCT_CATEGORY_BUTIKK_ID,
} from '~/settings';
import { areEqual } from '~/utils/are-equal';
import { ensureDataSourceInitialized } from '~/typeorm/data-source';
import { ProductEntity, ProductStockStatus } from '~/services/entities';
import {
  WOO_PRODUCT_STATUS_DRAFT,
  WOO_PRODUCT_STOCK_STATUS_INSTOCK,
  WOO_PRODUCT_STOCK_STATUS_ONBACKORDER,
} from '~/_libs/woo/constants';
import {
  createFullProductDescription,
  createFullProductName,
} from '~/utils/product-utils';

// WOO IMPORT
export type WooUpsertProductData = Pick<
  ProductEntity,
  | 'name'
  | 'status'
  | 'stockStatus'
  | 'category'
  | 'wooProductId'
  | 'wooProductUrl'
  | 'wooCreatedAt'
  | 'wooUpdatedAt'
>;

async function getRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(ProductEntity);
}

export async function getAllProducts(filter?: any) {
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

export async function getProducts(filter?: any) {
  filter = filter || {};
  filter.where = filter.where || {};
  filter.where.category = 'coffee';
  return await getAllProducts(filter);
}

export async function getProduct(filter: any) {
  if (!filter) return null;

  const options: any = {};

  // Handle include to relations conversion if needed
  if (filter.include) {
    // Convert include object to relations array
    const relations: string[] = [];
    Object.keys(filter.include).forEach((key) => {
      relations.push(key);
    });
    options.relations = relations;
  } else if (filter.relations) {
    options.relations = filter.relations;
  }

  // Copy other filter properties
  if (filter.where) options.where = filter.where;
  if (filter.orderBy) options.order = filter.orderBy;
  if (filter.take) options.take = filter.take;
  if (filter.skip) options.skip = filter.skip;

  const repo = await getRepo();
  return repo.findOne(options);
}

export async function getProductById(id: number) {
  const repo = await getRepo();
  return repo.findOne({ where: { id } });
}

function cleanProductData(data: Partial<ProductEntity>) {
  if (data.productCode) data.productCode = data.productCode.toUpperCase();

  return data;
}

// MUTATIONS

function createWooProductData(data: Partial<ProductEntity>) {
  let stock_status =
    data.stockStatus === ProductStockStatus.ON_BACKORDER
      ? WOO_PRODUCT_STOCK_STATUS_ONBACKORDER
      : WOO_PRODUCT_STOCK_STATUS_INSTOCK;

  return {
    status: WOO_PRODUCT_STATUS_DRAFT,
    stock_status,
    categories: [{ id: WOO_PRODUCT_CATEGORY_BUTIKK_ID }],
    name: createFullProductName(data),
    description: createFullProductDescription(data),
    regular_price: data.regularPrice as string,
  };
}

export async function createProduct(data: Partial<ProductEntity>) {
  data = cleanProductData(data);
  let wooData = createWooProductData(data);

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

export async function updateProduct(id: number, data: Partial<ProductEntity>) {
  const repo = await getRepo();
  const existingProduct = await repo.findOne({ where: { id } });

  if (!existingProduct) {
    console.error('Product not found', id);
    return { kind: 'error', error: 'Product not found' };
  }

  data = cleanProductData(data);

  // Check if we have Woo-specific data that needs to be updated
  const doUpdateInWoo =
    existingProduct.wooProductId &&
    (existingProduct.name != data.name ||
      existingProduct.description != data.description ||
      existingProduct.beanType != data.beanType ||
      existingProduct.processType != data.processType ||
      existingProduct.cuppingScore != data.cuppingScore ||
      existingProduct.regularPrice != data.regularPrice ||
      existingProduct.stockStatus != data.stockStatus);

  if (doUpdateInWoo) {
    let wooData = createWooProductData(data);

    let wooResult = await woo.productUpdate(
      existingProduct.wooProductId as number,
      wooData
    );

    if (wooResult.kind !== 'success') {
      console.error('updateProduct error', wooResult.error);
      return { kind: 'error', error: wooResult.error };
    }
  }

  // Update local database
  const entity = await repo.preload({ id, ...data } as any);
  if (!entity) {
    console.error('Failed to preload entity', id);
    return { kind: 'error', error: 'Failed to preload entity' };
  }

  let saved = await repo.save(entity);
  return { kind: 'success', productId: saved.id };
}

// Update product stock status
export async function updateOrderStockStatus(
  id: number,
  stockStatus: ProductStockStatus
) {
  const repo = await getRepo();
  const entity = await repo.preload({ id, stockStatus } as any);
  if (!entity) return null;
  return await repo.save(entity);
}

// MUTATIONS - SYNC WITH WOO

// Update Woo visibility
export async function woo_productSetPrivate(productId: number) {
  const data: WooProductUpdate = {
    status: 'private',
  };

  return await woo_update(productId, data);
}

export async function woo_productSetStockStatus(
  productId: number,
  stockStatus: ProductStockStatus
) {
  let stock_status = 'outofstock';
  if (stockStatus === ProductStockStatus.IN_STOCK) stock_status = 'instock';
  if (stockStatus === ProductStockStatus.ON_BACKORDER)
    stock_status = 'onbackorder';

  const data: WooProductUpdate = {
    stock_status,
  };

  return await woo_update(productId, data);
}

// Update product in Woo
async function woo_update(productId: number, data: WooProductUpdate) {
  const product = await getProductById(productId);
  if (!product || !product.wooProductId)
    return {
      kind: 'error' as const,
      error: 'Product not found or no woo product id',
    };

  return await woo.productUpdate(product.wooProductId, data);
}

// Used by Woo Import Job
export async function woo_upsertProductFromWoo(
  data: WooUpsertProductData
): Promise<{
  result: 'updated' | 'new' | 'notChanged';
  productId: number;
}> {
  const repo = await getRepo();
  const existing = await repo.findOne({
    where: { wooProductId: data.wooProductId as number | undefined },
  });

  if (existing) {
    const keys = Object.keys(data) as (keyof WooUpsertProductData)[];
    let isChanged = false;
    for (const key of keys) {
      if (!areEqual((existing as any)[key], data[key])) {
        isChanged = true;
        break;
      }
    }

    if (isChanged) {
      const toSave = await repo.preload({
        id: existing.id,
        ...(data as any),
      } as any);
      if (toSave) {
        await repo.save(toSave);
      }
      return { result: 'updated', productId: existing.id };
    }
    return { result: 'notChanged', productId: existing.id };
  }

  // TODO: We should never create products in backoffice if they don't exist

  try {
    const created = await repo.save(
      repo.manager.create(ProductEntity, data as any)
    );
    return { result: 'new', productId: created.id };
  } catch (error) {
    console.error('upsertProductFromWoo error', error);
    throw error;
  }
}
