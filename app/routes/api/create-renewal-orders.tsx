import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { createRenewalOrders } from '~/services/subscription-renewal.service';
import { DateTime } from 'luxon';
import { createJobResult } from '~/services/job-result.service';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'create-renewal-orders';
  const jobStartedAt = DateTime.now().toJSDate();

  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const ignoreRenewalDay = search.get('ignoreRenewalDay') === 'true';

  try {
    const result = await createRenewalOrders(ignoreRenewalDay);

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: null,
    });

    return json(result);
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
