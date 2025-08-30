import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import * as woo from '~/_libs/woo';
import { createJobResult } from '~/services/job-result.service';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  let full = url.searchParams.get('full') === 'true';

  const name = full ? 'woo-import-orders-full' : 'woo-import-orders';
  const jobStartedAt = DateTime.now().toJSDate();

  try {
    const result = await woo.importWooOrders(full);

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
      errors: err instanceof Error ? err.message : 'Unknown error',
    });

    return { errors: err instanceof Error ? err.message : 'Unknown error' };
  }
};
