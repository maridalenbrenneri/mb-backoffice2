import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import { updateStatusOnGiftSubscriptions } from '~/services/subscription.service';
import { createJobResult } from '~/services/job-result.service';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

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
