import { json } from '@remix-run/node';
import { getCoffeeProducts } from '~/services/product.service';
import { ProductStatus, ProductStockStatus } from '~/services/entities';
import { In, Not } from 'typeorm';

export const defaultStatus = '_in_webshop';
export const defaultStockStatus = '_backorder_in_stock';

export type LoaderDataAll = {
  products: Awaited<ReturnType<typeof getCoffeeProducts>>;
};

export type LoaderData = {
  publishedProducts: Awaited<ReturnType<typeof getCoffeeProducts>>;
  notYetPublishedProducts: Awaited<ReturnType<typeof getCoffeeProducts>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = {
    where: {},
    orderBy: { id: 'desc' },
  };

  const getStatusFilter = search.get('status') || defaultStatus;
  if (getStatusFilter === '_not_published') {
    filter.where.status = In([ProductStatus.PRIVATE, ProductStatus.DRAFT]);
  } else if (getStatusFilter === '_in_webshop') {
    filter.where.status = In([
      ProductStatus.PRIVATE,
      ProductStatus.DRAFT,
      ProductStatus.PUBLISHED,
    ]);
  } else {
    filter.where.status = getStatusFilter;
  }

  const getStockStatusFilter = search.get('stockStatus') || defaultStockStatus;
  if (getStockStatusFilter === '_backorder_in_stock') {
    filter.where.stockStatus = In([
      ProductStockStatus.ON_BACKORDER,
      ProductStockStatus.IN_STOCK,
    ]);
  } else if (getStockStatusFilter !== '_all') {
    filter.where.stockStatus = getStockStatusFilter;
  }

  return filter;
}

export const productLoader = async (request: any) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  const stockStatusFilter = search.get('stockStatus');

  // Build where clause for stock status filtering
  let stockStatusWhere: any = {};
  if (!stockStatusFilter || stockStatusFilter === '_exclude_out_of_stock') {
    stockStatusWhere.stockStatus = Not(ProductStockStatus.OUT_OF_STOCK);
  } else if (stockStatusFilter && stockStatusFilter !== '_all') {
    stockStatusWhere.stockStatus = stockStatusFilter as ProductStockStatus;
  }

  let publishedProducts = await getCoffeeProducts({
    where: {
      status: ProductStatus.PUBLISHED,
    },
    orderBy: { updatedAt: 'desc' },
  });

  let notYetPublishedProducts = await getCoffeeProducts({
    where: {
      status: In([ProductStatus.PRIVATE, ProductStatus.DRAFT]),
      ...stockStatusWhere,
    },
    orderBy: { sortOrder: 'desc' },
  });

  return json<LoaderData>({
    publishedProducts,
    notYetPublishedProducts,
  });
};

export const productLoaderAllCoffees = async (request: any) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  filter.orderBy = { updatedAt: 'desc' };

  let products = await getCoffeeProducts(filter);

  return json<LoaderDataAll>({
    products,
  });
};
