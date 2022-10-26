import { prisma } from "~/db.server";

import type { Coffee } from "@prisma/client";
export type { Coffee };

export async function getCoffees() {
  return prisma.coffee.findMany();
}

export async function getCoffee(id: number) {
  return prisma.coffee.findUnique({ where: { id } });
}

export async function upsertCoffee(
  coffee: Pick<Coffee, "id" | "name" | "productCode" | "country" | "status">
) {
  return prisma.coffee.upsert({
    where: {
      id: coffee.id || 0,
    },
    update: coffee,
    create: {
      name: coffee.name,
      productCode: coffee.productCode,
      country: coffee.country,
      status: coffee.status,
    },
  });
}
