import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';

import importWooGiftSubscriptions from '~/_libs/woo/import-woo-gift-subscriptions';

// IMPORTS ALL GIFT SUBSCRIPTION FROM UPDATE AFTER TODAY - 13 MONTHS
//  FOR INITAL USE, GIFT SUBSCRIPTIONS ARE REGUALLY IMPORTED IN THE ORDER IMPORT
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const res = await importWooGiftSubscriptions();

  return json(res);
};
