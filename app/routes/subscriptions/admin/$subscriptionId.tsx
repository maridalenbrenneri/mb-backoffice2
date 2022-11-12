import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Box,
  Button,
  FormControl,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

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

type LoaderData = {
  subscription: Subscription;
  customer: Awaited<ReturnType<typeof getCustomer>>;
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
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

  const isUpdating = Boolean(transition.submission);

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
                <Button type="submit" disabled={isUpdating}>
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
          <Outlet />
        </Grid>
        <Grid item md={12}>
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
