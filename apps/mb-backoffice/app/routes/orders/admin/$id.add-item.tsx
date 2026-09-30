import type { ActionFunction } from '@remix-run/node';

import { upsertOrderItemAction } from './_shared';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  return await upsertOrderItemAction(values);
};
