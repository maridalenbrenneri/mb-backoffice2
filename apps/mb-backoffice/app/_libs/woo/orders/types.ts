import { z } from 'zod';

export const WooOrderMetaDataData = z.object({
  id: z.number(),
  key: z.string(),
  value: z.any(),
});

export const WooOrderLineItemData = z.object({
  id: z.number(),
  product_id: z.number(),
  variation_id: z.number(),
  name: z.string(),
  quantity: z.number(),
  meta_data: z.array(WooOrderMetaDataData),
});

export const WooOrderData = z.object({
  id: z.number(),
  number: z.string(),
  status: z.string(),
  payment_method: z.string(),
  customer_id: z.number(),

  created_via: z.string(),
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

  coupon_lines: z.array(
    z.object({
      code: z.string(),
    })
  ),

  line_items: z.array(WooOrderLineItemData),

  meta_data: z.array(WooOrderMetaDataData),
});

export type WooOrderMetaData = z.infer<typeof WooOrderMetaDataData>;
export type WooOrderLineItem = z.infer<typeof WooOrderLineItemData>;
export type WooOrder = z.infer<typeof WooOrderData>;
