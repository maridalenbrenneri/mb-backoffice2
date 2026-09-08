import { getUserId } from '~/utils/session.server';

export async function isAuthorizedJobRequest(request: Request) {
  const expected = process.env.API_KEY;
  const provided = request.headers.get('x-api-key');

  // Cronjob with valid api key in headers
  if (expected && provided && provided === expected) return true;

  // Logged in user with a valid session
  return (await getUserId(request)) != null;
}
