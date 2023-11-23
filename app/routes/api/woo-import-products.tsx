import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { DateTime } from 'luxon';

import { createJobResult } from '~/_libs/core/repositories/job-result.server';
import * as woo from '~/_libs/woo';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed' }, 405);

  const name = 'woo-import-products';
  const jobStartedAt = DateTime.now().toJSDate();

  try {
    const result = await woo.importWooProducts();

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
