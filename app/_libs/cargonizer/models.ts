import type { Order } from '@prisma/client';

export interface ConsignmentInput {
  order: Order;
  print: boolean;
}
