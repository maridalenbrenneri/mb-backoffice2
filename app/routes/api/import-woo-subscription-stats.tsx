import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';

import importWooSubscriptionStats from '~/_libs/woo/import-woo-subscription-stats';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const res = await importWooSubscriptionStats();

  return json(res);
};
