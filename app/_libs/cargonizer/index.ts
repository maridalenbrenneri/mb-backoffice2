import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

import type { CargonizerConsignment, SendConsignmentInput } from './models';
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

const product_business = 'bring2_business_parcel';
const product_private = 'bring2_small_parcel_a_no_rfid';
const product_private_service = 'bring2_delivery_to_door_handle';

const headers = {
  'X-Cargonizer-Key': api_key,
  'X-Cargonizer-Sender': sender_id,
};

export async function getCargonizerProfile() {
  try {
    const response = await fetch(profile_url, { headers: headers });
    const xml = await response.text();
    console.debug('[Cargonizer] profile response: ', xml);

    if (!response.body) throw new Error('[Cargonizer] Profile returned null');

    const profile = new XMLParser().parse(xml);
    return profile;
  } catch (err) {
    const error = `[Cargonizer] Error when fetching profile. ${err.message}`;
    console.warn(error);
    return {
      error,
    };
  }
}

export const sendConsignment = async (input: SendConsignmentInput) => {
  const order = input.order;

  if (!order) {
    throw new Error('Order was null');
  }

  let reference = '';
  let weight = 0;

  for (const item of order.orderItems) {
    reference = `${reference} ${item.quantity}${item.mbProductCode}`;
    weight += WEIGHT_NORMAL_BAG * item.quantity;
  }

  weight += WEIGHT_PACKAGING;

  const consignment: CargonizerConsignment = {
    shippingType: shipping_type_standard_business, // TODO: Resolve from order if private or b2b
    reference,
    weight,
    customer: {
      name: order.name,
      email: order.email || '',
      mobile: order.mobile || '',
      street1: order.address1,
      street2: order.address2 || '',
      zipCode: order.postalCode,
      place: order.postalPlace,
      country: order.country || 'NO',
      contactPerson: order.name,
    },
  };

  console.debug('SENDING ORDER TO CARGONIZER', consignment);

  const xml = await createConsignmentXml(consignment);
  return await createConsignment(xml);
};

async function createConsignment(xml: string) {
  let options = {
    url: consignment_url,
    method: 'POST',
    headers: {
      ...headers,
      'Content-length': xml.length,
    },
    body: xml,
  };

  // return new Promise<any>(function (resolve, reject) {
  //   const request = require('request');

  //   request(options, function (error: any, response: any) {
  //     if (error) {
  //       return reject(error);
  //     }

  //     if (response.statusCode != 201) {
  //       // Most likely a validation error such as an invalid zip code etc.
  //       return reject(response.body);
  //     }

  //     require('xml2js').parseString(
  //       response.body,
  //       function (parseError: any, result: any) {
  //         if (parseError) {
  //           return reject(parseError);
  //         }

  //         if (
  //           result.consignments &&
  //           result.consignments.consignment &&
  //           result.consignments.consignment.length > 0
  //         ) {
  //           const id = result.consignments.consignment[0].id[0]._;

  //           printLabel(id);
  //         }

  //         return resolve(result);
  //       }
  //     );
  //   });
  // });
}

async function requestServicePartners($country: string, $postcode: string) {
  const url =
    service_partners_url + '?country=' + $country + '&postcode=' + $postcode;

  // return new Promise<any>(function (resolve, reject) {
  //   const request = require('request');
  //   request(url, function (error: any, response: { body: any }) {
  //     if (error) {
  //       return reject(error);
  //     }

  //     require('xml2js').parseString(
  //       response.body,
  //       function (parseError: any, result: any) {
  //         if (parseError) {
  //           return reject(parseError);
  //         }

  //         const partners = result.results['service-partners'][0];
  //         const partner = partners['service-partner'][0];

  //         let servicePartner = {
  //           service_partner_number: partner.number[0],
  //           address: {
  //             name: partner.name[0],
  //             address1: partner.address1[0],
  //             address2: partner.address2[0],
  //             postcode: partner.postcode[0],
  //             city: partner.city[0],
  //             country: partner.country[0],
  //           },
  //         };

  //         return resolve(servicePartner);
  //       }
  //     );
  //   });
  // });
}

async function createConsignmentXml(consignment: CargonizerConsignment) {
  let xml2js = require('xml2js');

  const weight = consignment.weight / 1000; // cargonizer wants kilogram

  const service_partner = await requestServicePartners(
    'NO',
    consignment.customer.zipCode
  );

  const product = ShippingTypeToProduct(consignment.shippingType);
  const services =
    product === product_private ? { service: product_private_service } : {};

  const obj = {
    consignments: {
      consignment: {
        $: {
          transport_agreement: process.env.CARGONIZER_TRANSPORT_AGREEMENT,
          print: false,
        },
        product: product,
        parts: {
          consignee: {
            name: consignment.customer.name,
            address1: consignment.customer.street1,
            address2: consignment.customer.street2,
            postcode: consignment.customer.zipCode,
            city: consignment.customer.place,
            country: consignment.customer.country,
            email: consignment.customer.email,
            mobile: consignment.customer.mobile,
          },
          service_partner: {
            number: service_partner.service_partner_number,
            name: service_partner.address.name,
            address1: service_partner.address.address1,
            address2: service_partner.address.address2,
            postcode: service_partner.address.zipCode,
            city: service_partner.address.city,
            country: service_partner.address.country,
          },
        },
        items: {
          item: {
            $: {
              type: 'package',
              amount: 1,
              weight: weight,
            },
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

  const builder = new xml2js.Builder({
    renderOpts: { pretty: false },
    headless: true,
  });

  return builder.buildObject(obj);
}

async function printLabel(consignmentId: number) {
  let url = `${print_url}?printer_id=${settings.CARGONIZER_PRINTER_ID}&consignment_ids[]=${consignmentId}`;

  try {
    const response = await fetch(url, { method: 'POST', headers: headers });
    const json = await response.json();

    return json;
  } catch (err) {
    console.warn('Error when printing Cargonizer label', err.msg);
    throw err;
  }

  // let options = {
  //   url: url,
  //   method: 'POST',
  //   headers: {
  //     'X-Cargonizer-Key': api_key,
  //     'X-Cargonizer-Sender': sender_id,
  //   },
  // };

  // return new Promise<any>(function (resolve, reject) {
  //   const request = require('request');

  //   request(options, function (error: any, response: any) {
  //     if (error) {
  //       return reject(error);
  //     }

  //     if (response.statusCode != 202) {
  //       return reject(response.body);
  //     }

  //     return resolve('OK');
  //   });
  // });
}

function ShippingTypeToProduct(shippingType: number): string {
  if (process.env.CARGONIZER_USE_SANDBOX) {
    return 'bring_pa_doren';
  }

  if (shippingType == shipping_type_standard_business) {
    return product_business;
  }

  return product_private;
}
