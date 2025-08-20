import { createCookieSessionStorage, redirect } from '@remix-run/node';

import bcrypt from 'bcrypt';
import { getUserByEmail, getUserById } from '~/services/user.service';

type LoginForm = {
  email: string;
  password: string;
};

// export async function register({ email, password }: LoginForm) {
//   let passwordHash = await bcrypt.hash(password, 10);
//   return prisma.user.create({
//     data: { email, passwordHash },
//   });
// }

export async function login({ email, password }: LoginForm) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'RJ_session',
      secure: true,
      secrets: [sessionSecret],
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 90, // 90 days
      httpOnly: true,
    },
  });

export function getUserSession(request: Request) {
  return getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') return null;
  return userId;
}

export async function requireUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') throw redirect('/login');
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== 'string') return null;

  try {
    const user = await getUserById(userId);
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return redirect('/login', {
    headers: { 'Set-Cookie': await destroySession(session) },
  });
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}
