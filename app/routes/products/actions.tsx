import { json } from '@remix-run/node';

import { nullIfEmptyOrWhitespace } from '~/utils/strings';
import { ProductStockStatus } from '~/services/entities/enums';
import {
  updateProduct,
  woo_productSetStockStatus,
} from '~/services/product.service';

const updateProductCode = async (values: any) => {
  await updateProduct(+values.id, {
    productCode: nullIfEmptyOrWhitespace(values.productCode),
  });

  return json({
    didUpdate: true,
    updateMessage: 'Product code was updated',
  });
};

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

  await updateProduct(+values.id, {
    stockStatus: stockStatus as ProductStockStatus,
  });

  return json({
    didUpdate: true,
    updateMessage: 'Product stock status was updated',
  });
};

export const productActionHandler = async (request: any) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === 'set-product-code') {
    await updateProductCode(values);
    return {
      didUpdate: true,
      updateMessage: 'Product code was updated',
    };
  } else if (_action === 'set-product-stock-status') {
    await updateStockStatus(values);
    return {
      didUpdate: true,
      updateMessage: 'Product stock status was updated',
    };
  }

  return null;
};
