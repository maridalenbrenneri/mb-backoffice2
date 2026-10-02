import { FIKEN_API_URL, FIKEN_COMPANY_SLUG } from '../../settings';

const fiken_uri = `${FIKEN_API_URL}/companies/${FIKEN_COMPANY_SLUG}`;

export interface FikenCustomer {
  contactId: number;
  customerNumber: number;
  organizationNumber: string;
  name: string;
  email: string;
  address: {
    address1: string;
    address2: string | undefined;
    postalPlace: string;
    postalCode: string;
    country: string;
  };
  inactive: boolean;
  customer: boolean;
}

function mapToFikenCustomer(api: any): FikenCustomer {
  return {
    contactId: api.contactId,
    customerNumber: api.customerNumber,
    organizationNumber: api.organizationNumber,
    name: api.name,
    email: api.email,
    address: {
      address1: api.address.streetAddress,
      address2: api.address.streetAddressLine2,
      postalPlace: api.address.city,
      postalCode: api.address.postCode,
      country: api.address.country,
    },
    inactive: api.inactive,
    customer: api.customer,
  };
}

export async function getCustomer(customerId: string): Promise<FikenCustomer> {
  const contacts_uri = `${fiken_uri}/contacts/${customerId}`;
  const auth = { authorization: `Bearer ${process.env.FIKEN_API_TOKEN}` };

  const response = await fetch(contacts_uri, { headers: auth });
  const customer = await response.json();

  // console.log(customer);

  return mapToFikenCustomer(customer);
}

export async function getCustomers(): Promise<FikenCustomer[]> {
  const contacts_uri = `${fiken_uri}/contacts?customer=true&sortBy=name%20asc&pageSize=100`;
  const auth = { authorization: `Bearer ${process.env.FIKEN_API_TOKEN}` };

  const response = await fetch(contacts_uri, { headers: auth });
  const customers = await response.json();

  // console.log(customers);

  // TODO: FILTER ONLY CUSTOMER CONTACTS, AND ACTIVE

  const mapped = customers.map((c: any) => mapToFikenCustomer(c));
  const sorted = mapped.sort((a: FikenCustomer, b: FikenCustomer) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return sorted;
}

// private createFikenInvoiceData(order) {
//   const self = this;
//   const invoiceDueDays = 14;

//   // todo: create invoice lines

//   console.log(order.items);

//   return {
//     issueDate: moment().format("YYYY-MM-DD"),
//     dueDate: moment().add(invoiceDueDays, "d").format("YYYY-MM-DD"),
//     lines: [
//       {
//         netAmount: "20000",
//         vatAmount: "5000",
//         grossAmount: "25000",
//         vatType: "HIGH",
//         vatPercent: "25",
//         quantity: "2",
//         description: "Kaffe 250g",
//         incomeAccount: "3000",
//       },
//     ],
//     bankAccountUrl: `${self.fikenUri}/bank-accounts/${process.env.FIKEN_BANK_ACCOUNT_ID}`,
//     customer: {
//       url: `${self.fikenUri}/contacts/730009065`, // todo: customer id
//     },
//     invoiceText: `Ordre #${order.id}`,
//     yourReference: "",
//     ourReference: "Yngve Ydersbond",
//   };
// }

// async createInvoice(invoice) {
//   const self = this;

//   const options = {
//     url: `${self.fikenUri}/create-invoice-service`,
//     method: "POST",
//     headers: this.getHeaders(),
//     body: JSON.stringify(self.createFikenInvoiceData(invoice)),
//   };

//   console.log(options.body);

//   return new Promise<any>(function (resolve, reject) {
//     self.request(options, function (error: any, response: any) {
//       if (error) {
//         return reject(error);
//       }

//       if (response.statusCode != 201) {
//         return reject(response.body);
//       }

//       return resolve(true);
//     });
//   });
// }
