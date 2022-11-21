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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
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

import type { OrderItem } from '@prisma/client';
import { OrderStatus, OrderType } from '@prisma/client';

import { getOrder } from '~/_libs/core/models/order.server';
import { upsertOrderAction, shipOrderAction } from './_shared';
import DataLabel from '~/components/DataLabel';
import { getActiveCoffees } from '~/_libs/core/models/coffee.server';
import { toPrettyDateTime } from '~/_libs/core/utils/dates';

type LoaderData = {
  coffees: Awaited<ReturnType<typeof getActiveCoffees>>;
  order: Awaited<ReturnType<typeof getOrder>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const order = await getOrder(+params.id);
  invariant(order, `Order not found: ${params.id}`);

  const coffees = await getActiveCoffees();

  return json({ order, coffees });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'send-order') return await shipOrderAction(values);
  else if (_action === 'update') return await upsertOrderAction(values);

  return null;
};

export default function UpdateOrder() {
  const { order } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  if (!order) return null;

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
              <Button
                sx={{ height: 50 }}
                type="submit"
                name="_action"
                value="send-order"
                variant="contained"
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
              disabled={isUpdating}
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
                    <TableCell>{item.coffeeId}</TableCell>
                    <TableCell>{item.variation}</TableCell>
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
    </Box>
  );
}
