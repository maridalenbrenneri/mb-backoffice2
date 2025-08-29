import type { ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { ProductEntity, ProductStockStatus } from '~/services/entities';
import { createProduct } from '~/services/product.service';
import { isUnsignedInt } from '~/utils/numbers';

const validate = (values: any) => {
  return {
    country: values.country ? null : 'Country is required',
    name: values.name ? null : 'Name is required',
    productCode: values.productCode ? null : 'Product code is required',
    stockStatus: values.stockStatus ? null : 'Stock status is required',
    stockInitial: isUnsignedInt(values.quantity250)
      ? null
      : 'Must be a number greater or equal to zero',
  };
};

type CreateActionData = {
  validationErrors?:
    | {
        name: null | string;
        productCode: null | string;
        country: null | string;
        stockStatus: null | string;
        stockInitial: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

export const createAction = async (values: any) => {
  const validationErrors = validate(values);

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<CreateActionData>({ validationErrors });
  }

  const data: Partial<ProductEntity> = {
    productCode: values.type,
    country: values.country,
    name: values.name,
    status: values.status,
    stockStatus: values.stockStatus,
    stockInitial: values.stockInitial,
    category: 'coffee',
  };

  await createProduct(data);

  return redirect(`/products}`);
};

const renderStockStatus = (
  status: ProductStockStatus = ProductStockStatus.ON_BACKORDER
) => {
  return (
    <FormControl>
      <InputLabel id={`product-stock-status`}>Stock status</InputLabel>
      <Select
        labelId={`product-stock-status`}
        name={`stockStatus`}
        defaultValue={status}
        sx={{ minWidth: 200, marginBottom: 2 }}
        size="small"
      >
        <MenuItem value={ProductStockStatus.ON_BACKORDER}>
          On backorder
        </MenuItem>
        <MenuItem value={ProductStockStatus.IN_STOCK}>
          In stock (In roastery)
        </MenuItem>
        <MenuItem value={ProductStockStatus.OUT_OF_STOCK}>
          {' '}
          Out of stock
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default function NewProduct() {
  const errors = useActionData();
  const navigation = useNavigation();

  const isCreating = Boolean(navigation.state === 'submitting');

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Create New Product</Typography>
      <Form>
        <div>
          <FormControl>
            <TextField
              name="country"
              label="Country"
              variant="outlined"
              size="small"
              defaultValue={''}
              error={errors?.country}
            />
          </FormControl>

          <FormControl>
            <TextField
              name="name"
              label="Name"
              variant="outlined"
              size="small"
              defaultValue={''}
              error={errors?.name}
            />
          </FormControl>

          <FormControl>
            <TextField
              name="productCode"
              label="Product code"
              variant="outlined"
              size="small"
              defaultValue={''}
              error={errors?.productCode}
            />
          </FormControl>
        </div>
        <div>
          <FormControl>
            <TextField
              name="stockInitial"
              label="Stock initial (kg)"
              variant="outlined"
              defaultValue={0}
              error={errors?.stockInitial}
              size="small"
            />
          </FormControl>

          {renderStockStatus()}
        </div>

        <div>
          <FormControl>
            <TextField
              name="infoLink"
              label="Info link"
              variant="outlined"
              size="small"
              defaultValue={''}
            />
          </FormControl>
        </div>

        <div>
          <FormControl>
            <TextField
              name="internalNote"
              label="Note (internal)"
              variant="outlined"
              size="small"
              multiline
            />
          </FormControl>
        </div>

        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isCreating} variant="contained">
              {isCreating ? 'Creating...' : 'Create Product'}
            </Button>
          </FormControl>
        </div>
      </Form>
    </Box>
  );
}
