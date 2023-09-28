import type { Order, OrderItem } from '@prisma/client';
import { OrderStatus, OrderType } from '@prisma/client';

export type { Order };

export { OrderStatus, OrderType };

export type OrderItemUpsertData = Pick<
  OrderItem,
  'orderId' | 'coffeeId' | 'variation' | 'quantity'
>;
