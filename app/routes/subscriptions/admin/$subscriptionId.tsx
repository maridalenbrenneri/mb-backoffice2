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

import {
  Box,
  Button,
  FormControl,
  Grid,
  Paper,
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
import { getCustomer } from '~/_libs/fiken';
import GiftSubscriptionWooData from '~/components/GiftSubscriptionWooData';
import Orders from '~/components/Orders';
import {
  createCustomdOrder,
  createNonRecurringOrder,
} from '~/_libs/core/services/order-service';
import {
  WOO_NON_RECURRENT_SUBSCRIPTION_ID,
  WOO_RENEWALS_SUBSCRIPTION_ID,
} from '~/_libs/core/settings';

type LoaderData = {
  subscription: Subscription;
  customer: Awaited<ReturnType<typeof getCustomer>>;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'update') return await upsertAction(values);

  if (_action === 'create-order')
    return await createNonRecurringOrder(+(values as any).id, {
      _250: +(values as any).quantity250,
      _500: +(values as any).quantity500,
      _1200: +(values as any).quantity1200,
    });

  if (_action === 'create-custom-order')
    return await createCustomdOrder(+(values as any).id);

  return null;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.subscriptionId, `params.id is required`);

  const subscription = await getSubscription(+params.subscriptionId);
  invariant(subscription, `Subscription not found: ${params.subscriptionId}`);

  const customer = !subscription.fikenContactId
    ? null
    : await getCustomer(subscription.fikenContactId);

  return json({ subscription, customer });
};

export default function UpdateSubscription() {
  const errors = useActionData();
  const transition = useTransition();
  const { subscription } = useLoaderData() as unknown as LoaderData;

  const isUpdating = Boolean(transition.submission);
  const isCreatingOrder = Boolean(transition.submission);

  if (!subscription) return null;

  const isReadOnly =
    subscription.id === WOO_RENEWALS_SUBSCRIPTION_ID ||
    subscription.id === WOO_NON_RECURRENT_SUBSCRIPTION_ID;

  return (
    <main>
      <Box
        sx={{
          '& .MuiTextField-root': { m: 1, minWidth: 250 },
        }}
      >
        <Grid container spacing={2}>
          <Grid item md={12}>
            <Typography variant="h1">Subscription Details</Typography>
          </Grid>

          <Grid item md={9}>
            <Paper
              sx={{
                p: 2,
              }}
            >
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
                        name="recipientName"
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
                        name="recipientAddress1"
                        label="Address1"
                        variant="outlined"
                        defaultValue={subscription.recipientAddress1}
                        error={errors?.recipientAddress1}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientAddress2"
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
                        name="recipientPostalCode"
                        label="Postal code"
                        variant="outlined"
                        defaultValue={subscription.recipientPostalCode}
                        error={errors?.recipientPostcode}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientPostalPlace"
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
                        name="recipientEmail"
                        label="Email"
                        variant="outlined"
                        defaultValue={subscription.recipientEmail}
                        error={errors?.recipientEmail}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientMobile"
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
                    defaultValue={subscription.internalNote}
                  />
                </div>
                <div>
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isUpdating || isReadOnly}
                      name="_action"
                      value="update"
                    >
                      {isUpdating ? 'Updating...' : 'Update Subscription'}
                    </Button>
                  </FormControl>
                </div>
              </Form>
            </Paper>
          </Grid>
          <Grid item md={3}>
            <Paper
              sx={{
                p: 2,
              }}
            >
              <GiftSubscriptionWooData subscription={subscription} />
            </Paper>
          </Grid>

          <Grid item md={6}>
            <Paper
              sx={{
                p: 2,
                '& .MuiTextField-root': { minWidth: 50 },
              }}
            >
              <Typography variant="h3">Create New Order</Typography>
              <Form method="post">
                <input type="hidden" name="id" value={subscription.id} />
                <FormControl>
                  <TextField
                    sx={{
                      width: { sm: 100 },
                    }}
                    name="quantity250"
                    label="250g"
                    variant="outlined"
                    defaultValue={subscription.quantity250}
                    error={errors?.quantity250}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    sx={{
                      width: { sm: 100 },
                    }}
                    name="quantity500"
                    label="500g"
                    variant="outlined"
                    defaultValue={subscription.quantity500}
                    error={errors?.quantity500}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    sx={{
                      width: { sm: 100 },
                    }}
                    name="quantity1200"
                    label="1,2kg"
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
                      disabled={isCreatingOrder || isReadOnly}
                      name="_action"
                      value="create-order"
                    >
                      {isCreatingOrder ? 'Creating...' : 'Create'}
                    </Button>
                  </FormControl>
                </div>
              </Form>
            </Paper>
          </Grid>

          <Grid item md={6}>
            <Paper
              sx={{
                p: 2,
              }}
            >
              <Typography variant="h3">Create New Custom Order</Typography>
              <Form method="post">
                <input type="hidden" name="id" value={subscription.id} />
                <FormControl sx={{ m: 1 }}>
                  <Button
                    type="submit"
                    name="_action"
                    value="create-custom-order"
                    variant="contained"
                    disabled={isCreatingOrder || isReadOnly}
                  >
                    {isCreatingOrder ? 'Creating...' : 'Create =>'}
                  </Button>
                </FormControl>
              </Form>
            </Paper>
          </Grid>

          <Grid item md={12}>
            <Box my={2}>
              <Typography variant="h2">Order History</Typography>
              <Orders orders={subscription.orders} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </main>
  );
}

export function ErrorBoundary() {
  const { subscriptionId } = useParams();
  return (
    <div className="error-container">{`There was an error loading subscription by the id ${subscriptionId}. Sorry.`}</div>
  );
}
