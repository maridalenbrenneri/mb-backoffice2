import { DateTime } from "luxon";

import { SubscriptionStatus } from "~/_libs/core/models/subscription.server";
import { resolveNextDeliveryDay } from "./dates";

export function resolveStatusAndFirstDeliveryDate(
  duration_months: number,
  date?: DateTime
): { firstDeliveryDate: DateTime; status: SubscriptionStatus } {
  date = date || DateTime.now();

  const firstDeliveryDate = resolveNextDeliveryDay(date);

  const last = firstDeliveryDate
    .plus({ months: duration_months })
    .startOf("month")
    .plus({ days: 7 })
    .startOf("day");

  const today = DateTime.now().startOf("day");

  console.log("TODAY", "LAST", today.toISODate(), last.toISODate());

  const status =
    today <= last ? SubscriptionStatus.ACTIVE : SubscriptionStatus.COMPLETED;

  return {
    firstDeliveryDate,
    status,
  };
}
