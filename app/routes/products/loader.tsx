import { json } from '@remix-run/node';
import { getProducts } from '~/services/product.service';
import { ProductStatus, ProductStockStatus } from '~/services/entities';

const defaultStatus = '_all'; // ProductStatus.PUBLISHED;
const defaultStockStatus = '_all'; // ProductStockStatus.IN_STOCK;

export type LoaderData = {
  products: Awaited<ReturnType<typeof getProducts>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = {
    where: {},
    orderBy: { id: 'desc' },
  };

  const getStatusFilter = search.get('status') || defaultStatus;
  const getStockStatusFilter = search.get('stockStatus') || defaultStockStatus;

  if (getStatusFilter !== '_all') filter.where.status = getStatusFilter;
  if (getStockStatusFilter !== '_all')
    filter.where.stockStatus = getStockStatusFilter;

  return filter;
}

export const productLoader = async (request: any) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  console.log(filter);

  const products = await getProducts(filter);
  return json<LoaderData>({
    products,
  });
};
