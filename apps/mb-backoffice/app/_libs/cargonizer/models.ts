import type { OrderEntity } from '~/services/entities';

export interface SendConsignmentInput {
  order: OrderEntity;
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
  trackingUrl?: string | null | undefined;
  error: string | undefined;
}
