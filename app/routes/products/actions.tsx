import { json } from '@remix-run/node';

import type { ProductStockStatus } from '@prisma/client';

import * as productRepository from '~/_libs/core/repositories/product';
import { nullIfEmptyOrWhitespace } from '~/_libs/core/utils/strings';
import * as productService from '~/_libs/core/services/product-service';

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
  let stockStatus = nullIfEmptyOrWhitespace(values.stockStatus);

  if (!stockStatus) {
    return json({
      didUpdate: false,
      updateMessage: 'Invalid product stock status cannot update',
    });
  }

  await productService.productSetStockStatus(
    +values.id,
    stockStatus as ProductStockStatus
  );

  await productRepository.updateProduct(+values.id, {
    stockStatus,
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
