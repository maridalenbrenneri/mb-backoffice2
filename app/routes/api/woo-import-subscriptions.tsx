import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import * as woo from '~/_libs/woo';
import { createJobResult } from '~/services/job-result.service';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  let all = url.searchParams.get('full') === 'true';

  const name = all
    ? 'woo-import-subscriptions-full'
    : 'woo-import-subscriptions';
  const jobStartedAt = DateTime.now().toJSDate();

  console.time('woo-import-subscriptions');

  try {
    let result = await woo.importWooSubscriptions();

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: result.errors,
    });

    return json(result);
  } catch (err: any) {
    await createJobResult({
      jobStartedAt,
      name,
      result: null,
      errors: err.message,
    });

    console.debug(err.message);

    return { errors: err.message };
  } finally {
    console.timeEnd('woo-import-subscriptions');
  }
};
