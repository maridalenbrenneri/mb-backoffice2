import { json } from '@remix-run/node';

import { nullIfEmptyOrWhitespace } from '~/utils/strings';
import { ProductStockStatus } from '~/services/entities/enums';
import { updateProduct } from '~/services/product.service';

const updateStockStatus = async (values: any) => {
  let stockStatus = nullIfEmptyOrWhitespace(values.stockStatus);

  if (!stockStatus) {
    return json({
      didUpdate: false,
      updateMessage: 'Invalid product stock status cannot update',
    });
  }

  const result = await updateProduct(+values.id, {
    stockStatus: stockStatus as ProductStockStatus,
  });

  if (result.kind !== 'success') {
    return json({
      didUpdate: false,
      updateMessage: `Failed to update product stock status: ${result.error}`,
    });
  }

  return json({
    didUpdate: true,
    updateMessage: 'Product stock status was updated',
  });
};

const updateStockRemaining = async (values: any) => {
  const result = await updateProduct(+values.id, {
    stockRemaining: values.stockRemaining,
  });

  if (result.kind !== 'success') {
    return json({
      didUpdate: false,
      updateMessage: `Failed to update product current stock: ${result.error}`,
    });
  }

  return json({
    didUpdate: true,
    updateMessage: 'Product current stock was updated',
  });
};

const updateLabelsPrinted = async (values: any) => {
  const result = await updateProduct(+values.id, {
    labelsPrinted: values.labelsPrinted,
  });

  if (result.kind !== 'success') {
    return json({
      didUpdate: false,
      updateMessage: `Failed to update product labels printed: ${result.error}`,
    });
  }

  return json({
    didUpdate: true,
    updateMessage: 'Product labels printed was updated',
  });
};

export const productActionHandler = async (request: any) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'set-product-stock-status') {
    return await updateStockStatus(values);
  } else if (_action === 'set-product-stock-remaining') {
    return await updateStockRemaining(values);
  } else if (_action === 'set-product-labels-printed') {
    return await updateLabelsPrinted(values);
  }

  return null;
};
