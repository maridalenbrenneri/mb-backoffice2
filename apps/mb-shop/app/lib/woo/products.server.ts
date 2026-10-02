import { z } from "zod";

import { WOO_API_BASE_URL, WOO_PRODUCTS_PER_PAGE } from "~/constants";
import { getWooSecretParam } from "~/lib/env.server";
import { WooProductSchema, type WooProduct } from "./types";

export async function fetchPublishedProducts(): Promise<WooProduct[]> {
  const url =
    `${WOO_API_BASE_URL}products` +
    `?status=publish` +
    `&per_page=${WOO_PRODUCTS_PER_PAGE}` +
    `&orderby=title&order=asc` +
    `&${getWooSecretParam()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch products (${response.status} ${response.statusText})`
    );
  }

  const parsed = z.array(WooProductSchema).safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(
      `Unable to parse Woo product data: ${parsed.error.message}`
    );
  }

  return parsed.data.filter(
    (product) =>
      product.status !== "private" && product.catalog_visibility !== "hidden"
  );
}
