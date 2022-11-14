import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useTransition,
  useLoaderData,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import { getOrder } from '~/_libs/core/models/order.server';
import type { Order } from '~/_libs/core/models/order.server';
import { upsertAction } from './_shared';
import { OrderStatus } from '@prisma/client';

type LoaderData = { order: Order };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const order = await getOrder(+params.id);
  invariant(order, `Order not found: ${params.id}`);

  return json({ order });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateOrder() {
  const { order } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Order</Typography>
      <Form method="post">
        <input type="hidden" name="id" value={order.id} />
        <input
          type="hidden"
          name="subscriptionId"
          value={order.subscriptionId}
        />
        <input type="hidden" name="deliveryId" value={order.deliveryId} />

        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`status-label`}>Type</InputLabel>
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
        <FormControl>
          <TextField
            name="quantity250"
            label="Quantity 250"
            variant="outlined"
            error={errors?.quantity250}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity500"
            label="Quantity 500"
            variant="outlined"
            error={errors?.quantity500}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity1200"
            label="Quantity 1200"
            variant="outlined"
            error={errors?.quantity1200}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="internalNote"
            label="Note"
            variant="outlined"
            multiline
          />
        </FormControl>
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
        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Order'}
            </Button>
          </FormControl>
        </div>
      </Form>
    </Box>
  );
}
