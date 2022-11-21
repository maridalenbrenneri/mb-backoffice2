import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import importWooGiftSubscriptions from '~/_libs/woo/import-woo-gift-subscriptions';
import { createImportResult } from '~/_libs/core/models/import-result.server';

// IMPORTS ALL GIFT SUBSCRIPTION FROM UPDATE AFTER TODAY - 13 MONTHS
//  FOR INITAL USE, GIFT SUBSCRIPTIONS ARE REGUALLY IMPORTED IN THE ORDER IMPORT
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'woo-import-gift-subscriptions';
  const importStartedAt = DateTime.now().toJSDate();

  try {
    const result = await importWooGiftSubscriptions();

    await createImportResult({
      importStartedAt,
      name,
      result: JSON.stringify(result),
      errors: null,
    });

    return json(result);
  } catch (err) {
    await createImportResult({
      importStartedAt,
      name,
      result: null,
      errors: err.message,
    });

    return { errors: err.message };
  }
};
