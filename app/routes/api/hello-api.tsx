import type { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
  const result = { result: 'Hello World!' };

  console.debug(result.result);

  return Response.json(result);
};
