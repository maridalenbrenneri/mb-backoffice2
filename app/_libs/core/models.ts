// MODELS NOT STORED IN DATABASE

export interface MBCustomer {
  fikenCustomerId: number;
}

export interface CreateOrderItemInput {
  type: 'coffee' | 'other';
  productId: number; // coffeeId if type coffee
  size: number;
  quantity: number;
}

export interface CreateOrderInput {
  source: 'MB' | 'Woo';
  deliveryId: number;
  customer: MBCustomer;
  items: CreateOrderItemInput[];
  deliveryByMail: boolean;
  wooOrderId: number;
}
