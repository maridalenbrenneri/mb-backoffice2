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
  Typography,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';

import { getDeliveries } from '~/_libs/core/models/delivery.server';
import type { Delivery } from '~/_libs/core/models/delivery.server';
import { upsertAction } from './_shared';
import type { Coffee } from '~/_libs/core/models/coffee.server';
import { getCoffees } from '~/_libs/core/models/coffee.server';
import {
  toPrettyDateTextLong,
  toPrettyDateTime,
} from '~/_libs/core/utils/dates';
import Orders from '~/components/Orders';
import { useEffect, useState } from 'react';
import { CoffeeStatus } from '@prisma/client';
import DataLabel from '~/components/DataLabel';

type LoaderData = { loadedDelivery: Delivery; coffees: Coffee[] };

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
  const loadedDelivery = deliveries?.length ? deliveries[0] : null;
  invariant(loadedDelivery, `Delivery not found: ${params.id}`);

  const coffees = await getCoffees({
    where: {
      status: CoffeeStatus.ACTIVE,
    },
  });
  invariant(coffees, `Coffees not found`);

  return json({ loadedDelivery, coffees });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

function resolveCoffeeLabel(coffee: Coffee | undefined | null) {
  if (!coffee) return '';
  return `${coffee.productCode} - ${coffee.name}`;
}

export default function UpdateDelivery() {
  const { loadedDelivery, coffees } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  const [delivery, setDelivery] = useState<Delivery>();

  useEffect(() => {
    setDelivery(loadedDelivery);
  }, [loadedDelivery]);

  if (!delivery) return null;

  const dataFields: any[] = [
    {
      label: 'Date',
      data: toPrettyDateTextLong(delivery.date),
    },
    {
      label: 'Type',
      data: delivery.type,
    },
    {
      label: 'Coffee 1',
      data: resolveCoffeeLabel(delivery.coffee1),
    },
    {
      label: 'Coffee 2',
      data: resolveCoffeeLabel(delivery.coffee2),
    },
    {
      label: 'Coffee 3',
      data: resolveCoffeeLabel(delivery.coffee3),
    },
    {
      label: 'Coffee 4',
      data: resolveCoffeeLabel(delivery.coffee4),
    },
    {
      label: 'Created at',
      data: toPrettyDateTime(delivery.createdAt, true),
    },
    {
      label: 'Updated at',
      data: toPrettyDateTime(delivery.updatedAt, true),
    },
  ];

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
          size="small"
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
        <Typography variant="h1">Delivery Day Details</Typography>

        <Grid container>
          <Grid item>
            <Box sx={{ m: 1 }}>
              <DataLabel dataFields={dataFields} />
            </Box>
          </Grid>
          <Grid item>
            <Box
              m={2}
              marginLeft={5}
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
                <input
                  type="hidden"
                  name="delivery_type"
                  value={delivery.type}
                />

                <div>{renderCoffee(delivery.coffee1Id || '', 1)} </div>
                <div>{renderCoffee(delivery.coffee2Id || '', 2)}</div>
                <div>{renderCoffee(delivery.coffee3Id || '', 3)}</div>
                <div>{renderCoffee(delivery.coffee4Id || '', 4)}</div>

                <div>
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      variant="contained"
                    >
                      {isUpdating ? 'Updating...' : 'Update Coffees'}
                    </Button>
                  </FormControl>
                </div>
              </Form>
            </Box>
          </Grid>
        </Grid>

        <Box my={2}>
          <Typography variant="h2">Orders</Typography>
          <Orders orders={delivery.orders} />
        </Box>
      </Box>
    </main>
  );
}
