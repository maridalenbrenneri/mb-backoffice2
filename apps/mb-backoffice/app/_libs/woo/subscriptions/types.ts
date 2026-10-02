import { z } from 'zod';

export const WooSubscriptionLineItemData = z.object({
  id: z.number(),
  product_id: z.number(),
  variation_id: z.number(),
  name: z.string(),
});

export const WooSubscriptionData = z.object({
  id: z.number(),
  customer_id: z.number(),
  status: z.string(),
  created_via: z.string(),

  next_payment_date_gmt: z.string(),

  date_created: z.string(),
  date_modified: z.string(),

  shipping: z.object({
    first_name: z.string(),
    last_name: z.string(),
    address_1: z.string(),
    address_2: z.string().nullable(),
    postcode: z.string(),
    city: z.string(),
  }),

  billing: z.object({
    first_name: z.string(),
    last_name: z.string(),
    address_1: z.string(),
    address_2: z.string().nullable(),
    postcode: z.string(),
    city: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
  }),

  customer_note: z.string().nullable(),

  line_items: z.array(WooSubscriptionLineItemData),

  coupon_lines: z.array(z.object({ code: z.string() })),
});

export type WooSubscriptionLineItem = z.infer<
  typeof WooSubscriptionLineItemData
>;
export type WooSubscription = z.infer<typeof WooSubscriptionData>;
