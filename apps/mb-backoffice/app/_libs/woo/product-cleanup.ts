import { WOO_API_BASE_URL } from './constants';

export default async function wooProductCleanup(
  wooProductIds: number[]
): Promise<
  | { kind: 'success'; wooProductIds: number[] }
  | { kind: 'error'; error: string }
> {
  if (process.env.WOO_ALLOW_UPDATE !== 'true') {
    return { kind: 'error', error: 'Woo Update not enabled' };
  }

  if (wooProductIds.length === 0) {
    return { kind: 'success', wooProductIds: [] };
  }

  let productIdsString = wooProductIds.join(',');

  const url = `${WOO_API_BASE_URL}products?per_page=100&include=${productIdsString}&${process.env.WOO_SECRET_PARAM}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    return {
      kind: 'error',
      error: `Failed to fetch products from Woo: ${response.statusText}`,
    };
  }

  const json = await response.json();
  let productIdsFound = json.map((p: any) => p.id);

  let producIdsNotInWoo = wooProductIds.filter(
    (p) => !productIdsFound.includes(p)
  );

  return {
    kind: 'success',
    wooProductIds: producIdsNotInWoo,
  };
}
