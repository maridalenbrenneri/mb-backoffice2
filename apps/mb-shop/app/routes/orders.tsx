import { Form, Link } from "react-router";

import { requireCustomerSession } from "~/lib/session.server";
import { fetchOrdersForCustomer } from "~/lib/woo/orders.server";
import type { Route } from "./+types/orders";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mine ordrer — Maridalen Brenneri" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const customer = await requireCustomerSession(request);
  const orders = await fetchOrdersForCustomer(customer.customerId);
  return { customer, orders };
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(total: string, currency: string) {
  const amount = Number(total);
  if (Number.isNaN(amount)) {
    return `${total} ${currency}`;
  }
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency,
  }).format(amount);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Avventer",
    processing: "Behandles",
    "on-hold": "På vent",
    completed: "Fullført",
    cancelled: "Kansellert",
    refunded: "Refundert",
    failed: "Feilet",
  };
  return labels[status] ?? status;
}

export default function Orders({ loaderData }: Route.ComponentProps) {
  const { customer, orders } = loaderData;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
            Maridalen Brenneri
          </p>
          <h1 className="mt-2 font-display text-4xl text-brand">Mine ordrer</h1>
          <p className="mt-1 text-stone-600">{customer.displayName}</p>
        </div>
        <Form method="post" action="/logout">
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Logg ut
          </button>
        </Form>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center">
          <p className="text-stone-700">Du har ingen ordrer ennå.</p>
          <Link
            to="https://maridalenbrenneri.no"
            className="mt-3 inline-block text-sm text-accent underline"
          >
            Gå til nettbutikken
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-lg border border-stone-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-brand">
                  Ordre #{order.number}
                </h2>
                <span className="text-sm text-stone-500">
                  {formatDate(order.date_created)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                <span>{statusLabel(order.status)}</span>
                <span>{formatMoney(order.total, order.currency)}</span>
                {order.payment_method_title ? (
                  <span>{order.payment_method_title}</span>
                ) : null}
              </div>

              <ul className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-sm text-stone-700">
                {order.line_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="shrink-0 text-stone-500">
                      {formatMoney(item.total, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
