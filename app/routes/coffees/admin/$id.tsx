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

import type { Coffee } from '@prisma/client';
import { CoffeeStatus } from '@prisma/client';

import { getCoffeeById } from '~/_libs/core/models/coffee.server';
import { upsertAction } from './_shared';

type LoaderData = { coffee: Coffee };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);

  const coffee = await getCoffeeById(+params.id);
  invariant(coffee, `Coffee not found: ${params.id}`);

  return json({ coffee });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateCoffee() {
  const { coffee } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  return (
    <main>
      <Typography variant="h1">Coffee Details</Typography>

      <Box
        m={2}
        sx={{
          '& .MuiTextField-root': { m: 1, minWidth: 250 },
        }}
      >
        <Form method="post">
          <input type="hidden" name="id" value={coffee.id} />

          <FormControl>
            <TextField
              name="name"
              label="Name"
              variant="outlined"
              defaultValue={coffee.name}
              error={errors?.name}
              size="small"
            />
          </FormControl>
          <FormControl>
            <TextField
              name="productCode"
              label="Code"
              variant="outlined"
              defaultValue={coffee.productCode}
              error={errors?.productCode}
              size="small"
            />
          </FormControl>
          <FormControl>
            <TextField
              name="country"
              label="Country"
              variant="outlined"
              defaultValue={coffee.country}
              error={errors?.country}
              size="small"
            />
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <InputLabel id={`status-label`}>Type</InputLabel>
            <Select
              labelId={`status-label`}
              name="status"
              defaultValue={coffee.status}
              sx={{ minWidth: 250 }}
              size="small"
            >
              <MenuItem value={CoffeeStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={CoffeeStatus.SOLD_OUT}>Sold out</MenuItem>
              <MenuItem value={CoffeeStatus.IN_STOCK}>In stock</MenuItem>
              <MenuItem value={CoffeeStatus.ORDERED}>Ordered</MenuItem>
              <MenuItem value={CoffeeStatus.DELETED}>DELETED</MenuItem>
            </Select>
          </FormControl>
          <div>
            <FormControl sx={{ m: 1 }}>
              <Button type="submit" disabled={isUpdating} variant="contained">
                {isUpdating ? 'Updating...' : 'Update Coffee'}
              </Button>
            </FormControl>
          </div>
        </Form>
      </Box>
    </main>
  );
}
