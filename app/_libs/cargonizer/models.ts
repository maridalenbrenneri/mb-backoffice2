import type { Order } from '@prisma/client';

export interface SendConsignmentInput {
  order: Order;
  print: boolean;
}

export interface CargonizerConsignment {
  shippingType: number;
  weight: number;
  reference: string;
  customer: {
    email: string;
    mobile: string;
    name: string;
    address1: string;
    address2: string;
    postcode: string;
    city: string;
    country: string;
  };
}

export interface SendOrderResult {
  orderId: number;
  consignmentId?: number | undefined;
  trackingUrl?: string | undefined;
  printResult?: string | undefined;
  errors: string[];
}
