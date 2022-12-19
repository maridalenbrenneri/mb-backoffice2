import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import { createJobResult } from '~/_libs/core/models/job-result.server';
import * as woo from '~/_libs/woo';

// IMPORTS ALL GIFT SUBSCRIPTION FROM UPDATE AFTER TODAY - 13 MONTHS
//  FOR INITAL USE, GIFT SUBSCRIPTIONS ARE REGUALLY IMPORTED IN THE ORDER IMPORT
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'woo-import-gift-subscriptions';
  const jobStartedAt = DateTime.now().toJSDate();

  try {
    const result = await woo.importWooGiftSubscriptions();

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: null,
    });

    return json(result);
  } catch (err) {
    await createJobResult({
      jobStartedAt,
      name,
      result: null,
      errors: err.message,
    });

    return { errors: err.message };
  }
};
