import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import { updateStatusOnGiftSubscriptions } from '~/_libs/core/services/subscription-service';
import { createJobResult } from '~/_libs/core/repositories/job-result.server';

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
      errors: err.message,
    });

    return { errors: err.message };
  }
};
