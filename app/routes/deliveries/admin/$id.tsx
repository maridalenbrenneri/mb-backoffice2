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
  Snackbar,
  Alert,
} from '@mui/material';

import { getDeliveryById } from '~/_libs/core/repositories/delivery.server';
import type { Delivery } from '~/_libs/core/repositories/delivery.server';
import { upsertAction } from './_shared';
import {
  toPrettyDateTextLong,
  toPrettyDateTime,
} from '~/_libs/core/utils/dates';
import Orders from '~/components/Orders';
import { useEffect, useState } from 'react';
import type { Product } from '@prisma/client';
import { OrderStatus, ProductStatus } from '@prisma/client';
import DataLabel from '~/components/DataLabel';
import { getProducts } from '~/_libs/core/repositories/product';

type LoaderData = {
  loadedDelivery: Delivery;
  products: Product[];
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const loadedDelivery = await getDeliveryById(+params.id, {
    product1: true,
    product2: true,
    product3: true,
    product4: true,
    orders: {
      where: { status: { in: [OrderStatus.ACTIVE, OrderStatus.COMPLETED] } },
      include: {
        orderItems: {
          select: {
            id: true,
            variation: true,
            quantity: true,
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
  });

  invariant(loadedDelivery, `Delivery not found: ${params.id}`);

  const products = await getProducts({
    where: {
      status: ProductStatus.PUBLISHED,
    },
  });
  invariant(products, `Products not found`);

  return json({ loadedDelivery, products });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateDelivery() {
  const { loadedDelivery, products } = useLoaderData() as unknown as LoaderData;

  const data = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  const [delivery, setDelivery] = useState<Delivery>();
  const [openSnack, setOpenSnack] = useState<boolean>(false);

  useEffect(() => {
    setDelivery(loadedDelivery);
  }, [loadedDelivery]);

  useEffect(() => {
    setOpenSnack(!!data?.didUpdate);
  }, [data]);

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
      label: 'Created at',
      data: toPrettyDateTime(delivery.createdAt, true),
    },
    {
      label: 'Updated at',
      data: toPrettyDateTime(delivery.updatedAt, true),
    },
  ];

  const renderProduct = (defaultValue: number | '', coffeeNr: number) => {
    return (
      <FormControl sx={{ m: 1 }}>
        <InputLabel id={`product-${coffeeNr}-label`}>
          Coffee {coffeeNr}
        </InputLabel>
        <Select
          labelId={`product-${coffeeNr}-label`}
          name={`product${coffeeNr}`}
          defaultValue={defaultValue}
          sx={{ minWidth: 250 }}
          size="small"
        >
          {products.map((product: Product) => (
            <MenuItem value={product.id} key={product.id}>
              {product.productCode || 'code not set'} - {product.name}{` - `}<small>{product.stockStatus}</small>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <main>
      <Box m={2}>
        <Snackbar
          open={openSnack}
          autoHideDuration={3000}
          onClose={() => setOpenSnack(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success">{data?.updateMessage || 'Updated'}</Alert>
        </Snackbar>

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

                <div>{renderProduct(delivery.product1Id || '', 1)}</div>
                <div>{renderProduct(delivery.product2Id || '', 2)}</div>
                <div>{renderProduct(delivery.product3Id || '', 3)}</div>
                <div>{renderProduct(delivery.product4Id || '', 4)}</div>

                <div>
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      variant="contained"
                    >
                      {isUpdating ? 'Updating...' : 'Update Products'}
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
