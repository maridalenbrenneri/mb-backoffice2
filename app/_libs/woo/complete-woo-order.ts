import { WOO_API_BASE_URL } from './constants';

export default async function completeWooOrder(wooOrderId: number) {
  if (!process.env.WOO_ALLOW_UPDATE) return { error: 'Woo Update not enabled' };

  const url = `${WOO_API_BASE_URL}orders/${wooOrderId}?${process.env.WOO_SECRET_PARAM}`;

  console.debug(`UPDATING ORDER ${wooOrderId} IN WOO...`);

  const data = {
    status: 'completed',
  };

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
      error: `Woo Update failed: ${json.message}`,
    };
  }

  return { orderId: json.id, orderStatus: json.status };
}
