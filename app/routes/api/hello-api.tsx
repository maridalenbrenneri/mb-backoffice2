import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
  const result = { result: 'Hello api' };

  console.log('I AM IN API');

  return json(result);
};
