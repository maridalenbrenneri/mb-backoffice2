import { z } from "zod";

import { WP_JWT_TOKEN_URL, WOO_API_BASE_URL } from "~/constants";
import { getWooSecretParam } from "~/lib/env.server";
import { WooCustomerSchema, type WooCustomer } from "./types";

const JwtTokenSchema = z.object({
  token: z.string(),
  user_email: z.string().email(),
  user_nicename: z.string(),
  user_display_name: z.string(),
});

export type AuthenticatedCustomer = {
  customerId: number;
  email: string;
  displayName: string;
};

export type AuthResult =
  | { ok: true; customer: AuthenticatedCustomer }
  | { ok: false; error: string };

async function findCustomerByEmail(email: string): Promise<WooCustomer | null> {
  const url = `${WOO_API_BASE_URL}customers?email=${encodeURIComponent(
    email
  )}&role=all&${getWooSecretParam()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Woo customer lookup failed (${response.status} ${response.statusText})`
    );
  }

  const parsed = z.array(WooCustomerSchema).safeParse(await response.json());
  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  return parsed.data[0];
}

export async function authenticateCustomer(
  username: string,
  password: string
): Promise<AuthResult> {
  const response = await fetch(WP_JWT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const body = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: "Ugyldig brukernavn eller passord.",
    };
  }

  const token = JwtTokenSchema.safeParse(body);
  if (!token.success) {
    return { ok: false, error: "Innlogging feilet. Prøv igjen." };
  }

  const customer = await findCustomerByEmail(token.data.user_email);
  if (!customer) {
    return {
      ok: false,
      error: "Fant ingen kundekonto knyttet til denne brukeren.",
    };
  }

  return {
    ok: true,
    customer: {
      customerId: customer.id,
      email: customer.email,
      displayName:
        token.data.user_display_name ||
        [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
        customer.email,
    },
  };
}
