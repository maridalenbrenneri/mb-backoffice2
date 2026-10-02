import { z } from "zod";

export const WooCustomerSchema = z.object({
  id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
});

export const WooOrderSchema = z.object({
  id: z.number(),
  number: z.string(),
  status: z.string(),
  date_created: z.string(),
  total: z.string(),
  currency: z.string(),
  payment_method_title: z.string().optional().default(""),
  line_items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number(),
      total: z.string(),
    })
  ),
});

export const WooProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  catalog_visibility: z.string(),
  permalink: z.string(),
  price: z.string(),
  regular_price: z.string(),
  stock_status: z.string(),
  short_description: z.string().optional().default(""),
  images: z.array(
    z.object({
      id: z.number(),
      src: z.string(),
      alt: z.string().optional().default(""),
    })
  ),
});

export type WooCustomer = z.infer<typeof WooCustomerSchema>;
export type WooOrder = z.infer<typeof WooOrderSchema>;
export type WooProduct = z.infer<typeof WooProductSchema>;
