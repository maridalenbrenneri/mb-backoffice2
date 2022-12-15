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
  TextField,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';

import { getDeliveries } from '~/_libs/core/models/delivery.server';
import type { Delivery } from '~/_libs/core/models/delivery.server';
import { upsertAction } from './_shared';
import type { Coffee } from '~/_libs/core/models/coffee.server';
import { getCoffees } from '~/_libs/core/models/coffee.server';
import { toPrettyDate } from '~/_libs/core/utils/dates';
import Orders from '~/components/Orders';

type LoaderData = { delivery: Delivery; coffees: Coffee[] };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const deliveries = await getDeliveries({
    where: { id: +params.id },
    include: {
      coffee1: true,
      coffee2: true,
      coffee3: true,
      coffee4: true,
      orders: {
        include: {
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
          createdAt: 'desc',
        },
      },
    },
  });
  const delivery = deliveries?.length ? deliveries[0] : null;
  invariant(delivery, `Delivery not found: ${params.id}`);

  const coffees = await getCoffees();
  invariant(coffees, `Coffees not found`);

  return json({ delivery, coffees });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateDelivery() {
  const { delivery, coffees } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  const renderCoffee = (defaultValue: number | '', coffeeNr: number) => {
    return (
      <FormControl sx={{ m: 1 }}>
        <InputLabel id={`coffee-${coffeeNr}-label`}>
          Coffee {coffeeNr}
        </InputLabel>
        <Select
          labelId={`coffee-${coffeeNr}-label`}
          name={`coffee${coffeeNr}`}
          defaultValue={defaultValue}
          sx={{ minWidth: 250 }}
        >
          {coffees.map((coffee: Coffee) => (
            <MenuItem value={coffee.id} key={coffee.id}>
              {coffee.productCode} - {coffee.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <main>
      <Box m={2}>
        <Typography variant="h1">Delivery Details</Typography>

        <Box
          m={2}
          sx={{
            '& .MuiTextField-root': { m: 1, minWidth: 250 },
          }}
        >
          <Form method="post">
            <input type="hidden" name="id" value={delivery.id} />
            <input
              type="hidden"
              name="delivery_date"
              value={delivery.date.toString()}
            />
            <input type="hidden" name="delivery_type" value={delivery.type} />
            <FormControl>
              <TextField
                label="Date"
                variant="outlined"
                defaultValue={`${toPrettyDate(delivery.date)} - ${
                  delivery.type
                }`}
                error={errors?.date}
                disabled={true}
              />
            </FormControl>

            {renderCoffee(delivery.coffee1Id || '', 1)}
            {renderCoffee(delivery.coffee2Id || '', 2)}
            {renderCoffee(delivery.coffee3Id || '', 3)}
            {renderCoffee(delivery.coffee4Id || '', 4)}

            <div>
              <FormControl sx={{ m: 1 }}>
                <Button type="submit" disabled={isUpdating} variant="contained">
                  {isUpdating ? 'Updating...' : 'Update Delivery'}
                </Button>
              </FormControl>
            </div>
          </Form>
        </Box>

        <Box my={2}>
          <Typography variant="h2">Orders</Typography>
          <Orders orders={delivery.orders} />
        </Box>
      </Box>
    </main>
  );
}
