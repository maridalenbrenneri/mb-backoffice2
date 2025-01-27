import { z } from "zod";

export const WooProductData = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  stock_status: z.string(),
  date_created: z.string().nullable(),
  date_modified: z.string(),
  permalink: z.string(),
});

export const WooProductUpdateData = z.object({
  status: z.string().optional(),
  stock_status: z.string().optional(),
});

export type WooProduct = z.infer<typeof WooProductData>;
export type WooProductUpdate = z.infer<typeof WooProductUpdateData>;
