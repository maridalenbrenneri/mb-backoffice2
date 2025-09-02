import { z } from 'zod';

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
  name: z.string().optional(),
  short_description: z.string().optional(),
  regular_price: z.string().optional(),
});

export const WooProductCreateData = z.object({
  status: z.string(),
  stock_status: z.string(),
  name: z.string(),
  short_description: z.string().optional(),
  regular_price: z.string().optional(),
  weight: z.string().optional(),
  shipping_class: z.string().optional(),
  categories: z.array(z.object({ id: z.number() })),
});

export type WooProduct = z.infer<typeof WooProductData>;
export type WooProductCreate = z.infer<typeof WooProductCreateData>;
export type WooProductUpdate = z.infer<typeof WooProductUpdateData>;
