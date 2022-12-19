import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { createRenewalOrders } from '~/_libs/core/services/subscription-renewal-service';
import { DateTime } from 'luxon';
import { createImportResult } from '~/_libs/core/models/import-result.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'create-renewal-orders';
  const importStartedAt = DateTime.now().toJSDate();

  try {
    const result = await createRenewalOrders();

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
