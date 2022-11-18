import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from '@remix-run/react';
import invariant from 'tiny-invariant';
import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import type { Delivery } from '@prisma/client';
import { OrderStatus } from '@prisma/client';

import {
  renderFrequency,
  renderStatus,
  renderTypes,
  upsertAction,
} from './_shared';
import { getSubscription } from '~/_libs/core/models/subscription.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';
import { getCustomer } from '~/_libs/fiken';
import GiftSubscriptionWooData from '~/components/GiftSubscriptionWooData';
import Orders from '~/components/Orders';
import { toPrettyDate } from '~/_libs/core/utils/dates';
import { upsertAction as upsertOrderAction } from '../../orders/admin/_shared';

type LoaderData = {
  subscription: Subscription;
  customer: Awaited<ReturnType<typeof getCustomer>>;
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'create-order') return await upsertOrderAction(values);
  else if (_action === 'update') return await upsertAction(request);

  return null;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.subscriptionId, `params.id is required`);

  const subscription = await getSubscription(+params.subscriptionId);
  invariant(subscription, `Subscription not found: ${params.subscriptionId}`);

  const deliveries = await getDeliveries();
  invariant(deliveries, `Deliveries not found`);

  const customer = !subscription.fikenContactId
    ? null
    : await getCustomer(subscription.fikenContactId);

  return json({ subscription, deliveries, customer });
};

export default function UpdateSubscription() {
  const errors = useActionData();
  const transition = useTransition();
  const { subscription, deliveries } = useLoaderData() as unknown as LoaderData;
  const [delivery, setDelivery] = useState<Delivery>();

  const isUpdating = Boolean(transition.submission);
  const isCreatingOrder = Boolean(transition.submission);

  useEffect(() => {
    setDelivery(deliveries[0]);
  }, [deliveries]);

  if (!delivery) return null;

  const handleChange = (e: any) => {
    setDelivery(deliveries.find((c) => c.id === e.target.value) as Delivery);
  };

  return (
    <Box
      m={2}
      p={1}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Typography variant="h1">Subscription</Typography>
        </Grid>
        <Grid item md={9}>
          <Form method="post">
            <input type="hidden" name="id" value={subscription.id} />
            <input type="hidden" name="type" value={subscription.type} />
            <input
              type="hidden"
              name="fikenContactId"
              value={subscription.fikenContactId || undefined}
            />

            <Box my={2}>
              {renderTypes(subscription.type)}
              {renderStatus(subscription.status)}
              {renderFrequency(subscription.frequency)}
            </Box>
            <Box>
              <FormControl>
                <TextField
                  name="quantity250"
                  label="Quantity, 250g"
                  variant="outlined"
                  defaultValue={subscription.quantity250}
                  error={errors?.quantity250}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="quantity500"
                  label="Quantity, 500g"
                  variant="outlined"
                  defaultValue={subscription.quantity500}
                  error={errors?.quantity500}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="quantity1200"
                  label="Quantity, 1,2kg"
                  variant="outlined"
                  defaultValue={subscription.quantity1200}
                  error={errors?.quantity1200}
                />
              </FormControl>
            </Box>

            <Box my={2}>
              <div>
                <FormControl>
                  <TextField
                    name="name"
                    label="Name"
                    variant="outlined"
                    defaultValue={subscription.recipientName}
                    error={errors?.recipientName}
                  />
                </FormControl>
              </div>
              <div>
                <FormControl>
                  <TextField
                    name="address1"
                    label="Address1"
                    variant="outlined"
                    defaultValue={subscription.recipientAddress1}
                    error={errors?.recipientAddress1}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="address2"
                    label="Address2"
                    variant="outlined"
                    defaultValue={subscription.recipientAddress2}
                    error={errors?.recipientAddress2}
                  />
                </FormControl>
              </div>
              <div>
                <FormControl>
                  <TextField
                    name="postalCode"
                    label="Postal code"
                    variant="outlined"
                    defaultValue={subscription.recipientPostalCode}
                    error={errors?.recipientPostcode}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="postalPlace"
                    label="Place"
                    variant="outlined"
                    defaultValue={subscription.recipientPostalPlace}
                    error={errors?.recipientPlace}
                  />
                </FormControl>
              </div>
              <div>
                <FormControl>
                  <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    defaultValue={subscription.recipientEmail}
                    error={errors?.recipientEmail}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    name="mobile"
                    label="Mobile"
                    variant="outlined"
                    defaultValue={subscription.recipientMobile}
                    error={errors?.recipientMobile}
                  />
                </FormControl>
              </div>
            </Box>

            <div>
              <TextField
                name="internalNote"
                label="Note"
                variant="outlined"
                multiline
              />
            </div>
            <div>
              <FormControl sx={{ m: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdating}
                  name="_action"
                  value="update"
                >
                  {isUpdating ? 'Updating...' : 'Update Subscription'}
                </Button>
              </FormControl>
            </div>
          </Form>
        </Grid>
        <Grid item md={3}>
          <GiftSubscriptionWooData subscription={subscription} />
        </Grid>
        <Grid item md={12}>
          <Typography variant="h3">Create New Order</Typography>
          <Form method="post">
            <input
              type="hidden"
              name="subscriptionId"
              value={subscription.id}
            />
            <input type="hidden" name="deliveryId" value={delivery?.id} />
            <input type="hidden" name="status" value={OrderStatus.ACTIVE} />

            <input
              type="hidden"
              name="deliveryId"
              value={subscription.recipientName}
            />
            <input
              type="hidden"
              name="name"
              value={subscription.recipientName}
            />
            <input
              type="hidden"
              name="address1"
              value={subscription.recipientAddress1}
            />
            <input
              type="hidden"
              name="address2"
              value={subscription.recipientAddress2 || undefined}
            />
            <input
              type="hidden"
              name="postalCode"
              value={subscription.recipientPostalCode}
            />
            <input
              type="hidden"
              name="postalPlace"
              value={subscription.recipientPostalPlace}
            />
            <input
              type="hidden"
              name="mobile"
              value={subscription.recipientMobile || undefined}
            />
            <input
              type="hidden"
              name="email"
              value={subscription.recipientEmail || undefined}
            />

            <FormControl sx={{ m: 1 }}>
              <InputLabel id={`delivery-label`}>Delivery day</InputLabel>
              <Select
                labelId={`delivery-label`}
                name={`deliveryId`}
                defaultValue={delivery?.id || 0}
                onChange={handleChange}
                sx={{ minWidth: 250 }}
              >
                {deliveries.map((d) => (
                  <MenuItem value={d.id} key={d.id}>
                    {toPrettyDate(d.date)} - {d.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <TextField
                name="quantity250"
                label="Quantity 250"
                variant="outlined"
                defaultValue={subscription.quantity250}
                error={errors?.quantity250}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="quantity500"
                label="Quantity 500"
                variant="outlined"
                defaultValue={subscription.quantity500}
                error={errors?.quantity500}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="quantity1200"
                label="Quantity 1200"
                variant="outlined"
                defaultValue={subscription.quantity1200}
                error={errors?.quantity1200}
              />
            </FormControl>
            <div>
              <FormControl sx={{ m: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCreatingOrder}
                  name="_action"
                  value="create-order"
                >
                  {isCreatingOrder ? 'Creating...' : 'Create Order'}
                </Button>
              </FormControl>
            </div>
          </Form>
        </Grid>
        <Link>
          Create New Custom Order CREATES NON-RECURRENT ORDER AND SENDS TO ORDER
          EDIT ROUTE
        </Link>
        <Grid item md={12}>
          <Typography variant="h3">Order History</Typography>
          <Orders orders={subscription.orders} />
        </Grid>
      </Grid>
    </Box>
  );
}

export function ErrorBoundary() {
  const { subscriptionId } = useParams();
  return (
    <div className="error-container">{`There was an error loading subscription by the id ${subscriptionId}. Sorry.`}</div>
  );
}
