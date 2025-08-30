import { WOO_API_BASE_URL } from './constants';
import type { WooProductUpdate } from './products/types';

export default async function productUpdate(
  wooProductId: number,
  data: WooProductUpdate
) {
  if (process.env.WOO_ALLOW_UPDATE !== 'true') {
    return { error: 'Woo Update not enabled' };
  }

  const url = `${WOO_API_BASE_URL}products/${wooProductId}?${process.env.WOO_SECRET_PARAM}`;

  console.debug(
    `UPDATING PRODUCT ${wooProductId} IN WOO, ${JSON.stringify(data)}`
  );

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (response.status !== 200) {
    return {
      kind: 'error',
      error: `Woo Update failed: ${json.message}`,
    };
  }

  return {
    kind: 'success',
    productId: json.id,
  };
}
