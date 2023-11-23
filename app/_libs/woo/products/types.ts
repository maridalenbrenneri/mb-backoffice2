import { z } from 'zod';

export const WooProductData = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  stock_status: z.string(),
  date_created: z.string(),
  date_modified: z.string(),
  permalink: z.string(),
});

export type WooProduct = z.infer<typeof WooProductData>;
