import { json, redirect } from '@remix-run/node';
import {
  ProductEntity,
  ProductStatus,
  ProductStockStatus,
} from '~/services/entities';
import { isUnsignedInt } from '~/utils/numbers';
import { createProduct, updateProduct } from '~/services/product.service';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export type CreateActionData = {
  validationErrors?:
    | {
        name: null | string;
        productCode: null | string;
        country: null | string;
        stockInitial: null | string;
      }
    | undefined;
  didUpdate?: boolean | undefined;
  updateMessage?: string | undefined;
};

const validate = (values: any) => {
  return {
    country: values.country ? null : 'Country is required',
    name: values.name ? null : 'Name is required',
    productCode: values.productCode ? null : 'Product code is required',
    stockInitial: isUnsignedInt(values.stockInitial)
      ? null
      : 'Must be a number greater or equal to zero',
  };
};

export const updateAction = async (values: any) => {
  const validationErrors = validate(values);

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<CreateActionData>({ validationErrors });
  }

  const data: Partial<ProductEntity> = {
    name: values.name as string,
    productCode: values.productCode as string | null,
    country: values.country as string | null,
    stockInitial: +values.stockInitial,
    stockRemaining: +values.stockRemaining,
    infoLink: values.infoLink as string | null,
    internalNote: values.internalNote as string | null,
    labelsPrinted: values.labelsPrinted === 'on',
  };

  const result = await updateProduct(+values.id, data);

  if (!result) {
    return json<CreateActionData>({
      didUpdate: false,
      updateMessage: 'Product not found or update failed',
    });
  }

  return json<CreateActionData>({
    didUpdate: true,
    updateMessage: 'Product was updated',
  });
};

export const createAction = async (values: any) => {
  const validationErrors = validate(values);

  if (Object.values(validationErrors).some((errorMessage) => errorMessage)) {
    console.error('Errors in form', validationErrors);
    return json<CreateActionData>({
      validationErrors: {
        ...validationErrors,
      },
    });
  }

  const data: Partial<ProductEntity> = {
    status: ProductStatus.DRAFT,
    category: 'coffee',

    productCode: values.productCode as string | null,
    country: values.country as string | null,
    name: values.name as string,
    stockStatus: values.stockStatus as ProductStockStatus,
    stockInitial: +values.stockInitial,
    stockRemaining: +values.stockInitial,
    infoLink: values.infoLink as string | null,
    internalNote: values.internalNote as string | null,
  };

  await createProduct(data);
  return redirect(`/products`);
};

export const renderStockStatus = (
  status: ProductStockStatus = ProductStockStatus.ON_BACKORDER,
  isDisabled = false
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`product-stock-status`}>Stock status</InputLabel>
      <Select
        disabled={isDisabled}
        labelId={`product-stock-status`}
        name={`stockStatus`}
        defaultValue={status}
        sx={{ minWidth: 250 }}
        size="small"
      >
        <MenuItem value={ProductStockStatus.ON_BACKORDER}>
          On backorder
        </MenuItem>
        <MenuItem value={ProductStockStatus.IN_STOCK}>
          In stock (Product is in roastery)
        </MenuItem>
        <MenuItem value={ProductStockStatus.OUT_OF_STOCK}>
          {' '}
          Out of stock
        </MenuItem>
      </Select>
    </FormControl>
  );
};
