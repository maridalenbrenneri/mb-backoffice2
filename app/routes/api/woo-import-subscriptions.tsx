import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import * as woo from '~/_libs/woo';
import { createJobResult } from '~/services/job-result.service';
import { isAuthorizedJobRequest } from './_auth';

export const action: ActionFunction = async ({ request }) => {
  if (!isAuthorizedJobRequest(request))
    return Response.json({ message: 'Unauthorized' }, { status: 401 });

  if (request.method !== 'POST')
    return Response.json({ message: 'Method not allowed' }, { status: 405 });

  const url = new URL(request.url);

  let full = url.searchParams.get('full') === 'true';

  const name = full
    ? 'woo-import-subscriptions-full'
    : 'woo-import-subscriptions';

  const jobStartedAt = DateTime.now().toJSDate();

  console.time('woo-import-subscriptions');

  try {
    let result = await woo.importWooSubscriptions(full);

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: result.errors,
    });

    return Response.json(result);
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
