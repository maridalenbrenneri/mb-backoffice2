import { json } from '@remix-run/node';

import { nullIfEmptyOrWhitespace } from '~/utils/strings';
import { ProductStockStatus } from '~/services/entities/enums';
import {
  updateProduct,
  woo_productSetStockStatus,
} from '~/services/product.service';

const updateStockStatus = async (values: any) => {
  let stockStatus = nullIfEmptyOrWhitespace(values.stockStatus);

  if (!stockStatus) {
    return json({
      didUpdate: false,
      updateMessage: 'Invalid product stock status cannot update',
    });
  }

  await woo_productSetStockStatus(
    +values.id,
    stockStatus as ProductStockStatus
  );

  let stockRemaining =
    stockStatus === ProductStockStatus.OUT_OF_STOCK ? 0 : undefined;

  await updateProduct(+values.id, {
    stockStatus: stockStatus as ProductStockStatus,
    stockRemaining,
  });

  return json({
    didUpdate: true,
    updateMessage: 'Product stock status was updated',
  });
};

const updateStockRemaining = async (values: any) => {
  await updateProduct(+values.id, {
    stockRemaining: values.stockRemaining,
  });

  return json({
    didUpdate: true,
    updateMessage: 'Product stock remaining was updated',
  });
};

const updateLabelsPrinted = async (values: any) => {
  await updateProduct(+values.id, {
    labelsPrinted: values.labelsPrinted,
  });

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
    console.log('set-product-stock-remaining', values);
    return await updateStockRemaining(values);
  } else if (_action === 'set-product-labels-printed') {
    return await updateLabelsPrinted(values);
  }

  return null;
};
