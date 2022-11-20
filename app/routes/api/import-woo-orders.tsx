import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';

import importWooOrders from '~/_libs/woo/import-woo.orders';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const res = await importWooOrders();

  return json(res);
};
