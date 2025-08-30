import { Typography } from '@mui/material';
import { json, LoaderFunction } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { ProductEntity } from '~/services/entities';
import { getProduct } from '~/services/product.service';

type LoaderData = {
  loadedProduct: ProductEntity;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.productId, `params.id is required`);

  try {
    let loadedProduct = await getProduct({
      where: { id: +params.productId },
    });

    if (!loadedProduct) {
      throw new Error(`Product not found: ${params.productId}`);
    }

    return json({ loadedProduct });
  } catch (error) {
    console.error('Error loading product:', error);
    throw new Error(
      `There was an error loading product by the id ${params.productId}. Sorry.`
    );
  }
};

export default function UpdateProduct() {
  const data = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { loadedProduct } = useLoaderData() as unknown as LoaderData;

  const [product, setProduct] = useState<ProductEntity>();

  useEffect(() => {
    setProduct(loadedProduct);
  }, [loadedProduct]);

  if (!product) return null;

  return (
    <main>
      <Typography variant="h1">Product Details</Typography>

      <div>{JSON.stringify(product, null, 2)}</div>
    </main>
  );
}
