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

import type { OrderItem } from '@prisma/client';
import { OrderStatus, OrderType } from '@prisma/client';

import { getOrder } from '~/_libs/core/models/order.server';
import { upsertAction, sendOrderAction } from './_shared';
import DataLabel from '~/components/DataLabel';
import { getActiveCoffees } from '~/_libs/core/models/coffee.server';

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

  if (_action === 'send-order') return await sendOrderAction(values);
  else if (_action === 'update') return await upsertAction(values);

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
      <Typography variant="h2">Order</Typography>
      <Box sx={{ m: 2 }}>
        <Box sx={{ m: 1 }}>
          <DataLabel
            label="Subscription"
            data={`${order.subscriptionId} - ${order.subscription.recipientName}`}
          />
        </Box>
      </Box>

      <Form method="post">
        <input type="hidden" name="id" value={order.id} />
        <Button type="submit" name="_action" value="send-order">
          Ship Order
        </Button>
      </Form>

      <Form method="post">
        <input type="hidden" name="id" value={order.id} />
        <input
          type="hidden"
          name="subscriptionId"
          value={order.subscriptionId}
        />
        <input type="hidden" name="deliveryId" value={order.deliveryId} />

        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`status-label`}>Status</InputLabel>
          <Select
            labelId="status-label"
            name="status"
            defaultValue={order.status}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value={OrderStatus.ACTIVE}>{OrderStatus.ACTIVE}</MenuItem>
            <MenuItem value={OrderStatus.ON_HOLD}>
              {OrderStatus.ON_HOLD}
            </MenuItem>
            <MenuItem value={OrderStatus.COMPLETED}>
              {OrderStatus.COMPLETED}
            </MenuItem>
            <MenuItem value={OrderStatus.CANCELLED}>
              {OrderStatus.CANCELLED}
            </MenuItem>
            <MenuItem value={OrderStatus.DELETED}>
              {OrderStatus.DELETED}
            </MenuItem>
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
            <MenuItem value={OrderType.NON_RECURRING}>
              {OrderType.NON_RECURRING}
            </MenuItem>
            <MenuItem value={OrderType.RECURRING}>
              {OrderType.RECURRING}
            </MenuItem>
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
              label="Note"
              variant="outlined"
              multiline
            />
          </FormControl>
        </div>
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
      </Box>

      <Box m={2}>
        <Outlet />
      </Box>
    </Box>
  );
}
