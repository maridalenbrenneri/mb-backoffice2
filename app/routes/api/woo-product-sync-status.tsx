import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import * as woo from '~/_libs/woo';
import { createJobResult } from '~/services/job-result.service';
import { isAuthorizedJobRequest } from './_auth';

export const action: ActionFunction = async ({ request }) => {
  if (!(await isAuthorizedJobRequest(request)))
    return Response.json({ message: 'Unauthorized' }, { status: 401 });

  if (request.method !== 'POST')
    return Response.json({ message: 'Method not allowed' }, { status: 405 });

  const name = 'woo-product-sync-status';
  const jobStartedAt = DateTime.now().toJSDate();

  try {
    const result = await woo.syncAllWooProducts();

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: null,
    });

    return Response.json(result);
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
