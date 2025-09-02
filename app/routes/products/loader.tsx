import { json } from '@remix-run/node';
import { getCoffeeProducts } from '~/services/product.service';
import { ProductStatus, ProductStockStatus } from '~/services/entities';
import { In } from 'typeorm';

export const defaultStatus = '_in_webshop';
export const defaultStockStatus = '_backorder_in_stock';

export type LoaderData = {
  products: Awaited<ReturnType<typeof getCoffeeProducts>>;
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

  const filter = buildFilter(search);

  console.log(filter);

  const products = await getCoffeeProducts(filter);
  return json<LoaderData>({
    products,
  });
};
