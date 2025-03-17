import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';

import { upsertOrderItemAction } from '../_shared';

import { OrderService } from '~/_services/order/order.service';
import { OrderEntity } from '~/_services/order/order.entity';
import { ProductService } from '~/_services/product/product.service';
import { ProductEntity } from '~/_services/product/product.entity';

type LoaderData = {
  coffees: ProductEntity[];
  order: OrderEntity;
};

// TODO: USE outletContext instead of reloading order form db

export const loader: LoaderFunction = async ({ params }) => {
  let orderService = new OrderService();
  let productService = new ProductService();

  invariant(params.id, `params.id is required`);

  const order = await orderService.getOrderById(+params.id);
  invariant(order, `Order not found: ${params.id}`);

  const coffees = await productService.getProducts({
    where: { status: 'PUBLISHED' },
  });

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
  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === 'submitting');

  if (!order || order.wooOrderId) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          '& .MuiTextField-root': { m: 1, minWidth: 250 },
        }}
      >
        <Typography variant="h4">Add Order Item</Typography>
        <Form method="post">
          <input type="hidden" name="orderId" value={order.id} />
          <FormControl sx={{ m: 1 }}>
            <InputLabel id="product-label">Coffee</InputLabel>
            <Select
              labelId="product-label"
              name="productId"
              defaultValue={coffees[0].id}
              sx={{ minWidth: 250 }}
            >
              {coffees.map((coffee: ProductEntity) => (
                <MenuItem value={coffee.id} key={coffee.id}>
                  {coffee.productCode} - {coffee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel id="variation-label">Size</InputLabel>
            <Select
              labelId="variation-label"
              name="variation"
              defaultValue={'_250'}
              sx={{ minWidth: 250, my: 1 }}
            >
              <MenuItem value={'_250'}>250g</MenuItem>
              <MenuItem value={'_500'}>500g</MenuItem>
              <MenuItem value={'_1200'}>1,2kg</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <TextField
              name="quantity"
              label="Quantity"
              variant="outlined"
              error={(errors as any)?.quantity}
            />
          </FormControl>

          <div>
            <FormControl sx={{ m: 1 }}>
              <Button type="submit" disabled={isCreating} variant="contained">
                {isCreating ? 'Adding...' : 'Add Item'}
              </Button>
            </FormControl>
          </div>
        </Form>
      </Box>
    </Paper>
  );
}
