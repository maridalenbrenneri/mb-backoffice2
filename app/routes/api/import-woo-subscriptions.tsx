import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import { createJobResult } from '~/_libs/core/models/job-result.server';
import * as woo from '~/_libs/woo';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'woo-import-subscriptions';
  const jobStartedAt = DateTime.now().toJSDate();

  console.time('woo-import-subscriptions');

  try {
    const result = await woo.importWooSubscriptions();

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

    console.debug(err.message);

    return { errors: err.message };
  } finally {
    console.timeEnd('woo-import-subscriptions');
  }
};
