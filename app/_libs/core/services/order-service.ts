import type { Delivery, Order, Subscription } from '@prisma/client';

export async function createOrder(order: Order) {}

export async function createRecurringOrder(
  subscription: Subscription,
  delivery: Delivery
) {}
