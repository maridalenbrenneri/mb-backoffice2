import { Typography } from '@mui/material';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  Form,
  Link,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { ProductEntity } from '~/services/entities';
import { getProduct } from '~/services/product.service';
import { updateAction, CreateActionData, renderStockStatus } from './_shared';
import Box from '@mui/material/Box';
import {
  Button,
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';

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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  return await updateAction(values);
};

export default function UpdateProduct() {
  const data = useActionData<CreateActionData>();
  const navigation = useNavigation();
  const { loadedProduct } = useLoaderData() as unknown as LoaderData;
  const [openSnack, setOpenSnack] = useState<boolean>(false);

  const isUpdating = Boolean(navigation.state === 'submitting');

  useEffect(() => {
    setOpenSnack(data?.didUpdate === true);
  }, [data]);

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Snackbar
        open={openSnack}
        autoHideDuration={3000}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">{data?.updateMessage || 'Updated'}</Alert>
      </Snackbar>

      <Typography variant="h2">Product: {loadedProduct.name}</Typography>
      <Form method="post">
        <input type="hidden" name="id" value={loadedProduct.id} />

        <div>
          <FormControl>
            <TextField
              name="country"
              label="Country"
              variant="outlined"
              size="small"
              defaultValue={loadedProduct.country || ''}
              error={data?.validationErrors?.country ? true : false}
              helperText={data?.validationErrors?.country}
            />
          </FormControl>

          <FormControl>
            <TextField
              name="name"
              label="Name"
              variant="outlined"
              size="small"
              defaultValue={loadedProduct.name}
              error={data?.validationErrors?.name ? true : false}
              helperText={data?.validationErrors?.name}
            />
          </FormControl>

          <FormControl>
            <TextField
              name="productCode"
              label="Product code"
              variant="outlined"
              size="small"
              defaultValue={loadedProduct.productCode || ''}
              error={data?.validationErrors?.productCode ? true : false}
              helperText={data?.validationErrors?.productCode}
            />
          </FormControl>
        </div>

        <div>
          {renderStockStatus(loadedProduct.stockStatus, true)}

          <FormControl>
            <TextField
              name="stockInitial"
              label="Stock initial (kg)"
              variant="outlined"
              defaultValue={loadedProduct.stockInitial || 0}
              error={data?.validationErrors?.stockInitial ? true : false}
              helperText={data?.validationErrors?.stockInitial}
              size="small"
            />
          </FormControl>

          <FormControl>
            <TextField
              name="stockRemaining"
              label="Stock remaining (kg)"
              variant="outlined"
              defaultValue={loadedProduct.stockRemaining || 0}
              size="small"
            />
          </FormControl>
        </div>

        <div>
          <FormControl>
            <TextField
              name="infoLink"
              label="Info link"
              variant="outlined"
              size="small"
              defaultValue={loadedProduct.infoLink || ''}
              sx={{ width: '190%' }}
            />
          </FormControl>
        </div>

        <div>
          <FormControlLabel
            control={
              <Checkbox
                name="labelsPrinted"
                defaultChecked={loadedProduct.labelsPrinted}
              />
            }
            label="Labels printed"
            sx={{ marginLeft: 1 }}
          />
        </div>

        <div>
          <FormControl>
            <TextField
              name="internalNote"
              label="Note (internal)"
              variant="outlined"
              size="small"
              multiline
              rows={2}
              defaultValue={loadedProduct.internalNote || ''}
              sx={{ width: '190%' }}
            />
          </FormControl>
        </div>

        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isUpdating} variant="contained">
              {isUpdating ? 'Updating...' : 'Update Product'}
            </Button>
          </FormControl>
        </div>
      </Form>
      <hr></hr>
      <Link to="/products">Back to Products</Link>
    </Box>
  );
}
