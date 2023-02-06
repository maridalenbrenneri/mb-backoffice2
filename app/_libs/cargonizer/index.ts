import { XMLParser, XMLBuilder } from 'fast-xml-parser';

import type { Order } from '@prisma/client';
import { SubscriptionType } from '@prisma/client';

import type {
  CargonizerConsignment,
  SendConsignmentInput,
  SendOrderResult,
} from './models';
import * as settings from '../core/settings';
import {
  calculateWeight,
  generateReference,
} from '../core/services/order-service';

const api_key = process.env.CARGONIZER_API_KEY;
const sender_id = settings.CARGONIZER_SENDER_ID;
const transport_agreement = settings.CARGONIZER_TRANSPORT_AGREEMENT;

const consignment_url = `${settings.CARGONIZER_API_URL}//consignments.xml`;
const service_partners_url = `${settings.CARGONIZER_API_URL}/service_partners.xml`;
const profile_url = `${settings.CARGONIZER_API_URL}/profile.xml`;
const print_url = `${settings.CARGONIZER_API_URL}/consignments/label_direct`;

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
  if (!process.env.CARGONIZER_ENABLED)
    return {
      orderId: input.order.id,
      consignmentId: 0,
      trackingUrl: null,
      error: 'Cargonizer not enabled',
    };

  const order = input.order;

  if (!order) throw new Error('Order was null');

  console.debug('[Cargonizer] Creating consignment for order', order.id);

  const consignmentCreate = mapToCargonizerConsignment(order);

  const servicePartner = await requestServicePartners(
    consignmentCreate.customer.country,
    consignmentCreate.customer.postcode
  );
  if (servicePartner.error) {
    throw new Error(
      `Error when requesting Cargonizer service partners. Is postcode correct? Order ${input.order.id} Postcode: "${consignmentCreate.customer.postcode}" Error msg: "${servicePartner.error}"`
    );
  }

  const xml = await createConsignmentXml(consignmentCreate, servicePartner);

  // console.debug('CONSIGNMENT XML TO BE SENT TO CARGONIZER', xml);

  const consignment = await requestConsignment(xml);
  if (consignment.error) {
    throw new Error(
      `Error creating consignment in Cargonizer. Order ${input.order.id} Error msg: ${consignment.error}`
    );
  }

  let error: string | undefined = undefined;

  return {
    orderId: input.order.id,
    consignmentId: consignment.id,
    trackingUrl: consignment['tracking-url'],
    error,
  };
};

export async function printConsignmentLabels(consignmentIds: number[]) {
  let idsParam = '';
  for (const id of consignmentIds) {
    idsParam = `${idsParam}&consignment_ids[]=${id}`;
  }

  const url = `${print_url}?printer_id=${settings.CARGONIZER_PRINTER_ID}${idsParam}`;

  console.debug('PRINTING CONSIGNMENT LABELS FOR IDs', consignmentIds);
  console.debug('PRINT URL', url);

  try {
    const response = await fetch(url, { method: 'post', headers });
    const xml = await response.text();
    const json = new XMLParser().parse(xml);

    console.debug('PRINT RESPONSE', xml);

    throwIfAnyError(json.errors);

    return { result: 'Success', ids: consignmentIds };
  } catch (err) {
    console.warn(
      '[Cargonizer] Error when printing Cargonizer label. Message: ',
      err.message
    );
    return {
      result: 'Failed',
      error: err.message,
    };
  }
}

function mapToCargonizerConsignment(order: Order) {
  const reference = generateReference(order);
  const weight = calculateWeight(order);
  const shippingType =
    order.subscription.type === SubscriptionType.B2B
      ? shipping_type_standard_business
      : shipping_type_standard_private;

  return {
    shippingType,
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
}

function throwIfAnyError(errors: any) {
  // CARGONIZER SOMETIMES RETURN AN ARRAY AND SOMETIMES ONE OBJECT IN "errors"

  if (!errors) return;

  const isArray = Array.isArray(errors);

  if (isArray && !errors.length) return;
  if (!isArray && !errors.error) return;

  const errorMsg = isArray && errors.length ? errors.join(' | ') : errors.error;

  throw new Error(errorMsg);
}

async function requestConsignment(consignmentXml: string) {
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

    throwIfAnyError(data.consignments.consignment.errors);

    return data.consignments.consignment;
  } catch (err) {
    console.warn(`[Cargonizer] Error creating consignment: ${err.message}`);
    return {
      error: err.message,
    };
  }
}

async function requestServicePartners(country: string, postcode: string) {
  const url = `${service_partners_url}?country=${country}&postcode=${postcode}`;

  try {
    const response = await fetch(url, { headers: headers });
    const xml = await response.text();
    const json = new XMLParser().parse(xml);

    throwIfAnyError(json.errors);

    const partner = json.results['service-partners']['service-partner'][0];

    // console.debug('[Cargonizer] service partner: ', partner.number);

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

async function createConsignmentXml(
  consignment: CargonizerConsignment,
  servicePartner: any
) {
  const weightInKg = consignment.weight / 1000;

  const mapShippingTypeToProduct = (shippingType: number): string => {
    if (shippingType === shipping_type_standard_business)
      return settings.CARGONIZER_PRODUCT_BUSINESS;

    return settings.CARGONIZER_PRODUCT_PRIVATE;
  };

  const product = mapShippingTypeToProduct(consignment.shippingType);

  const services =
    product === settings.CARGONIZER_PRODUCT_PRIVATE
      ? { service: { $id: settings.CARGONIZER_PRODUCT_PRIVATE_SERVICE } }
      : {};

  // console.debug('services', services, product, consignment.customer.name);

  const consignmentJson = {
    consignments: {
      consignment: {
        $transport_agreement: transport_agreement,
        $print: false,
        product,
        parts: {
          consignee: consignment.customer,
          service_partner: servicePartner,
        },
        items: {
          item: {
            $type: 'package',
            $amount: 1,
            $weight: weightInKg,
          },
        },
        services,
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
