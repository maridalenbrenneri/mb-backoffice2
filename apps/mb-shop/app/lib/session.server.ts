import { createCookieSessionStorage, redirect } from "react-router";

import { getSessionSecret } from "./env.server";

export type CustomerSession = {
  customerId: number;
  email: string;
  displayName: string;
};

type SessionData = {
  customerId: number;
  email: string;
  displayName: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__mb_shop_session",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: [getSessionSecret()],
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    },
  });

export async function getCustomerSession(
  request: Request
): Promise<CustomerSession | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const customerId = session.get("customerId");
  const email = session.get("email");
  const displayName = session.get("displayName");

  if (
    typeof customerId !== "number" ||
    typeof email !== "string" ||
    typeof displayName !== "string"
  ) {
    return null;
  }

  return { customerId, email, displayName };
}

export async function requireCustomerSession(request: Request) {
  const customer = await getCustomerSession(request);
  if (!customer) {
    throw redirect("/login");
  }
  return customer;
}

export async function createCustomerSession(
  customer: CustomerSession,
  redirectTo: string
) {
  const session = await getSession();
  session.set("customerId", customer.customerId);
  session.set("email", customer.email);
  session.set("displayName", customer.displayName);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
