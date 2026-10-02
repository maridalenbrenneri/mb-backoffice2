import { z } from "zod";

import { WOO_API_BASE_URL, WOO_ORDERS_PER_PAGE } from "~/constants";
import { getWooSecretParam } from "~/lib/env.server";
import { WooOrderSchema, type WooOrder } from "./types";

export async function fetchOrdersForCustomer(
  customerId: number
): Promise<WooOrder[]> {
  const url =
    `${WOO_API_BASE_URL}orders` +
    `?customer=${customerId}` +
    `&per_page=${WOO_ORDERS_PER_PAGE}` +
    `&orderby=date&order=desc` +
    `&${getWooSecretParam()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch orders (${response.status} ${response.statusText})`
    );
  }

  const parsed = z.array(WooOrderSchema).safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Unable to parse Woo order data: ${parsed.error.message}`);
  }

  return parsed.data;
}
