import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
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
  Snackbar,
  Alert,
  Grid2,
} from '@mui/material';

import { getDeliveryById } from '~/services/delivery.service';
import { upsertAction } from './_shared';
import { toPrettyDateTextLong, toPrettyDateTime } from '~/utils/dates';
import Orders from '~/components/Orders';
import { useEffect, useState } from 'react';
import {
  OrderStatus,
  ProductStatus,
  ProductStockStatus,
} from '~/services/entities/enums';
import DataLabel from '~/components/DataLabel';
import { getAllCoffeeProducts } from '~/services/product.service';
import { DeliveryEntity, ProductEntity } from '~/services/entities';
import { In } from 'typeorm';

type LoaderData = {
  loadedDelivery: DeliveryEntity;
  products: ProductEntity[];
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const loadedDelivery = await getDeliveryById(+params.id, {
    relations: [
      'product1',
      'product2',
      'product3',
      'product4',
      'orders',
      'orders.orderItems',
      'orders.orderItems.product',
    ],
  });

  // Filter orders to only include ACTIVE and COMPLETED orders and sort them
  if (loadedDelivery?.orders) {
    loadedDelivery.orders = loadedDelivery.orders
      .filter(
        (order) =>
          order.status === OrderStatus.ACTIVE ||
          order.status === OrderStatus.COMPLETED
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  invariant(loadedDelivery, `Delivery not found: ${params.id}`);

  const products = await getAllCoffeeProducts({
    where: {
      status: In([
        ProductStatus.PUBLISHED,
        ProductStatus.PRIVATE,
        ProductStatus.DRAFT,
      ]),
      stockStatus: In([ProductStockStatus.IN_STOCK]),
    },
    take: 8,
  });
  invariant(products, `Products not found`);

  // Sort products so IN_STOCK appear first, then by name
  products.sort((a, b) => {
    const aPriority = a.status === ProductStatus.PUBLISHED ? 0 : 1;
    const bPriority = b.status === ProductStatus.PUBLISHED ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.name.localeCompare(b.name);
  });

  return json({ loadedDelivery, products });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateDelivery() {
  const { loadedDelivery, products } = useLoaderData() as unknown as LoaderData;

  const data = useActionData() as any;
  // const transition = useTransition();
  const navigation = useNavigation();
  const isUpdating = Boolean(navigation.state === 'submitting');

  const [delivery, setDelivery] = useState<DeliveryEntity>();
  const [openSnack, setOpenSnack] = useState<boolean>(false);

  useEffect(() => {
    setDelivery(loadedDelivery);
  }, [loadedDelivery]);

  useEffect(() => {
    setOpenSnack(!!data?.didUpdate);
  }, [data]);

  if (!delivery) return null;

  const dataFields: { label: string; data: string | number | null }[] = [
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
      <FormControl sx={{ marginTop: 2 }}>
        <InputLabel
          id={`product-${coffeeNr}-label`}
          sx={{
            transform: 'translate(14px, 50%) scale(1)',
            '&.Mui-focused': {
              transform: 'translate(14px, -14px) scale(0.9)',
            },
            '&.MuiFormLabel-filled': {
              transform: 'translate(14px, -14px) scale(0.9)',
            },
          }}
        >
          Coffee {coffeeNr}
        </InputLabel>
        <Select
          labelId={`product-${coffeeNr}-label`}
          name={`product${coffeeNr}`}
          defaultValue={defaultValue}
          sx={{ minWidth: 250 }}
          size="small"
        >
          {products.map((product: ProductEntity) => (
            <MenuItem
              value={product.id}
              key={product.id}
              sx={{
                fontWeight:
                  product.status === ProductStatus.PUBLISHED ? 700 : 400,
              }}
            >
              {product.productCode || 'n/a'} - {product.name}
              {` - `}
              <small>
                {product.stockStatus === ProductStockStatus.IN_STOCK
                  ? 'In stock'
                  : product.stockStatus}
                {product.status === ProductStatus.PUBLISHED
                  ? ' - Published'
                  : ' - Not published'}
              </small>
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

        <Grid2 container>
          <Grid2>
            <Box sx={{ m: 1 }}>
              <DataLabel dataFields={dataFields as any} />
            </Box>
          </Grid2>
          <Grid2>
            <Box
              m={1}
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
                  <FormControl sx={{ marginTop: 2 }}>
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
          </Grid2>
        </Grid2>

        <Box my={2}>
          <Typography variant="h2">Orders</Typography>
          <Orders orders={delivery.orders} />
        </Box>
      </Box>
    </main>
  );
}
