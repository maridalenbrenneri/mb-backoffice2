import { prisma } from "~/db.server";

import type { WooImportResult } from "@prisma/client";
export type { WooImportResult };

export async function getWooImportResults() {
  return prisma.wooImportResult.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function createWooImportResult(
  result: Pick<WooImportResult, "result">
) {
  await prisma.wooImportResult.create({ data: result });
}
