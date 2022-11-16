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
    street1: string;
    street2: string;
    zipCode: string;
    place: string;
    country: string;
    contactPerson: string;
  };
}
