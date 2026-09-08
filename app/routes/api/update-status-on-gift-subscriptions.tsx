import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import { updateStatusOnGiftSubscriptions } from '~/services/subscription.service';
import { createJobResult } from '~/services/job-result.service';
import { isAuthorizedJobRequest } from './_auth';

export const action: ActionFunction = async ({ request }) => {
  if (!isAuthorizedJobRequest(request))
    return Response.json({ message: 'Unauthorized' }, { status: 401 });

  if (request.method !== 'POST')
    return Response.json({ message: 'Method not allowed' }, { status: 405 });

  const name = 'update-status-on-gift-subscriptions';
  const jobStartedAt = DateTime.now().toJSDate();

  try {
    const result = await updateStatusOnGiftSubscriptions();

    await createJobResult({
      jobStartedAt,
      name,
      result: JSON.stringify(result),
      errors: null,
    });

    return Response.json(result);
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
