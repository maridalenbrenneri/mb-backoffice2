import { json } from '@remix-run/node';
import {
  getCoffeeProducts,
  getInventoryProducts,
} from '~/services/product.service';

export type LoaderData = {
  products: Awaited<ReturnType<typeof getCoffeeProducts>>;
};

export const inventoryLoader = async (request: any) => {
  let filter = { orderBy: { id: 'asc' } };
  let products = await getInventoryProducts(filter);

  return json<LoaderData>({
    products,
  });
};
