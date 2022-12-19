import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useTransition,
  useLoaderData,
  Outlet,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
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

import type { Coffee, OrderItem } from '@prisma/client';
import { ShippingType } from '@prisma/client';
import { OrderStatus, OrderType } from '@prisma/client';

import { getOrder } from '~/_libs/core/models/order.server';
import { upsertOrderAction } from './_shared';
import DataLabel from '~/components/DataLabel';
import { getActiveCoffees } from '~/_libs/core/models/coffee.server';
import { toPrettyDateTime } from '~/_libs/core/utils/dates';
import { coffeeVariationToLabel } from '~/_libs/core/utils/labels';
import { useEffect, useState } from 'react';
import { modalStyle } from '~/style/theme';
import { completeOrders } from '~/_libs/core/services/order-service';

type LoaderData = {
  coffees: Awaited<ReturnType<typeof getActiveCoffees>>;
  order: Awaited<ReturnType<typeof getOrder>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const order = await getOrder({
    where: { id: +params.id },
    include: {
      orderItems: true,
      delivery: true,
      subscription: true,
    },
  });
  invariant(order, `Order not found: ${params.id}`);

  const coffees = await getActiveCoffees();

  return json({ order, coffees });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'send-order') return await completeOrders([+values.id]);
  else if (_action === 'update') return await upsertOrderAction(values);

  return null;
};

function resolveCoffeeCode(coffeeId: number, coffees: Coffee[]) {
  const coffee = coffees.find((c) => c.id === coffeeId);

  return coffee?.productCode || `${coffeeId}`;
}

export default function UpdateOrder() {
  const { order, coffees } = useLoaderData() as unknown as LoaderData;
  const data = useActionData();

  const [resultData, setResultData] = useState<[] | null>(null);
  const [open, setOpen] = useState(false);

  const errors = useActionData();
  const transition = useTransition();

  useEffect(() => {
    setResultData(data);
  }, [data]);

  const isUpdating = Boolean(transition.submission);

  if (!order) return null;

  const isReadOnly = !!order.wooOrderId;

  const canComplete =
    order.status === OrderStatus.ACTIVE &&
    (order.orderItems.length > 0 ||
      order.quantity250 ||
      order.quantity500 ||
      order.quantity1200);

  const handleClose = (_event: any, reason: string) => {
    if (reason === 'closeBtnClick') {
      setResultData(null);
      setOpen(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h1">Order Details</Typography>

      <Grid container>
        <Grid item>
          <Box sx={{ m: 2 }}>
            <DataLabel
              label="Subscription"
              data={`${order.subscription.recipientName}`}
              dataLinkUrl={`/subscriptions/admin/${order.subscriptionId}`}
            />
            <DataLabel
              label="Created At"
              data={toPrettyDateTime(order.createdAt, true)}
            />
            <DataLabel
              label="Updated At"
              data={toPrettyDateTime(order.updatedAt, true)}
            />
            {order.wooOrderId && (
              <DataLabel label="Woo Order ID" data={order.wooOrderId} />
            )}
          </Box>
        </Grid>
        <Grid item>
          <Box sx={{ m: 2 }}>
            <Form method="post">
              <input type="hidden" name="id" value={order.id} />
              <input
                type="hidden"
                name="wooOrderId"
                value={order.wooOrderId || undefined}
              />
              <Button
                sx={{ height: 50 }}
                type="submit"
                name="_action"
                value="send-order"
                variant="contained"
                onClick={handleOpen}
                disabled={!canComplete}
              >
                <LocalShippingIcon sx={{ mx: 1 }} /> Ship Order
              </Button>
            </Form>
          </Box>
        </Grid>
      </Grid>

      <Form method="post">
        <input type="hidden" name="id" value={order.id} />
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

        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`status-label`}>Status</InputLabel>
          <Select
            labelId="status-label"
            name="status"
            defaultValue={order.status}
            sx={{ minWidth: 250 }}
          >
            {Object.keys(OrderStatus).map((status: any) => (
              <MenuItem value={status} key={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`type-label`}>Type</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            defaultValue={order.type}
            sx={{ minWidth: 250 }}
            disabled={true}
          >
            {Object.keys(OrderType).map((type: any) => (
              <MenuItem value={type} key={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`shipping-type-label`}>Shipping</InputLabel>
          <Select
            labelId="shipping-type-label"
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
        <div>
          <Typography variant="h3">Recipient</Typography>
          <FormControl>
            <TextField
              name="name"
              label="Name"
              variant="outlined"
              defaultValue={order.name}
              error={errors?.name}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="address1"
              label="Address1"
              variant="outlined"
              defaultValue={order.address1}
              error={errors?.address1}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="address2"
              label="Address2"
              variant="outlined"
              defaultValue={order.address2}
              error={errors?.address2}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="postalCode"
              label="Postal code"
              variant="outlined"
              defaultValue={order.postalCode}
              error={errors?.postalCode}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="postalPlace"
              label="Place"
              variant="outlined"
              defaultValue={order.postalPlace}
              error={errors?.postalPlace}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="email"
              label="Email"
              variant="outlined"
              defaultValue={order.email}
              error={errors?.email}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="mobile"
              label="Mobile"
              variant="outlined"
              defaultValue={order.mobile}
              error={errors?.mobile}
            />
          </FormControl>
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
                error={errors?.quantity250}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="quantity500"
                label="Quantity 500"
                variant="outlined"
                defaultValue={order.quantity500}
                error={errors?.quantity500}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="quantity1200"
                label="Quantity 1200"
                variant="outlined"
                defaultValue={order.quantity1200}
                error={errors?.quantity1200}
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
              {isUpdating ? 'Updating...' : 'Update Order'}
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
                {order.orderItems.map((item: OrderItem) => (
                  <TableRow
                    key={item.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      {resolveCoffeeCode(item.coffeeId, coffees)}
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
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            {!resultData && (
              <Grid container>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <CircularProgress color="primary" />
                  <Typography>Completing order...</Typography>
                </Grid>
              </Grid>
            )}
            {resultData && (
              <Box>
                <Typography variant="h6" component="h2">
                  Order completed
                </Typography>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table sx={{ minWidth: 650 }} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Result</TableCell>
                        <TableCell>Order</TableCell>
                        <TableCell>Woo id/status</TableCell>
                        <TableCell>Woo error</TableCell>
                        <TableCell>Cargonizer Print requested</TableCell>
                        <TableCell>Cargonizer Print error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultData.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{row.result}</TableCell>
                          <TableCell>{row.orderId}</TableCell>
                          <TableCell>
                            {row.wooOrderId || ''} {row.wooOrderStatus || ''}
                          </TableCell>
                          <TableCell>{row.wooError}</TableCell>
                          <TableCell>
                            {row.printRequested ? 'Yes' : 'No'}
                          </TableCell>
                          <TableCell>{row.printError}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Grid container>
                  <Grid item xs={12} style={{ textAlign: 'right' }}>
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
        </Modal>
      </div>
    </Box>
  );
}
