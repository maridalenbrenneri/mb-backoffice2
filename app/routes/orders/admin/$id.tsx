import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  Outlet,
  useSubmit,
  useNavigation,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  FormControl,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';

import type {
  OrderEntity,
  OrderItemEntity,
  ProductEntity,
} from '~/services/entities';
import { ShippingType } from '~/services/entities';
import { OrderStatus, OrderType } from '~/services/entities';

import { getOrder, updateOrder } from '~/services/order.service';
import { upsertOrderAction } from './_shared';
import DataLabel from '~/components/DataLabel';
import type { DeliveryDate } from '~/utils/dates';
import { getNextDeliveryDates } from '~/utils/dates';
import { toPrettyDateTextLong, toPrettyDateTime } from '~/utils/dates';
import { coffeeVariationToLabel } from '~/utils/labels';
import { useEffect, useState } from 'react';
import { modalStyle } from '~/style/theme';
import {
  activateOrder,
  cancelOrder,
  completeAndShipOrders,
  completeOrder,
} from '~/services/order.service';
import { FIKEN_CONTACT_URL } from '~/settings';
import { getNextOrCreateDelivery } from '~/services/delivery.service';
import { DateTime } from 'luxon';
import CompleteAndShipResultBox from '~/components/CompleteAndShipResultBox';
import { getProducts } from '~/services/product.service';

type LoaderData = {
  products: Awaited<ReturnType<typeof getProducts>>;
  loadedOrder: Awaited<ReturnType<typeof getOrder>>;
  deliveryDates: Awaited<ReturnType<typeof getNextDeliveryDates>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const loadedOrder = await getOrder({
    where: { id: +params.id },
    include: {
      orderItems: true,
      delivery: true,
      subscription: true,
    },
  });
  invariant(loadedOrder, `Order not found: ${params.id}`);

  const products = await getProducts();

  const deliveryDates = getNextDeliveryDates(5);

  return json({ loadedOrder, products, deliveryDates });
};

async function completeAndShipOrderAction(id: number) {
  return {
    completeAndShipOrderActionResult: await completeAndShipOrders([id]),
  };
}

async function updateStatusAction(id: number, _action: string) {
  if (_action === 'cancel-order') {
    await cancelOrder(id);
    return { didUpdate: true, updateMessage: 'Order was cancelled' };
  }
  if (_action === 'complete-order') {
    await completeOrder(id);
    return { didUpdate: true, updateMessage: 'Order was completed' };
  }
  if (_action === 'activate-order') {
    await activateOrder(id);
    return { didUpdate: true, updateMessage: 'Order was activated' };
  }

  return null;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'complete-and-ship-order')
    return await completeAndShipOrderAction(+values.id);
  else if (_action === 'update') return await upsertOrderAction(values);
  else if (_action === 'set-delivery') {
    const date = DateTime.fromISO(values.date as string);
    const deliveryDate = await getNextOrCreateDelivery(date);

    await updateOrder(+values.id, {
      deliveryId: deliveryDate.id,
    });

    return {
      didUpdate: true,
      updateMessage: 'Delivery date was updated',
    };
  }

  return await updateStatusAction(+values.id, _action as string);
};

function resolveCoffeeCode(
  productId: number | null,
  products: ProductEntity[]
) {
  if (!productId) return 'n/a';
  const product = products.find((c) => c.id === productId);
  return product?.productCode || `${productId}`;
}

export default function UpdateOrder() {
  const { loadedOrder, products, deliveryDates } =
    useLoaderData() as unknown as LoaderData;
  const data = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openCompleteAndShip, setOpenCompleteAndShip] = useState(false);

  const [order, setOrder] = useState<OrderEntity>();
  const [deliveryDate, setDeliveryDate] = useState(deliveryDates[0]);
  const [openSetNewDelivery, setOpenSetNewDelivery] = useState(false);

  useEffect(() => {
    setOrder(loadedOrder || undefined);
  }, [loadedOrder]);

  useEffect(() => {
    setOpenSnack(!!data?.didUpdate);
  }, [data]);

  if (!order) return null;

  const isUpdating = Boolean(navigation.state === 'submitting');
  const isReadOnly = !!order.wooOrderId;

  const canComplete =
    order.status === OrderStatus.ACTIVE &&
    (order.orderItems.length > 0 ||
      order.quantity250 ||
      order.quantity500 ||
      order.quantity1200);

  const handleClose = (_event: any, reason: string) => {
    if (reason === 'closeBtnClick') {
      setOpenCompleteAndShip(false);
    }
  };

  const handleOpen = () => {
    setOpenCompleteAndShip(true);
  };

  const handleChangeDeliveryDay = (event: any) => {
    const selectedDeliveryDate = deliveryDates.find(
      (d) => d.id === (event.target.value as number)
    );

    if (!selectedDeliveryDate) return;

    setDeliveryDate(selectedDeliveryDate);
  };

  const handleOpenDeliveryDay = () => {
    setOpenSetNewDelivery(true);
  };

  const dataFields: any[] = [
    {
      label: 'Status',
      data: order.status,
    },
    {
      label: 'Type',
      data: order.type,
    },
    {
      label: 'Subscription',
      data: order.subscription.recipientName,
      dataLinkUrl: `/subscriptions/admin/${order.subscriptionId}`,
    },
    {
      label: 'Special request',
      data: order.subscription.specialRequest,
    },
    {
      label: 'Delivery day',
      data: toPrettyDateTextLong(order.delivery.date),
      onClick: handleOpenDeliveryDay,
    },
    {
      label: 'Tracking url',
      data: order.trackingUrl || '',
      dataLinkUrl: `${order.trackingUrl}`,
    },
    {
      label: 'Created/Imported at',
      data: toPrettyDateTime(order.createdAt, true),
    },
    {
      label: 'Updated at',
      data: toPrettyDateTime(order.updatedAt, true),
    },
  ];

  const dataFieldsWoo: any[] = [
    {
      label: 'Woo order id',
      data: order.wooOrderId || '',
    },
    {
      label: 'Woo order number',
      data: order.wooOrderNumber || '',
    },
    {
      label: 'Woo created at',
      data: toPrettyDateTime(order.wooCreatedAt, true),
    },
    {
      label: 'Woo updated at',
      data: toPrettyDateTime(order.wooUpdatedAt, true),
    },
  ];

  const dataFieldsFiken: any[] = [
    {
      label: 'Fiken customer id',
      data: order.subscription?.fikenContactId,
      dataLinkUrl: `${FIKEN_CONTACT_URL}${order.subscription?.fikenContactId}`,
    },
  ];

  return (
    <Box
      m={2}
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

      <Typography variant="h1">Order Details</Typography>
      <Grid container>
        <Grid item md={6}>
          <Box sx={{ m: 1 }}>
            <DataLabel dataFields={dataFields} />
          </Box>
        </Grid>

        {order.wooOrderId && (
          <Grid item md={6}>
            <Box sx={{ m: 1 }}>
              <DataLabel dataFields={dataFieldsWoo} />
            </Box>
          </Grid>
        )}

        {order.subscription?.fikenContactId && (
          <Grid item md={6}>
            <Box sx={{ m: 1 }}>
              <DataLabel dataFields={dataFieldsFiken} />
            </Box>
          </Grid>
        )}

        <Grid item sm={12} md={8}>
          <Box sx={{ my: 4, mx: 2 }}>
            <Form method="post">
              <input type="hidden" name="id" value={order.id} />
              <input
                type="hidden"
                name="wooOrderId"
                value={order.wooOrderId || undefined}
              />
              <FormControl>
                <ButtonGroup>
                  <Button
                    type="submit"
                    name="_action"
                    value="activate-order"
                    variant="contained"
                    disabled={order.status === OrderStatus.ACTIVE || isUpdating}
                  >
                    <RefreshIcon sx={{ mx: 1 }} /> Activate
                  </Button>
                  <Button
                    type="submit"
                    name="_action"
                    value="complete-order"
                    variant="contained"
                    disabled={!canComplete || isUpdating}
                  >
                    <DoneIcon sx={{ mx: 1 }} /> Complete
                  </Button>
                  <Button
                    type="submit"
                    name="_action"
                    value="cancel-order"
                    variant="contained"
                    disabled={order.status !== OrderStatus.ACTIVE || isUpdating}
                  >
                    <CancelIcon sx={{ mx: 1 }} /> Cancel
                  </Button>
                </ButtonGroup>
              </FormControl>
              <FormGroup sx={{ marginTop: 2, maxWidth: 300 }}>
                <FormControl>
                  <Button
                    type="submit"
                    name="_action"
                    value="complete-and-ship-order"
                    variant="contained"
                    onClick={handleOpen}
                    disabled={!canComplete || isUpdating}
                  >
                    <LocalShippingIcon sx={{ mx: 1 }} /> Complete & Ship Order
                  </Button>
                </FormControl>
              </FormGroup>
              {!canComplete && order.status === 'ACTIVE' && (
                <FormGroup sx={{ marginTop: 2 }}>
                  <small>
                    Order cannot be completed because it has no order items.
                  </small>
                </FormGroup>
              )}
            </Form>
          </Box>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Form method="post">
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="status" value={order.status} />
          <input
            type="hidden"
            name="subscriptionId"
            value={order.subscriptionId}
          />
          <input type="hidden" name="deliveryId" value={order.deliveryId} />
          <input type="hidden" name="type" value={order.type} />
          <input
            type="hidden"
            name="customerNote"
            value={order.customerNote || undefined}
          />

          <div>
            <Typography variant="h3">Shipping</Typography>
            <FormControl sx={{ m: 1 }}>
              <Select
                name="shippingType"
                defaultValue={order.shippingType}
                sx={{ minWidth: 250 }}
              >
                {Object.keys(ShippingType).map((type: any) => (
                  <MenuItem value={type} key={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <Typography variant="h3">Recipient</Typography>
            <div>
              <FormControl>
                <TextField
                  name="name"
                  label="Name"
                  variant="outlined"
                  defaultValue={order.name}
                  error={data?.validationErrors?.name}
                />
              </FormControl>
            </div>
            <div>
              <FormControl>
                <TextField
                  name="address1"
                  label="Address1"
                  variant="outlined"
                  defaultValue={order.address1}
                  error={data?.validationErrors?.address1}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="address2"
                  label="Address2"
                  variant="outlined"
                  defaultValue={order.address2}
                  error={data?.validationErrors?.address2}
                />
              </FormControl>
            </div>
            <div>
              <FormControl>
                <TextField
                  name="postalCode"
                  label="Postal code"
                  variant="outlined"
                  defaultValue={order.postalCode}
                  error={data?.validationErrors?.postalCode}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="postalPlace"
                  label="Place"
                  variant="outlined"
                  defaultValue={order.postalPlace}
                  error={data?.validationErrors?.postalPlace}
                />
              </FormControl>
            </div>
            <div>
              <FormControl>
                <TextField
                  name="email"
                  label="Email"
                  variant="outlined"
                  defaultValue={order.email}
                  error={data?.validationErrors?.email}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="mobile"
                  label="Mobile"
                  variant="outlined"
                  defaultValue={order.mobile}
                  error={data?.validationErrors?.mobile}
                />
              </FormControl>
            </div>
          </div>
          <div>
            <FormControl>
              <TextField
                name="internalNote"
                label="Internal note"
                variant="outlined"
                multiline
                defaultValue={order.internalNote}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="customerNote"
                label="Customer note"
                variant="outlined"
                multiline
                disabled
                defaultValue={order.customerNote}
              />
            </FormControl>
          </div>
          {order.type !== OrderType.CUSTOM && (
            <div>
              <Typography variant="h3">Coffee</Typography>
              <FormControl>
                <TextField
                  name="quantity250"
                  label="Quantity 250"
                  variant="outlined"
                  defaultValue={order.quantity250}
                  error={data?.validationErrors?.quantity250}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="quantity500"
                  label="Quantity 500"
                  variant="outlined"
                  defaultValue={order.quantity500}
                  error={data?.validationErrors?.quantity500}
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="quantity1200"
                  label="Quantity 1200"
                  variant="outlined"
                  defaultValue={order.quantity1200}
                  error={data?.validationErrors?.quantity1200}
                />
              </FormControl>
            </div>
          )}
          <div>
            <FormControl sx={{ m: 1 }}>
              <Button
                variant="contained"
                type="submit"
                disabled={isUpdating || isReadOnly}
                name="_action"
                value="update"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </FormControl>
          </div>
        </Form>
        {order.type === OrderType.CUSTOM && (
          <Box my={2}>
            <Typography variant="h3">Items</Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Coffee</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item: OrderItemEntity) => (
                    <TableRow
                      key={item.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        {resolveCoffeeCode(item.productId, products)}
                      </TableCell>
                      <TableCell>
                        {coffeeVariationToLabel(item.variation)}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box m={2}>
              <Outlet />
            </Box>
          </Box>
        )}
      </Paper>
      <Dialog
        open={openCompleteAndShip}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={'xl'}
      >
        <Box sx={modalStyle}>
          {!data?.completeAndShipOrderActionResult && (
            <Grid container>
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <CircularProgress color="primary" />
                <Typography>Completing order...</Typography>
              </Grid>
            </Grid>
          )}
          {data?.completeAndShipOrderActionResult && (
            <Box>
              <CompleteAndShipResultBox
                result={data.completeAndShipOrderActionResult}
              />

              <Grid container>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    onClick={() => handleClose(null, 'closeBtnClick')}
                    sx={{ m: 2, marginTop: 4 }}
                  >
                    Close
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Dialog>

      <Dialog open={openSetNewDelivery}>
        <Box sx={{ ...modalStyle }}>
          <Form method="post">
            <input type="hidden" name="id" value={order.id} />
            <input
              type="hidden"
              name="date"
              value={deliveryDate.date.toString()}
            />
            <Grid container>
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <FormControl sx={{ m: 1 }}>
                  <InputLabel id="date-label">New Delivery day</InputLabel>
                  <Select
                    labelId="date-label"
                    defaultValue={`${deliveryDates[0].date}`}
                    onChange={handleChangeDeliveryDay}
                    sx={{ minWidth: 200 }}
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
                  onClick={() => setOpenSetNewDelivery(false)}
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
                    setOpenSetNewDelivery(false);
                  }}
                  sx={{ m: 2, marginTop: 4 }}
                  name="_action"
                  value="set-delivery"
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </Form>
        </Box>
      </Dialog>
    </Box>
  );
}
