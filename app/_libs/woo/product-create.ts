import { WOO_API_BASE_URL } from './constants';
import type { WooProductCreate } from './products/types';

export default async function productCreate(data: WooProductCreate) {
  if (process.env.WOO_ALLOW_UPDATE !== 'true') {
    return { error: 'Woo Update not enabled' };
  }

  const url = `${WOO_API_BASE_URL}products?${process.env.WOO_SECRET_PARAM}`;

  console.debug(`CREATING PRODUCT IN WOO, ${JSON.stringify(data)}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (response.status !== 200) {
    return {
      kind: 'error',
      error: `Woo Create Product failed: ${json.message}`,
    };
  }

  return {
    kind: 'success',
    productId: json.id,
  };
}
