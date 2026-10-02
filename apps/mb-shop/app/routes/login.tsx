import { Form, redirect, useActionData, useNavigation } from "react-router";

import { authenticateCustomer } from "~/lib/woo/auth.server";
import {
  createCustomerSession,
  getCustomerSession,
} from "~/lib/session.server";
import type { Route } from "./+types/login";

type ActionData = {
  error?: string;
  username?: string;
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "Logg inn — Maridalen Brenneri" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const customer = await getCustomerSession(request);
  if (customer) {
    throw redirect("/orders");
  }
  return null;
}

export async function action({
  request,
}: Route.ActionArgs): Promise<Response | ActionData> {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return {
      error: "Fyll inn brukernavn/e-post og passord.",
      username,
    };
  }

  const result = await authenticateCustomer(username, password);
  if (!result.ok) {
    return { error: result.error, username };
  }

  return createCustomerSession(result.customer, "/orders");
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
          Maridalen Brenneri
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand">Logg inn</h1>
        <p className="mt-2 text-stone-600">
          Bruk kontoen din fra maridalenbrenneri.no
        </p>
      </div>

      <Form method="post" className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">
            E-post eller brukernavn
          </span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            required
            defaultValue={actionData?.username ?? ""}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Passord</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        {actionData?.error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {actionData.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-cream transition hover:bg-brand/90 disabled:opacity-60"
        >
          {busy ? "Logger inn…" : "Logg inn"}
        </button>
      </Form>
    </main>
  );
}
