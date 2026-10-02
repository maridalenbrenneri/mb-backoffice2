import { WOO_API_BASE_URL } from './constants';

async function doRequest(wooProductId: number) {
  if (process.env.WOO_ALLOW_UPDATE !== 'true') {
    return { kind: 'error', error: 'Woo Update not enabled' };
  }

  const url = `${WOO_API_BASE_URL}products/${wooProductId}?${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    return {
      kind: 'error',
      error: `Woo Delete failed: ${response.status} ${response.statusText}`,
    };
  }

  const json = await response.json();

  return {
    kind: 'success',
    productId: json.id,
  };
}

export async function productDelete(wooProductId: number) {
  console.debug(`DELETING PRODUCT ${wooProductId} IN WOO`);

  return await doRequest(wooProductId);
}
