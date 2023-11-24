import { json } from '@remix-run/node';

import * as productRepository from '~/_libs/core/repositories/product';
import { nullIfEmptyOrWhitespace } from '~/_libs/core/utils/strings';

const updateProductCode = async (values: any) => {
  await productRepository.updateProduct(+values.id, {
    productCode: nullIfEmptyOrWhitespace(values.productCode),
  });

  return json({
    didUpdate: true,
    updateMessage: 'Product code was updated',
  });
};

const updateStockStatus = async (values: any) => {
  // TODO: Triggger update of stoack status in Woo

  await productRepository.updateProduct(+values.id, {
    stockStatus: nullIfEmptyOrWhitespace(values.stockStatus),
  });

  return json({
    didUpdate: true,
    updateMessage: 'Product code was updated',
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
