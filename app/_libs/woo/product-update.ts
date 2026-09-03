import { WOO_API_BASE_URL } from './constants';
import type { WooProductUpdate } from './products/types';

async function doRequest(wooProductId: number, data: any) {
  if (process.env.WOO_ALLOW_UPDATE !== 'true') {
    return { kind: 'error' as const, error: 'Woo Update not enabled' };
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
    let details = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.message) details = body.message;
    } catch {
      // Keep status text when Woo does not return JSON
    }

    return {
      kind: 'error' as const,
      error: `Woo Update failed: ${details}`,
    };
  }

  const json = await response.json();

  return {
    kind: 'success' as const,
    productId: json.id as number,
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

export async function productPublish(wooProductId: number, publish = true) {
  console.debug(
    publish
      ? `PUBLISHING PRODUCT ${wooProductId} IN WOO`
      : `UNPUBLISHING PRODUCT ${wooProductId} IN WOO`
  );

  return await doRequest(wooProductId, {
    status: publish ? 'publish' : 'draft',
  });
}
