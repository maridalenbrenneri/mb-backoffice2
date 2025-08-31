import { InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  Form,
  Link,
} from '@remix-run/react';
import { useEffect, useState, useRef } from 'react';
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
import { WOO_PRODUCT_REGULAR_PRICE_DEFAULT } from '~/settings';

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
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isUpdating = Boolean(navigation.state === 'submitting');

  // Create initial form values object
  const initialFormValues = {
    country: loadedProduct.country || '',
    name: loadedProduct.name,
    productCode: loadedProduct.productCode || '',
    stockStatus: loadedProduct.stockStatus,
    stockInitial: loadedProduct.stockInitial || 0,
    stockRemaining: loadedProduct.stockRemaining || 0,
    infoLink: loadedProduct.infoLink || '',
    labelsPrinted: loadedProduct.labelsPrinted,
    internalNote: loadedProduct.internalNote || '',
    beanType: loadedProduct.beanType || '',
    processType: loadedProduct.processType || 'dry-processed',
    cuppingScore: loadedProduct.cuppingScore || 0,
    regularPrice:
      loadedProduct.regularPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
    description: loadedProduct.description || '',
  };

  // Check for form changes
  const checkFormChanges = () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const currentValues = {
      country: formData.get('country') as string,
      name: formData.get('name') as string,
      productCode: formData.get('productCode') as string,
      stockStatus: formData.get('stockStatus') as string,
      stockInitial: Number(formData.get('stockInitial')) || 0,
      stockRemaining: Number(formData.get('stockRemaining')) || 0,
      infoLink: formData.get('infoLink') as string,
      labelsPrinted: formData.has('labelsPrinted'),
      internalNote: formData.get('internalNote') as string,
      beanType: formData.get('beanType') as string,
      processType: formData.get('processType') as string,
      cuppingScore: Number(formData.get('cuppingScore')) || 0,
      regularPrice: formData.get('regularPrice') as string,
      description: formData.get('description') as string,
    };

    const hasFormChanges = Object.keys(initialFormValues).some(
      (key) =>
        initialFormValues[key as keyof typeof initialFormValues] !==
        currentValues[key as keyof typeof currentValues]
    );

    setHasChanges(hasFormChanges);
  };

  // Add event listeners to form inputs
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleInputChange = () => {
      checkFormChanges();
    };

    // Add listeners to all form inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('input', handleInputChange);
      input.addEventListener('change', handleInputChange);
      // Add specific listener for checkboxes
      if ((input as HTMLInputElement).type === 'checkbox') {
        input.addEventListener('click', handleInputChange);
      }
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('input', handleInputChange);
        input.removeEventListener('change', handleInputChange);
        if ((input as HTMLInputElement).type === 'checkbox') {
          input.removeEventListener('click', handleInputChange);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (data?.didUpdate === true) {
      setOpenSnack(true);
      setOpenErrorSnack(false);
      // Reset changes after successful update
      setHasChanges(false);
    } else if (data?.didUpdate === false) {
      setOpenErrorSnack(true);
      setOpenSnack(false);
    }
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

      <Snackbar
        open={openErrorSnack}
        autoHideDuration={6000}
        onClose={() => setOpenErrorSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error">
          {data?.updateMessage || 'An error occurred'}
        </Alert>
      </Snackbar>

      <Typography variant="h2">
        Product: <small>{loadedProduct.name}</small>
      </Typography>
      <Form method="post" ref={formRef}>
        <input type="hidden" name="id" value={loadedProduct.id} />
        <input
          type="hidden"
          name="wooProductId"
          value={loadedProduct.wooProductId || ''}
        />

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
              sx={{
                '& .MuiInputBase-input': {
                  textTransform: 'uppercase',
                },
              }}
            />
          </FormControl>
        </div>

        <div>
          <FormControl>
            <TextField
              name="beanType"
              label="Bean type"
              variant="outlined"
              size="small"
              defaultValue={loadedProduct.beanType || ''}
            />
          </FormControl>

          <FormControl sx={{ m: 1 }}>
            <InputLabel id={`product-process-type`}>Process</InputLabel>
            <Select
              labelId={`product-process-type`}
              name={`processType`}
              defaultValue={loadedProduct.processType || 'dry-processed'}
              sx={{ minWidth: 250 }}
              size="small"
            >
              <MenuItem value={'dry-processed'}>Dry processed</MenuItem>
              <MenuItem value={'washed'}>Washed</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <TextField
              name="cuppingScore"
              label="Cupping score"
              variant="outlined"
              size="small"
              defaultValue={loadedProduct.cuppingScore || 0}
            />
          </FormControl>
        </div>

        <div>
          {renderStockStatus(loadedProduct.stockStatus)}

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
              label="Current stock (kg)"
              variant="outlined"
              defaultValue={loadedProduct.stockRemaining || 0}
              size="small"
            />
          </FormControl>
        </div>

        <div>
          <FormControl>
            <TextField
              name="regularPrice"
              label="Regular price"
              variant="outlined"
              size="small"
              defaultValue={
                loadedProduct.regularPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT
              }
            />
          </FormControl>
        </div>

        <div>
          <FormControl>
            <TextField
              name="description"
              label="Description"
              variant="outlined"
              size="small"
              multiline
              rows={2}
              defaultValue={loadedProduct.description || ''}
              sx={{ width: '190%' }}
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
          <FormControl>
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
          </FormControl>
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
            <Button
              type="submit"
              disabled={isUpdating || !hasChanges}
              variant="contained"
            >
              {isUpdating ? 'Updating...' : 'Update Product'}
            </Button>
          </FormControl>
        </div>
        <div>
          <Alert severity="info">
            <em>Name</em>, <em>description</em> and <em>stock status</em> will
            be updated in Woo webshop when product is updated here.
            <p>
              Only <em>visibility (status)</em> and <em>stock status</em> will
              be synced back to Backoffice if product is edited in Woo admin.
            </p>
          </Alert>
        </div>
      </Form>
      <hr></hr>
      <Link to="/products">Back to Products</Link>
    </Box>
  );
}
