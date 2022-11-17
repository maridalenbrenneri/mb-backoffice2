import { XMLParser, XMLBuilder } from 'fast-xml-parser';

import type {
  CargonizerConsignment,
  SendConsignmentInput,
  SendOrderResult,
} from './models';
import * as settings from './settings';

const WEIGHT_NORMAL_BAG = 250;
const WEIGHT_PACKAGING = 150;

const api_key = process.env.CARGONIZER_API_KEY as string;
const sender_id = process.env.CARGONIZER_SENDER_ID as string;
const transport_agreement = process.env.CARGONIZER_TRANSPORT_AGREEMENT;

const consignment_url = `${process.env.CARGONIZER_API_URL}//consignments.xml`;
const service_partners_url = `${process.env.CARGONIZER_API_URL}/service_partners.xml`;
const profile_url = `${process.env.CARGONIZER_API_URL}/profile.xml`;
const print_url = `${process.env.CARGONIZER_API_URL}/consignments/label_direct.xml`;

const shipping_type_standard_private = 1;
const shipping_type_standard_business = 2;

const headers = {
  'X-Cargonizer-Key': api_key,
  'X-Cargonizer-Sender': sender_id,
};

export async function getCargonizerProfile() {
  try {
    const response = await fetch(profile_url, { headers });
    const xml = await response.text();

    if (!response.body) throw new Error('[Cargonizer] Profile returned null');

    return new XMLParser().parse(xml);
  } catch (err) {
    const error = `[Cargonizer] Error when fetching profile: ${err.message}`;
    console.warn(error);
    return {
      error,
    };
  }
}

export const sendConsignment = async (
  input: SendConsignmentInput
): Promise<SendOrderResult> => {
  const order = input.order;

  if (!order) {
    throw new Error('Order was null');
  }

  let reference = '';
  let weight = 0;

  console.log('ORDER', order.orderItems);

  // TODO: Create "resolveReferenceForOrder" function
  for (const item of order.orderItems) {
    reference = `${reference} ${item.quantity}${item.mbProductCode}`;
    weight += WEIGHT_NORMAL_BAG * item.quantity;
  }

  if (order.quantity250) {
    reference = `${reference} ${order.quantity250}${'TEST'}`;
  }

  weight += WEIGHT_PACKAGING;

  const consignmentCreate: CargonizerConsignment = {
    shippingType: shipping_type_standard_business, // TODO: Resolve from order if private or b2b
    reference,
    weight,
    customer: {
      name: order.name,
      email: order.email || '',
      mobile: order.mobile || '',
      address1: order.address1,
      address2: order.address2 || '',
      postcode: order.postalCode,
      city: order.postalPlace,
      country: 'NO',
    },
  };

  console.debug('SENDING ORDER TO CARGONIZER', consignmentCreate);

  const xml = await createConsignmentXml(consignmentCreate);

  console.debug('XML', xml);

  const errors: string[] = [];

  const consignment = await requestConsignment(xml);
  if (consignment.error) {
    errors.push(consignment.error);
  }

  let printResult;
  if (input.print) {
    printResult = await printLabel(consignment.id);
    if (printResult.error) {
      errors.push(consignment.error);
    }
  }

  if (errors.length) {
    return {
      orderId: input.order.id,
      errors,
    };
  }

  return {
    orderId: input.order.id,
    consignmentId: consignment.id,
    trackingUrl: consignment['tracking-url'],
    printResult: input.print ? printResult?.result : 'Not requested',
    errors: [],
  };
};

async function printLabel(consignmentId: number) {
  let url = `${print_url}?printer_id=${settings.CARGONIZER_PRINTER_ID}&consignment_ids[${consignmentId}]=`;

  try {
    const response = await fetch(url, { method: 'post', headers });
    const xml = await response.text();
    const json = new XMLParser().parse(xml);

    console.debug('PRINT RESULT', json);

    if (json.errors) {
      throw new Error(JSON.stringify(json.errors));
    }

    return { result: JSON.stringify(json) }; // TODO: WHAT TO RETURN?
  } catch (err) {
    console.warn(
      '[Cargonizer] Error when printing Cargonizer label',
      err.message
    );
    return {
      error: err.message,
    };
  }
}

async function requestConsignment(
  consignmentXml: string,
  print: boolean = true
) {
  try {
    const response = await fetch(consignment_url, {
      method: 'post',
      headers: {
        ...headers,
        'Content-length': `${consignmentXml.length}`,
      },
      body: consignmentXml,
    });

    const xml = await response.text();
    const data = new XMLParser().parse(xml);

    const errors = data.consignments.consignment.errors?.error;
    if (errors) {
      throw new Error(
        `Status: ${response.status} Errors: ${JSON.stringify(errors)}`
      );
    }

    return data.consignments.consignment;
  } catch (err) {
    console.warn(`[Cargonizer] Error creating consignment: ${err.message}`);
    return {
      error: err.message,
    };
  }
}

function isUsingSandbox(): boolean {
  return !!process.env.CARGONIZER_API_URL?.includes('sandbox');
}

async function requestServicePartners(country: string, postcode: string) {
  const url = `${service_partners_url}?country=${country}&postcode=${postcode}`;

  try {
    const response = await fetch(url, { headers: headers });
    const xml = await response.text();
    const json = new XMLParser().parse(xml);

    if (json.errors) {
      throw new Error(
        `Status: ${response.status} Errors: ${JSON.stringify(json.errors)}`
      );
    }

    const partner = json.results['service-partners']['service-partner'][0];

    console.debug('[Cargonizer] service partner: ', partner.number);

    return {
      number: partner.number,
      name: partner.name,
      address1: partner.address1,
      address2: partner.address2,
      postcode: partner.postcode,
      city: partner.city,
      country: partner.country,
    };
  } catch (err) {
    console.warn(
      `[Cargonizer] Error when fetching service parthers: ${err.message}`
    );
    return {
      error: err.message,
    };
  }
}

async function createConsignmentXml(consignment: CargonizerConsignment) {
  const weightInKg = consignment.weight / 1000;

  const service_partner = await requestServicePartners(
    'NO',
    consignment.customer.postcode
  );

  const mapShippingTypeToProduct = (shippingType: number): string => {
    if (isUsingSandbox()) return 'bring2_format_big';

    if (shippingType === shipping_type_standard_business)
      return settings.CARGONIZER_PRODUCT_BUSINESS;

    return settings.CARGONIZER_PRODUCT_PRIVATE;
  };

  const product = mapShippingTypeToProduct(consignment.shippingType);

  const services =
    product === settings.CARGONIZER_PRODUCT_PRIVATE
      ? { service: settings.CARGONIZER_PRODUCT_PRIVATE_SERVICE }
      : {};

  const consignmentJson = {
    consignments: {
      consignment: {
        $transport_agreement: transport_agreement,
        $print: false,
        product: product,
        parts: {
          consignee: consignment.customer,
          service_partner,
        },
        items: {
          item: {
            $type: 'package',
            $amount: 1,
            $weight: weightInKg,
          },
        },
        services: services,
        references: { consignor: consignment.reference },
        return_address: {
          name: 'Maridalen Brenneri AS',
          address1: 'Sørbråtveien 36',
          postcode: '0891',
          city: 'Oslo',
          country: 'NO',
        },
      },
    },
  };

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    format: true,
  };

  const builder = new XMLBuilder(options);
  return builder.build(consignmentJson);
}
