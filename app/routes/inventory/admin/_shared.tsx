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
    stockStatus: values.stockStatus as ProductStockStatus,
    stockInitial: +values.stockInitial,
    stockRemaining: +values.stockRemaining,
    internalNote: values.internalNote as string | null,
    retailPrice: values.regularPrice as string | null,
    purchasePrice: +values.purchasePrice as number | null,
    description: values.description as string | null,
  };

  const result = await updateProduct(+values.id, data);

  if (result.kind !== 'success') {
    console.error('Failed to update inventory', result.error);
    return json<CreateActionData>({
      didUpdate: false,
      updateMessage: 'Failed to update inventory',
    });
  }

  return json<CreateActionData>({
    didUpdate: true,
    updateMessage: 'Inventory was updated',
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
    status: ProductStatus.PUBLISHED,
    category: 'inventory',

    name: values.name as string,
    stockStatus: values.stockStatus as ProductStockStatus,
    stockInitial: +values.stockInitial,
    stockRemaining: +values.stockInitial,
    infoLink: values.infoLink as string | null,
    internalNote: values.internalNote as string | null,
    retailPrice: values.regularPrice as string | null,
    description: values.description as string | null,
  };

  let result = await createProduct(data);

  if (result.kind !== 'success') {
    return json<CreateActionData>({
      didUpdate: false,
      updateMessage: 'Failed to create inventory',
    });
  }
  return redirect(`/inventory`);
};

export const renderStockStatus = (
  status: ProductStockStatus = ProductStockStatus.ON_BACKORDER,
  isDisabled = false,
  onChange?: (value: ProductStockStatus) => void
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`inventory-stock-status`}>Stock status*</InputLabel>
      <Select
        disabled={isDisabled}
        labelId={`inventory-stock-status`}
        name={`stockStatus`}
        value={status}
        onChange={(e) => onChange?.(e.target.value as ProductStockStatus)}
        sx={{ minWidth: 250 }}
        size="small"
      >
        <MenuItem value={ProductStockStatus.ON_BACKORDER}>
          On backorder
        </MenuItem>
        <MenuItem value={ProductStockStatus.IN_STOCK}>In stock</MenuItem>
        <MenuItem value={ProductStockStatus.OUT_OF_STOCK}>
          {' '}
          Out of stock
        </MenuItem>
      </Select>
    </FormControl>
  );
};
