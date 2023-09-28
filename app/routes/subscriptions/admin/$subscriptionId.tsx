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
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';

import {
  renderFrequency,
  renderShippingTypes,
  renderStatus,
  updateFirstDeliveryDate,
  upsertAction,
} from './_shared';

import * as subscriptionRepository from '~/_libs/core/repositories/subscription';
import {
  SubscriptionSpecialRequest,
  type Subscription,
} from '~/_libs/core/repositories/subscription';

import Orders from '~/components/Orders';
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
import {
  createCustomOrder,
  createNonRecurringOrder,
} from '~/_libs/core/services/order-service';

type LoaderData = {
  loadedSubscription: Subscription;
  deliveryDates: Awaited<ReturnType<typeof getNextDeliveryDates>>;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'update') return await upsertAction(values);

  if (_action === 'create-order') {
    await createNonRecurringOrder(+(values as any).id, {
      _250: +(values as any).quantity250,
      _500: +(values as any).quantity500,
      _1200: +(values as any).quantity1200,
    });
    return { didUpdate: true, updateMessage: 'Order was created' };
  }

  if (_action === 'create-custom-order') {
    const order = await createCustomOrder(+(values as any).id);
    return redirect(`/orders/admin/${order.id}`);
  }

  if (_action === 'set-first-delivery') {
    await updateFirstDeliveryDate(values);
    return {
      didUpdate: true,
      updateMessage: 'First delivery date was updated',
    };
  }

  return null;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.subscriptionId, `params.id is required`);

  const subscriptions = await subscriptionRepository.getSubscriptions({
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
  const data = useActionData();
  const transition = useTransition();
  const submit = useSubmit();
  const { loadedSubscription, deliveryDates } =
    useLoaderData() as unknown as LoaderData;

  const [subscription, setSubscription] = useState<Subscription>();
  const [deliveryDate, setDeliveryDate] = useState(deliveryDates[0]);
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openSetFirstDelivery, setOpenSetFirstDelivery] = useState(false);

  useEffect(() => {
    setSubscription(loadedSubscription);
  }, [loadedSubscription]);

  useEffect(() => {
    setOpenSnack(!!data?.didUpdate);
  }, [data]);

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
    setOpenSetFirstDelivery(true);
  };

  const dataFields: any[] = [
    {
      label: 'Status',
      data: subscription.status,
    },
    {
      label: 'Type',
      data: subscription.type,
    },
    {
      label: 'Recipient',
      data: subscription.recipientName,
    },
    {
      label: 'Created/Imported at',
      data: toPrettyDateTime(subscription.createdAt, true),
    },
    {
      label: 'Updated at',
      data: toPrettyDateTime(subscription.updatedAt, true),
    },
  ];

  const dataFieldsWoo: any[] = [
    {
      label: 'Woo subscription id',
      data: subscription.wooSubscriptionId,
    },
    {
      label: 'Woo customer name',
      data: subscription.wooCustomerName,
    },
    {
      label: 'Woo customer id',
      data: subscription.wooCustomerId,
    },
    {
      label: 'Woo created at',
      data: toPrettyDateTime(subscription.wooCreatedAt, true),
    },
  ];

  const dataFieldsFiken: any[] = [
    {
      label: 'Fiken customer id',
      data: subscription.fikenContactId,
      dataLinkUrl: `${FIKEN_CONTACT_URL}${subscription.fikenContactId}`,
    },
  ];

  const dataFieldsGift: any[] = [
    {
      label: 'System resolved actual first delivery day',
      data: toPrettyDateTextLong(subscription.gift_firstDeliveryDate),
      onClick: handleOpen,
    },
    {
      label: 'Customer requested first delivery date',
      data: toPrettyDate(subscription.gift_customerFirstDeliveryDate),
    },
    {
      label: 'Months',
      data: subscription.gift_durationMonths,
    },
    {
      label: 'Woo customer name',
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
      data: toPrettyDateTime(subscription.wooCreatedAt, true),
    },
  ];

  return (
    <main>
      <Box
        sx={{
          '& .MuiTextField-root': { m: 1, minWidth: 250 },
        }}
      >
        <Snackbar
          open={openSnack}
          autoHideDuration={3000}
          onClose={() => setOpenSnack(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success">{data?.updateMessage || 'Updated'}</Alert>
        </Snackbar>

        <Typography variant="h1">Subscription Details</Typography>

        {isSystemSubscription && (
          <Alert severity="warning">
            This is a system subscription, it cannot be edited and no orders can
            be created.
          </Alert>
        )}

        {subscription.wooSubscriptionId && (
          <Alert severity="info" sx={{ m: 1 }}>
            This subscription is imported from Woo and cannot be edited here.
            Update of status, customer data and quantities must be done in Woo.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item md={6}>
            <Box sx={{ m: 1 }}>
              <DataLabel dataFields={dataFields} />
            </Box>
          </Grid>
          {subscription.wooSubscriptionId && (
            <Grid item md={6}>
              <Box sx={{ m: 1 }}>
                <DataLabel dataFields={dataFieldsWoo} />
              </Box>
            </Grid>
          )}
          {subscription.fikenContactId && (
            <Grid item md={6}>
              <Box sx={{ m: 1 }}>
                <DataLabel dataFields={dataFieldsFiken} />
              </Box>
            </Grid>
          )}
          {subscription.type === 'PRIVATE_GIFT' && (
            <Grid item md={6}>
              <Box sx={{ m: 1 }}>
                <DataLabel dataFields={dataFieldsGift} />
              </Box>
            </Grid>
          )}

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
                          error={data?.validationErrors?.quantity250}
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
                          error={data?.validationErrors?.quantity500}
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
                          error={data?.validationErrors?.quantity1200}
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

          <Grid item xs={12}>
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
                      error={data?.validationErrors?.quantity250}
                    />
                  </FormControl>
                  <FormControl>
                    <TextField
                      name="quantity500"
                      label="Quantity, 500g"
                      variant="outlined"
                      size="small"
                      defaultValue={subscription.quantity500}
                      error={data?.validationErrors?.quantity500}
                    />
                  </FormControl>
                  <FormControl>
                    <TextField
                      name="quantity1200"
                      label="Quantity, 1,2kg"
                      variant="outlined"
                      size="small"
                      defaultValue={subscription.quantity1200}
                      error={data?.validationErrors?.quantity1200}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl sx={{ m: 1 }}>
                    <InputLabel id={`special-request-label`}>
                      Special request
                    </InputLabel>
                    <Select
                      labelId={`special-request-label`}
                      name={`specialRequest`}
                      defaultValue={subscription.specialRequest}
                      sx={{ minWidth: 250 }}
                      size="small"
                    >
                      {Object.keys(SubscriptionSpecialRequest).map(
                        (request: any) => (
                          <MenuItem value={request} key={request}>
                            {request}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Box>
                <Box my={2}>
                  <div>
                    <FormControl>
                      <TextField
                        name="recipientName"
                        label="Recipent, name"
                        variant="outlined"
                        size="small"
                        defaultValue={subscription.recipientName}
                        error={data?.validationErrors?.recipientName}
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
                        error={data?.validationErrors?.recipientAddress1}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientAddress2"
                        label="Address2"
                        variant="outlined"
                        size="small"
                        defaultValue={subscription.recipientAddress2}
                        error={data?.validationErrors?.recipientAddress2}
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
                        error={data?.validationErrors?.recipientPostalCode}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientPostalPlace"
                        label="Place"
                        variant="outlined"
                        size="small"
                        defaultValue={subscription.recipientPostalPlace}
                        error={data?.validationErrors?.recipientPlace}
                      />
                    </FormControl>
                  </div>
                  <div>
                    <FormControl>
                      <FormControlLabel
                        sx={{ margin: 0.5 }}
                        control={
                          <Checkbox
                            name="isPrivateDeliveryAddress"
                            defaultChecked={
                              subscription.isPrivateDeliveryAddress
                            }
                          />
                        }
                        label="Is private address (Private product in Cargonizer/Bring will be used - OBS max 5kg)"
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
                        error={data?.validationErrors?.recipientEmail}
                      />
                    </FormControl>
                    <FormControl>
                      <TextField
                        name="recipientMobile"
                        label="Mobile"
                        variant="outlined"
                        size="small"
                        defaultValue={subscription.recipientMobile}
                        error={data?.validationErrors?.recipientMobile}
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
                      {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                  </FormControl>
                </div>
              </Form>
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
      <Dialog open={openSetFirstDelivery}>
        <Box sx={{ ...modalStyle }}>
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
                  <InputLabel id="date-label">New Delivery day</InputLabel>
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
                  onClick={() => setOpenSetFirstDelivery(false)}
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
                    setOpenSetFirstDelivery(false);
                  }}
                  sx={{ m: 2, marginTop: 4 }}
                  type="submit"
                  name="_action"
                  value="set-first-delivery"
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </Form>
        </Box>
      </Dialog>
    </main>
  );
}

export function ErrorBoundary() {
  const { subscriptionId } = useParams();
  return (
    <div className="error-container">{`There was an error loading subscription by the id ${subscriptionId}. Sorry.`}</div>
  );
}
