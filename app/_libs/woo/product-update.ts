import { WOO_API_BASE_URL } from './constants';
import type { WooProductUpdate } from './products/types';

async function doRequest(wooProductId: number, data: any) {
  if (process.env.WOO_ALLOW_UPDATE !== 'true') {
    return { kind: 'error', error: 'Woo Update not enabled' };
  }

  const url = `${WOO_API_BASE_URL}products/${wooProductId}?${process.env.WOO_SECRET_PARAM}`;

  let response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status !== 200) {
    return {
      kind: 'error',
      error: `Woo Update failed: ${response.statusText}`,
    };
  }

  const json = await response.json();

  return {
    kind: 'success',
    productId: json.id,
  };
}

export async function productUpdate(
  wooProductId: number,
  data: WooProductUpdate
) {
  console.debug(
    `UPDATING PRODUCT ${wooProductId} IN WOO, ${JSON.stringify(data)}`
  );

  return await doRequest(wooProductId, data);
}

export async function productPublish(wooProductId: number) {
  console.debug(`PUBLISHING PRODUCT ${wooProductId} IN WOO`);

  return await doRequest(wooProductId, { status: 'publish' });
}
