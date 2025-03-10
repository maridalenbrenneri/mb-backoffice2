import type { ActionFunction } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import * as React from 'react';
import { json } from '@remix-run/node';

import {
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';

import { createAction } from './_shared';
import type { DeliveryDate } from '~/_libs/core/utils/dates';
import { toPrettyDateTextLong } from '~/_libs/core/utils/dates';
import { getNextDeliveryDates } from '~/_libs/core/utils/dates';
import type { Product } from '@prisma/client';
import { ProductStatus } from '@prisma/client';
import { getProducts } from '~/_libs/core/repositories/product';

type LoaderData = {
  deliveryDates: Awaited<ReturnType<typeof getNextDeliveryDates>>;
  products: Awaited<ReturnType<typeof getProducts>>;
};

export const loader = async () => {
  const deliveryDates = getNextDeliveryDates();
  const products = await getProducts({
    where: {
      status: ProductStatus.PUBLISHED,
    },
  });

  return json<LoaderData>({
    deliveryDates,
    products,
  });
};

export const action: ActionFunction = async ({ request }) => {
  return await createAction(request);
};

export default function NewDelivery() {
  const { deliveryDates, products } = useLoaderData() as unknown as LoaderData;
  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === 'submitting');

  const [deliveryDate, setDeliveryDate] = React.useState(deliveryDates[0]);

  const handleChange = (event: SelectChangeEvent) => {
    const dd = deliveryDates.find(
      (d) => d.id === (event.target.value as unknown as number)
    ) as DeliveryDate;
    setDeliveryDate(dd);
  };

  return (
    <Box m={2}>
      <Typography variant="h2">Create Delivery Day</Typography>
      <Form method="post">
        <input
          type="hidden"
          name="delivery_date"
          value={deliveryDate.date.toString()}
        />
        <input type="hidden" name="delivery_type" value={deliveryDate.type} />

        <FormControl sx={{ m: 1 }}>
          <InputLabel id="date-label">Date</InputLabel>
          <Select
            labelId="date-label"
            defaultValue={`${deliveryDates[0].id}`}
            onChange={handleChange}
          >
            {deliveryDates.map((date: DeliveryDate) => (
              <MenuItem value={date.id} key={date.id}>
                {toPrettyDateTextLong(date.date)} - {date.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {[1, 2, 3, 4].map((coffeeNr: number) => (
          <FormControl key={coffeeNr} sx={{ m: 1 }}>
            <InputLabel id={`coffee-${coffeeNr}-label`}>
              Coffee {coffeeNr}
            </InputLabel>
            <Select
              labelId={`coffee-${coffeeNr}-label`}
              name={`coffee${coffeeNr}`}
              defaultValue={''}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              {products.map((product: Product) => (
                <MenuItem value={product.id} key={product.id}>
                  {product.productCode} - {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isCreating} variant="contained">
              {isCreating ? 'Creating...' : 'Create Delivery'}
            </Button>
          </FormControl>
        </div>
      </Form>
    </Box>
  );
}
