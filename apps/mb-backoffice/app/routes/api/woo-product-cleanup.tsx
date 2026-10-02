import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';
import { Not } from 'typeorm';

import * as woo from '~/_libs/woo';
import { ProductStatus } from '~/services/entities';
import { createJobResult } from '~/services/job-result.service';
import {
  getAllCoffeeProducts,
  setProductsAsDeleted,
} from '~/services/product.service';
import { isAuthorizedJobRequest } from './_auth';

export const action: ActionFunction = async ({ request }) => {
  if (!isAuthorizedJobRequest(request))
    return Response.json({ message: 'Unauthorized' }, { status: 401 });

  if (request.method !== 'POST')
    return Response.json({ message: 'Method not allowed' }, { status: 405 });

  const name = 'woo-product-cleanup';
  const jobStartedAt = DateTime.now().toJSDate();

  try {
    let products = await getAllCoffeeProducts({
      select: {
        id: true,
        wooProductId: true,
      },
      where: {
        status: Not(ProductStatus.DELETED),
      },
    });

    let wooProductIds = products
      .map((p) => p.wooProductId)
      .filter((p) => p !== null);

    const result = await woo.wooProductCleanup(wooProductIds);

    if (result.kind !== 'success') {
      throw new Error(result.error);
    }

    await setProductsAsDeleted(result.wooProductIds);

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: null,
    });

    return Response.json(result);
  } catch (err: any) {
    await createJobResult({
      jobStartedAt,
      name,
      result: null,
      errors: err.message,
    });

    return { errors: err.message };
  }
};
