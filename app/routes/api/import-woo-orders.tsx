import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import importWooOrders from '~/_libs/woo/import-woo.orders';
import { createImportResult } from '~/_libs/core/models/import-result.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'woo-import-orders';
  const importStartedAt = DateTime.now().toJSDate();

  try {
    const result = await importWooOrders();

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
