import { prisma } from '~/db.server';

import { TAKE_DEFAULT_ROWS, TAKE_MAX_ROWS } from '../../settings';
import type { Product, ProductStockStatus } from '@prisma/client';
import type { WooUpsertProductData } from './types';
import { areEqual } from '../../utils/are-equal';

export async function getProducts(filter?: any) {
  filter = filter || {};

  // ADD DEFAULT FILTER VALUES IF NOT OVERIDDEN IN FILTER INPUT
  if (!filter.orderBy) filter.orderBy = { updatedAt: 'desc' };
  if (!filter.take || filter.take > TAKE_MAX_ROWS)
    filter.take = TAKE_DEFAULT_ROWS;
  // TODO: Always exclude DELETED

  return prisma.product.findMany(filter);
}

export async function getProduct(filter: any) {
  if (!filter) return null;

  return await prisma.product.findFirst(filter);
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function updateOrderStockStatus(
  id: number,
  stockStatus: ProductStockStatus
) {
  return prisma.product.update({
    where: { id },
    data: { stockStatus },
  });
}

export async function updateProduct(id: number, data: any) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

// WOO IMPORT
export async function upsertProductFromWoo(
  data: WooUpsertProductData
): Promise<{
  result: 'updated' | 'new' | 'notChanged';
  productId: number;
}> {
  let dbProduct = await prisma.product.findFirst({
    where: {
      wooProductId: data.wooProductId,
    },
  });

  // Check if any value has changed
  if (dbProduct) {
    const keys = Object.keys(data) as (keyof Product)[];
    let isChanged = false;
    for (let key of keys) {
      if (!areEqual(dbProduct[key], data[key as keyof WooUpsertProductData])) {
        isChanged = true;
        break;
      }
    }
    if (isChanged) {
      let res = await prisma.product.update({
        where: { wooProductId: data.wooProductId as number },
        data,
      });

      return {
        result: 'updated',
        productId: res.id,
      };
    }

    return {
      result: 'notChanged',
      productId: dbProduct.id,
    };
  }

  let res = await prisma.product.create({ data });

  return {
    result: 'new',
    productId: res.id,
  };
}
