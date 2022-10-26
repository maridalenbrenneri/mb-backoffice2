import { prisma } from "~/db.server";

import type { Delivery } from "@prisma/client";
export type { Delivery };
export type DeliveryUpsertData = Pick<Delivery, "id" | "date" | "type" | "coffee1Id" | "coffee2Id" | "coffee3Id" | "coffee4Id">

export async function getDeliveries() {
  return prisma.delivery.findMany({
      include: {
        coffee1: true,
        coffee2: true,
        coffee3: true,
        coffee4: true
      },
      orderBy: {
        date: 'desc',
      },
      take: 10
    }
  );
}

export async function getDelivery(id: number) {
  return prisma.delivery.findUnique({ 
      where: { id },       
      include: {
        coffee1: true,
        coffee2: true,
        coffee3: true,
        coffee4: true
      } 
  });
}

export async function upsertDelivery(delivery: DeliveryUpsertData) { 
  return prisma.delivery.upsert({
    where: {
      id: delivery.id || 0,
    },
    update: delivery,
    create: {
      date: delivery.date,
      type: delivery.type,
      coffee1Id: delivery.coffee1Id || null,
      coffee2Id: delivery.coffee2Id || null,
      coffee3Id: delivery.coffee3Id || null,
      coffee4Id: delivery.coffee4Id || null,
    },
  });
}
