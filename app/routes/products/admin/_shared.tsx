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
    stockStatus: values.stockStatus as ProductStockStatus,
    stockInitial: +values.stockInitial,
    stockRemaining: +values.stockRemaining,
    infoLink: values.infoLink as string | null,
    internalNote: values.internalNote as string | null,
    labelsPrinted: values.labelsPrinted === 'on',
    beanType: values.beanType as string | null,
    processType: values.processType as string | null,
    cuppingScore: +values.cuppingScore,
    regularPrice: values.regularPrice as string | null,
    description: values.description as string | null,
    wooProductId: +values.wooProductId,
  };

  const result = await updateProduct(+values.id, data);

  if (result.kind !== 'success') {
    console.error('Failed to update product', result.error);
    return json<CreateActionData>({
      didUpdate: false,
      updateMessage: 'Failed to update product',
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
    beanType: values.beanType as string | null,
    processType: values.processType as string | null,
    cuppingScore: +values.cuppingScore,
    regularPrice: values.regularPrice as string | null,
    description: values.description as string | null,
  };

  let result = await createProduct(data);

  if (result.kind !== 'success') {
    return json<CreateActionData>({
      didUpdate: false,
      updateMessage: 'Failed to create product',
    });
  }
  return redirect(`/products`);
};

export const renderStockStatus = (
  status: ProductStockStatus = ProductStockStatus.ON_BACKORDER,
  isDisabled = false,
  onChange?: (value: ProductStockStatus) => void
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`product-stock-status`}>Stock status*</InputLabel>
      <Select
        disabled={isDisabled}
        labelId={`product-stock-status`}
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

export const renderCountries = (
  country: string = 'Colombia',
  onChange?: (value: string) => void
) => {
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id={`product-country`}>Country*</InputLabel>
      <Select
        labelId={`product-country`}
        name={`country`}
        value={country}
        onChange={(e) => onChange?.(e.target.value as string)}
        // displayEmpty
        sx={{ minWidth: 250 }}
        size="small"
      >
        <MenuItem value={'Colombia'}>Colombia</MenuItem>
        <MenuItem value={'Costa Rica'}>Costa Rica</MenuItem>
        <MenuItem value={'Ecuador'}>Ecuador</MenuItem>
        <MenuItem value={'El Salvador'}>El Salvador</MenuItem>
        <MenuItem value={'Etiopia'}>Etiopia</MenuItem>
        <MenuItem value={'Guatemala'}>Guatemala</MenuItem>
        <MenuItem value={'Honduras'}>Honduras</MenuItem>
        <MenuItem value={'Indonesia'}>Indonesia</MenuItem>
        <MenuItem value={'Kenya'}>Kenya</MenuItem>
        <MenuItem value={'Nicaragua'}>Nicaragua</MenuItem>
        <MenuItem value={'Peru'}>Peru</MenuItem>
        <MenuItem value={'Rwanda'}>Rwanda</MenuItem>
        <MenuItem value={'Tanzania'}>Tanzania</MenuItem>
        <MenuItem value={'Uganda'}>Uganda</MenuItem>
        <MenuItem value={'Venezuela'}>Venezuela</MenuItem>
      </Select>
    </FormControl>
  );
};
