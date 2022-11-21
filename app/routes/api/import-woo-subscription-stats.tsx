import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import importWooSubscriptionStats from '~/_libs/woo/import-woo-subscription-stats';
import { createImportResult } from '~/_libs/core/models/import-result.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'woo-import-subscription-stats';
  const importStartedAt = DateTime.now().toJSDate();

  try {
    const result = await importWooSubscriptionStats();

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
