import { DateTime } from 'luxon';

import {
  WOO_ABO_PRODUCT_VARIATION_1_1,
  WOO_ABO_PRODUCT_VARIATION_1_2,
  WOO_ABO_PRODUCT_VARIATION_2_1,
  WOO_ABO_PRODUCT_VARIATION_2_2,
  WOO_ABO_PRODUCT_VARIATION_3_1,
  WOO_ABO_PRODUCT_VARIATION_3_2,
  WOO_ABO_PRODUCT_VARIATION_4_1,
  WOO_ABO_PRODUCT_VARIATION_4_2,
  WOO_ABO_PRODUCT_VARIATION_5_1,
  WOO_ABO_PRODUCT_VARIATION_5_2,
  WOO_ABO_PRODUCT_VARIATION_6_1,
  WOO_ABO_PRODUCT_VARIATION_6_2,
  WOO_ABO_PRODUCT_VARIATION_7_1,
  WOO_ABO_PRODUCT_VARIATION_7_2,
} from '../../core/settings';

function resolveType(price: number, wooSubscriptions: any[]) {
  let total = 0;
  let ABO1 = 0;
  let ABO2 = 0;
  let ABO3 = 0;
  let ABO4 = 0;
  let ABO5 = 0;
  let ABO6 = 0;
  let ABO7 = 0;

  let price1 = price + 30;
  let price2 = price * 2 + 30;
  let price3 = price * 3 + 30;
  let price4 = price * 4 + 30;
  let price5 = price * 5 + 30;
  let price6 = price * 6 + 30;
  let price7 = price * 7 + 30;

  let couponCount = 0;

  const emails = [];

  for (const s of wooSubscriptions) {
    const variation = s.line_items[0].variation_id;

    if (
      (variation === WOO_ABO_PRODUCT_VARIATION_1_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_1_2) &&
      s.total === `${price1}.00`
    ) {
      //   console.log(`ABO1 ${price + 30}`, s.id);
      total++;
      ABO1++;
      emails.push(s.billing.email);
    } else if (
      (variation === WOO_ABO_PRODUCT_VARIATION_2_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_2_2) &&
      s.total === `${price2}.00`
    ) {
      //   console.log(`ABO2 ${price2 + 30}`, s.id);
      total++;
      ABO2++;
      emails.push(s.billing.email);
    } else if (
      (variation === WOO_ABO_PRODUCT_VARIATION_3_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_3_2) &&
      s.total === `${price3}.00`
    ) {
      //   console.log(`ABO3 ${price3 + 30}`, s.id);
      total++;
      ABO3++;
      emails.push(s.billing.email);
    } else if (
      (variation === WOO_ABO_PRODUCT_VARIATION_4_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_4_2) &&
      s.total === `${price4}.00`
    ) {
      //   console.log(`ABO4 ${price4}`, s.id);
      total++;
      ABO4++;
    } else if (
      (variation === WOO_ABO_PRODUCT_VARIATION_5_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_5_2) &&
      s.total === `${price5}.00`
    ) {
      //   console.log(`ABO5 ${price5}`, s.id);
      total++;
      ABO5++;
      emails.push(s.billing.email);
    } else if (
      (variation === WOO_ABO_PRODUCT_VARIATION_6_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_6_2) &&
      s.total === `${price6}.00`
    ) {
      //   console.log(`ABO6 ${price6}`, s.id);
      total++;
      ABO6++;
      emails.push(s.billing.email);
    } else if (
      (variation === WOO_ABO_PRODUCT_VARIATION_7_1 ||
        variation === WOO_ABO_PRODUCT_VARIATION_7_2) &&
      s.total === `${price7}.00`
    ) {
      //   console.log(`ABO7 ${price7}`, s.id);
      total++;
      ABO7++;
      emails.push(s.billing.email);
    } else if (s.coupon_lines?.length) {
      couponCount++;
      emails.push(s.billing.email);

      //   const code = s.coupon_lines[0].code;
      //   if (code === "nullfrakt2018") {
      //     console.log("nullfrakt2018", s.total);
      //   } else if (code === "pettererbestabo") {
      //     console.log("pettererbestabo", s.total);
      //   } else if (code === "abo90") {
      //     console.log("abo90", s.total);
      //   } else if (code === "abo110-90") {
      //     console.log("abo110-90", s.total);
      //   } else {
      //     console.log("OTHER COUPON", code, s.total);
      //   }
    }

    if (s.coupon_lines?.length) {
      console.log(JSON.stringify(s.coupon_lines));
    }
  }

  return {
    total,
    ABO1,
    ABO2,
    ABO3,
    ABO4,
    ABO5,
    ABO6,
    ABO7,
    emails,
    couponCount,
  };
}

async function writeToCsv(emails: string[]) {
  const fs = require('fs');

  const filename = `emails_abos_with_discount_${DateTime.now().toFormat(
    'yyyy-MM-dd_HHmmss'
  )}.csv`;

  await fs.appendFileSync(filename, 'EMAILS\n');

  for (const e of emails) {
    await fs.appendFileSync(filename, e + '\n');
  }

  // fs.writeFileSync(
  //   `emails_abos_with_discount_${DateTime.now().toFormat(
  //     "yyyy-MM-dd_HHmmss"
  //   )}.csv`,
  //   data
  // );
}

export async function report_getInfoForDiscountSubscriptions(
  wooSubscriptions: any[]
) {
  console.log(wooSubscriptions[0]);
  // console.log(wooSubscriptions[0].line_items);
  // console.log(wooSubscriptions[0].shipping_lines);

  const abo90s = resolveType(90, wooSubscriptions);
  const abo100s = resolveType(100, wooSubscriptions);
  const abo110s = resolveType(110, wooSubscriptions);
  const abo120s = resolveType(120, wooSubscriptions);

  // const emails = [...abo90s.emails, ...abo100s.emails, ...abo110s.emails];
  // writeToCsv(emails);

  console.log('ABO NOK 90.00: ', abo90s);
  console.log('ABO NOK 100.00: ', abo100s);
  console.log('ABO NOK 110.00: ', abo110s);
  console.log('ABO NOK 120.00', abo120s);
}
