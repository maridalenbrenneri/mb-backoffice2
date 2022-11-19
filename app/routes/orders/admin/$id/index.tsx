import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import type { Coffee } from '~/_libs/core/models/coffee.server';
import { getActiveCoffees } from '~/_libs/core/models/coffee.server';
import { upsertOrderItemAction } from '../_shared';
import { getOrder } from '~/_libs/core/models/order.server';

type LoaderData = {
  coffees: Awaited<ReturnType<typeof getActiveCoffees>>;
  order: Awaited<ReturnType<typeof getOrder>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const order = await getOrder(+params.id);
  invariant(order, `Order not found: ${params.id}`);

  const coffees = await getActiveCoffees();

  return json({ coffees, order });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  return await upsertOrderItemAction(values);
};

export default function NewOrderItem() {
  const { coffees, order } = useLoaderData() as unknown as LoaderData;
  const errors = useActionData();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Box
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h4">Add Order Item</Typography>
      <Form method="post">
        <input type="hidden" name="orderId" value={order.id} />
        <FormControl sx={{ m: 1 }}>
          <InputLabel id="coffee-label">Coffee</InputLabel>
          <Select
            labelId="coffee-label"
            name="coffeeId"
            defaultValue={coffees[0].id}
            sx={{ minWidth: 250 }}
          >
            {coffees.map((coffee: Coffee) => (
              <MenuItem value={coffee.id} key={coffee.id}>
                {coffee.productCode} - {coffee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <TextField
            name="variation"
            label="Size"
            variant="outlined"
            error={errors?.variation}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity"
            label="Quantity"
            variant="outlined"
            error={errors?.quantity}
          />
        </FormControl>

        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Item'}
            </Button>
          </FormControl>
        </div>
      </Form>
    </Box>
  );
}
