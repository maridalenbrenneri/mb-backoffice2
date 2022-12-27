import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useParams,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import {
  renderFrequency,
  renderShippingTypes,
  renderStatus,
  renderTypes,
  updateFirstDeliveryDate,
  upsertAction,
} from './_shared';
import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import Orders from '~/components/Orders';
import {
  createCustomdOrder,
  createNonRecurringOrder,
} from '~/_libs/core/services/order-service';
import {
  FIKEN_CONTACT_URL,
  WOO_NON_RECURRENT_SUBSCRIPTION_ID,
  WOO_RENEWALS_SUBSCRIPTION_ID,
} from '~/_libs/core/settings';
import DataLabel from '~/components/DataLabel';
import type { DeliveryDate } from '~/_libs/core/utils/dates';
import { toPrettyDateTextLong } from '~/_libs/core/utils/dates';
import { getNextDeliveryDates } from '~/_libs/core/utils/dates';
import { toPrettyDate, toPrettyDateTime } from '~/_libs/core/utils/dates';
import { useEffect, useState } from 'react';
import { modalStyle } from '~/style/theme';

type LoaderData = {
  loadedSubscription: Subscription;
  deliveryDates: Awaited<ReturnType<typeof getNextDeliveryDates>>;
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

  if (_action === 'set-first-delivery') {
    await updateFirstDeliveryDate(values);
    return redirect(`/subscriptions/admin/${values.id}`);
  }

  return null;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.subscriptionId, `params.id is required`);

  const subscriptions = await getSubscriptions({
    where: { id: +params.subscriptionId },
    include: {
      orders: {
        include: {
          delivery: true,
          orderItems: {
            select: {
              id: true,
              variation: true,
              quantity: true,
              coffee: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  });

  const loadedSubscription = subscriptions?.length ? subscriptions[0] : null;
  invariant(
    loadedSubscription,
    `Subscription not found: ${params.subscriptionId}`
  );

  const allDates = getNextDeliveryDates(20);
  const deliveryDates = allDates.filter((d) => d.type === 'MONTHLY');

  return json({ loadedSubscription, deliveryDates });
};

export default function UpdateSubscription() {
  const errors = useActionData();
  const transition = useTransition();
  const submit = useSubmit();
  const { loadedSubscription, deliveryDates } =
    useLoaderData() as unknown as LoaderData;

  const [subscription, setSubscription] = useState<Subscription>();

  const [deliveryDate, setDeliveryDate] = useState(deliveryDates[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSubscription(loadedSubscription);
  }, [loadedSubscription]);

  if (!subscription) return null;

  const isUpdating =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') === '';

  const isCreatingOrder =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') === 'create-order';

  const isCreatingCustomOrder =
    transition.state === 'submitting' &&
    transition.submission.formData.get('_action') === 'create-custom-order';

  const isSystemSubscription =
    subscription.id === WOO_RENEWALS_SUBSCRIPTION_ID ||
    subscription.id === WOO_NON_RECURRENT_SUBSCRIPTION_ID;

  const handleChangeFirstDeliveryDate = (event: any) => {
    if (!subscription.gift_firstDeliveryDate) return;

    const selectedDeliveryDate = deliveryDates.find(
      (d) => d.id === (event.target.value as number)
    );

    if (!selectedDeliveryDate) return;

    setDeliveryDate(selectedDeliveryDate);
  };

  const handleOpen = () => {
    setOpen(true);
  };

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

          {!subscription.wooSubscriptionId && !isSystemSubscription && (
            <Grid item md={12}>
              <Grid container spacing={2}>
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
                          size="small"
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
                          size="small"
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
                          size="small"
                          defaultValue={subscription.quantity1200}
                          error={errors?.quantity1200}
                        />
                      </FormControl>
                      <div>
                        <FormControl sx={{ m: 1, marginTop: 2 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isCreatingOrder || isSystemSubscription}
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
                    <Typography variant="h3">
                      Create New Custom Order
                    </Typography>
                    <p>
                      <small>
                        New order for this customer with custom coffees.
                      </small>
                      <br />
                      <small>
                        Use <em>Create New Order</em> to create order with
                        subscription coffee mix.
                      </small>
                    </p>
                    <Form method="post">
                      <input type="hidden" name="id" value={subscription.id} />
                      <FormControl sx={{ m: 1 }}>
                        <Button
                          type="submit"
                          name="_action"
                          value="create-custom-order"
                          variant="contained"
                          disabled={
                            isCreatingCustomOrder || isSystemSubscription
                          }
                        >
                          {isCreatingCustomOrder ? 'Creating...' : 'Create =>'}
                        </Button>
                      </FormControl>
                    </Form>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid item md={7}>
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
                  {renderShippingTypes(subscription.shippingType)}
                </Box>
                <Box>
                  <FormControl>
                    <TextField
                      name="quantity250"
                      label="Quantity, 250g"
                      variant="outlined"
                      size="small"
                      defaultValue={subscription.quantity250}
                      error={errors?.quantity250}
                    />
                  </FormControl>
                  <FormControl>
                    <TextField
                      name="quantity500"
                      label="Quantity, 500g"
                      variant="outlined"
                      size="small"
                      defaultValue={subscription.quantity500}
                      error={errors?.quantity500}
                    />
                  </FormControl>
                  <FormControl>
                    <TextField
                      name="quantity1200"
                      label="Quantity, 1,2kg"
                      variant="outlined"
                      size="small"
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
                        size="small"
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
                        size="small"
                        defaultValue={subscription.recipientAddress1}
                        error={errors?.recipientAddress1}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientAddress2"
                        label="Address2"
                        variant="outlined"
                        size="small"
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
                        size="small"
                        defaultValue={subscription.recipientPostalCode}
                        error={errors?.recipientPostcode}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientPostalPlace"
                        label="Place"
                        variant="outlined"
                        size="small"
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
                        size="small"
                        defaultValue={subscription.recipientEmail}
                        error={errors?.recipientEmail}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientMobile"
                        label="Mobile"
                        variant="outlined"
                        size="small"
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
                      disabled={
                        isUpdating ||
                        isSystemSubscription ||
                        !!subscription.wooSubscriptionId
                      }
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
          <Grid item md={5}>
            <Paper
              sx={{
                p: 0,
              }}
            >
              {subscription.type === 'PRIVATE_GIFT' && (
                <Box sx={{ m: 1, p: 1 }}>
                  <Typography>Woo GABO data</Typography>

                  <Box sx={{ m: 1 }}>
                    <DataLabel
                      dataFields={[
                        {
                          label: 'System resolved actual first delivery day',
                          data: toPrettyDateTextLong(
                            subscription.gift_firstDeliveryDate
                          ),
                          onClick: handleOpen,
                        },
                        {
                          label: 'Customer requested first delivery date',
                          data: toPrettyDate(
                            subscription.gift_customerFirstDeliveryDate
                          ),
                        },
                        {
                          label: 'Months',
                          data: subscription.gift_durationMonths,
                        },
                        {
                          label: 'Customer',
                          data: subscription.wooCustomerName,
                        },
                        {
                          label: 'Woo customer id',
                          data: subscription.wooCustomerId,
                        },
                        {
                          label: 'Customer note',
                          data: subscription.customerNote,
                        },
                        {
                          label: 'Message to recipient',
                          data: subscription.gift_messageToRecipient,
                        },
                        {
                          label: 'Woo order id',
                          data: subscription.gift_wooOrderId,
                        },
                        {
                          label: 'Woo order created at',
                          data: toPrettyDateTime(
                            subscription.wooCreatedAt,
                            true
                          ),
                        },
                      ]}
                    />
                  </Box>
                </Box>
              )}
              {/* <GiftSubscriptionWooData subscription={subscription} /> */}
              {isSystemSubscription && (
                <Alert severity="info" icon={false}>
                  This is a system subscription, it cannot be edited and no
                  orders can be created.
                </Alert>
              )}

              <>
                {subscription.fikenContactId && (
                  <div>
                    <Typography>B2B Fiken Customer</Typography>
                    <Box sx={{ m: 1 }}>
                      <DataLabel
                        dataFields={[
                          {
                            label: 'Fiken id',
                            data: subscription.fikenContactId,
                            dataLinkUrl: `${FIKEN_CONTACT_URL}${subscription.fikenContactId}`,
                          },
                        ]}
                      />
                    </Box>
                  </div>
                )}
                {subscription.wooSubscriptionId && (
                  <div>
                    <Typography>Private Woo subscription</Typography>
                    <Box sx={{ m: 1 }}>
                      <p>
                        This subscription is imported from Woo and cannot be
                        updated here.
                      </p>
                      <p>
                        Update of status, customer data and quantity must be
                        done in Woo.
                      </p>
                      <p>
                        Renewal orders are automatically created (imported from
                        Woo).
                      </p>

                      <DataLabel
                        dataFields={[
                          {
                            label: 'Woo subscription id',
                            data: subscription.wooSubscriptionId,
                          },
                          {
                            label: 'Woo customer id',
                            data: subscription.wooCustomerId,
                          },
                          {
                            label: 'Woo created at',
                            data: toPrettyDateTime(
                              subscription.wooCreatedAt,
                              true
                            ),
                          },
                        ]}
                      />
                    </Box>
                  </div>
                )}
                <DataLabel
                  dataFields={[
                    {
                      label: 'Created/Imported',
                      data: toPrettyDateTime(subscription.createdAt, true),
                    },
                    {
                      label: 'Updated at',
                      data: toPrettyDateTime(subscription.updatedAt, true),
                    },
                  ]}
                />
              </>
            </Paper>
          </Grid>

          <Grid item md={12}>
            <Box my={2}>
              <Typography variant="h2">Order History</Typography>
              <Orders orders={subscription.orders} extraFields={['delivery']} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <div>
        <Modal
          open={open}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...modalStyle, width: '50%' }}>
            <Form method="post">
              <input type="hidden" name="id" value={subscription.id} />
              <input
                type="hidden"
                name="delivery_date"
                value={deliveryDate.date.toString()}
              />
              <Grid container>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <FormControl sx={{ m: 1 }}>
                    <InputLabel id="date-label">Date</InputLabel>
                    <Select
                      labelId="date-label"
                      defaultValue={`${deliveryDates[0].id}`}
                      onChange={handleChangeFirstDeliveryDate}
                    >
                      {deliveryDates.map((date: DeliveryDate) => (
                        <MenuItem value={date.id} key={date.id}>
                          {toPrettyDateTextLong(date.date)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} style={{ textAlign: 'left' }}>
                  <Button
                    variant="contained"
                    onClick={() => setOpen(false)}
                    sx={{ m: 2, marginTop: 4 }}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6} style={{ textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      submit(e.currentTarget, { replace: true });
                      setOpen(false);
                    }}
                    sx={{ m: 2, marginTop: 4 }}
                    type="submit"
                    name="_action"
                    value="set-first-delivery"
                  >
                    Update First Delivery day
                  </Button>
                </Grid>
              </Grid>
            </Form>
          </Box>
        </Modal>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const { subscriptionId } = useParams();
  return (
    <div className="error-container">{`There was an error loading subscription by the id ${subscriptionId}. Sorry.`}</div>
  );
}
