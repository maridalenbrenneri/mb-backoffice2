import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { SubscriptionType } from '@prisma/client';

import {
  renderFrequency,
  renderShippingTypes,
  renderStatus,
  renderTypes,
  createAction,
} from './_shared';
import type { FikenCustomer } from '~/_libs/fiken';
import { getCustomers } from '~/_libs/fiken';

type LoaderData = {
  customers: Awaited<ReturnType<typeof getCustomers>>;
};

export const loader = async () => {
  const customers = await getCustomers();
  return json<LoaderData>({
    customers,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  await createAction(values);
};

export default function NewSubscription() {
  const errors = useActionData();
  const transition = useTransition();
  const { customers } = useLoaderData() as unknown as LoaderData;
  const [customer, setCustomer] = useState(customers[0]);

  const isCreating = Boolean(transition.submission);

  if (!customers?.length)
    return <Box>Couldn't find any customers, cannot create subscription.</Box>;

  const handleSelectCustomer = (e: any) => {
    setCustomer(
      customers.find((c) => c.contactId === e.target.value) as FikenCustomer
    );
  };

  const customerHasAddressData = (customer: FikenCustomer) => {
    if (!customer) return true;

    return (
      customer.address?.address1 &&
      customer.address?.postalCode &&
      customer.address?.postalPlace &&
      customer.email
    );
  };

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Create New Subscription</Typography>
      {!customerHasAddressData(customer) && (
        <Alert severity="warning">
          Customer seems to be missing address or contact info in Fiken. Must be
          added (in Fiken) before subcription can be created.
        </Alert>
      )}
      <Form method="post">
        <input type="hidden" name="type" value={SubscriptionType.B2B} />
        <input type="hidden" name="fikenContactId" value={customer.contactId} />
        <input type="hidden" name="recipientName" value={customer.name} />
        <input type="hidden" name="customerName" value={customer.name} />
        <input
          type="hidden"
          name="recipientAddress1"
          value={customer.address.address1}
        />
        <input
          type="hidden"
          name="recipientAddress2"
          value={customer.address.address2}
        />
        <input
          type="hidden"
          name="recipientPostalCode"
          value={customer.address.postalCode}
        />
        <input
          type="hidden"
          name="recipientPostalPlace"
          value={customer.address.postalPlace}
        />
        <input type="hidden" name="recipientEmail" value={customer.email} />

        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`customer-label`}>Customer</InputLabel>
          <Select
            labelId={`customer-label`}
            name={`contactId`}
            defaultValue={customer.contactId}
            onChange={handleSelectCustomer}
            sx={{ minWidth: 250 }}
            size="small"
          >
            {customers.map((customer) => (
              <MenuItem value={customer.contactId} key={customer.contactId}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {renderTypes()}

        <div>
          {renderStatus()}
          {renderFrequency()}
          {renderShippingTypes()}
        </div>

        <FormControl>
          <TextField
            name="quantity250"
            label="Quantity, 250g"
            variant="outlined"
            defaultValue={0}
            error={errors?.quantity250}
            size="small"
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity500"
            label="Quantity, 500g"
            variant="outlined"
            size="small"
            defaultValue={0}
            error={errors?.quantity500}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity1200"
            label="Quantity, 1,2kg"
            variant="outlined"
            size="small"
            defaultValue={0}
            error={errors?.quantity1200}
          />
        </FormControl>
        <div>
          <FormControl>
            <TextField
              name="internalNote"
              label="Note"
              variant="outlined"
              size="small"
              multiline
            />
          </FormControl>
        </div>
        <div>
          <FormControl sx={{ m: 1 }}>
            <Button
              type="submit"
              disabled={isCreating || !customerHasAddressData(customer)}
              variant="contained"
            >
              {isCreating ? 'Creating...' : 'Create Subscription'}
            </Button>
          </FormControl>
        </div>
      </Form>

      {customer && (
        <div>
          <h4>Fiken data</h4>
          <p>{JSON.stringify(customer)}</p>
        </div>
      )}
    </Box>
  );
}
