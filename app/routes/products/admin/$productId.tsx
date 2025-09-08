import {
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useRevalidator,
  Form,
  Link,
} from '@remix-run/react';
import { useEffect, useState, useRef } from 'react';
import invariant from 'tiny-invariant';
import { ProductEntity, ProductStatus } from '~/services/entities';
import { getProductById } from '~/services/product.service';
import {
  updateAction,
  CreateActionData,
  renderStockStatus,
  renderCountries,
} from './_shared';
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
import { toPrettyDateTime } from '~/utils/dates';
import Seperator from '~/components/Seperator';
import DataLabel from '~/components/DataLabel';

type LoaderData = {
  loadedProduct: ProductEntity;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.productId, `params.id is required`);

  try {
    let loadedProduct = await getProductById(+params.productId);

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
  const revalidator = useRevalidator();
  const { loadedProduct } = useLoaderData() as unknown as LoaderData;
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Add state for form values to track changes
  const [formValues, setFormValues] = useState({
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
    processType: loadedProduct.processType || 'washed',
    cuppingScore: String(loadedProduct.cuppingScore || 0),
    regularPrice:
      loadedProduct.regularPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
    description: loadedProduct.description || '',
  });

  const isUpdating = Boolean(navigation.state === 'submitting');

  // Create initial form values object
  const [initialFormValues, setInitialFormValues] = useState({
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
    processType: loadedProduct.processType || 'washed',
    cuppingScore: String(loadedProduct.cuppingScore || 0),
    regularPrice:
      loadedProduct.regularPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
    description: loadedProduct.description || '',
  });

  // Check for form changes
  const checkFormChanges = () => {
    const hasFormChanges = Object.keys(initialFormValues).some(
      (key) =>
        initialFormValues[key as keyof typeof initialFormValues] !==
        formValues[key as keyof typeof formValues]
    );

    setHasChanges(hasFormChanges);
  };

  // Update form values and check for changes
  const handleFormChange = (field: keyof typeof formValues, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCuppingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleFormChange('cuppingScore', value);
    }
  };

  // Check for changes whenever formValues changes
  useEffect(() => {
    checkFormChanges();
  }, [formValues]);

  useEffect(() => {
    if (data?.didUpdate === true) {
      setOpenSnack(true);
      setOpenErrorSnack(false);
      // Reset changes after successful update
      setHasChanges(false);
      // Update initial values to current form values
      setInitialFormValues(formValues);
      // Revalidate the loader data to fetch fresh data from the database
      revalidator.revalidate();
    } else if (data?.didUpdate === false) {
      setOpenErrorSnack(true);
      setOpenSnack(false);
    }
  }, [data, formValues, revalidator]);

  // Update form values when loadedProduct changes (after revalidation)
  useEffect(() => {
    const updatedFormValues = {
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
      processType: loadedProduct.processType || 'washed',
      cuppingScore: String(loadedProduct.cuppingScore || 0),
      regularPrice:
        loadedProduct.regularPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
      description: loadedProduct.description || '',
    };

    setFormValues(updatedFormValues);
    setInitialFormValues(updatedFormValues);
  }, [loadedProduct]);

  const dataFieldsLeft: any[] = [
    {
      label: 'Woo id',
      data: loadedProduct.wooProductId,
      dataLinkUrl: loadedProduct.wooProductUrl || '',
    },
    {
      label: 'Webshop status',
      data: loadedProduct.status,
    },
  ];

  const dataFieldsRight: any[] = [
    {
      label: 'Updated',
      data: toPrettyDateTime(loadedProduct.updatedAt),
    },
    {
      label: 'Created',
      data: toPrettyDateTime(loadedProduct.createdAt),
    },
  ];

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

      <Typography variant="h2">{loadedProduct.name}</Typography>

      <div>
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid item md={4}>
            <Box sx={{ m: 0 }}>
              <DataLabel dataFields={dataFieldsLeft as any} />
            </Box>
          </Grid>
          <Grid item md={4}>
            <Box sx={{ m: 0 }}>
              <DataLabel dataFields={dataFieldsRight as any} />
            </Box>
          </Grid>
        </Grid>
      </div>

      <Paper sx={{ p: 1 }}>
        <Form method="post" ref={formRef}>
          <input type="hidden" name="id" value={loadedProduct.id} />
          <input
            type="hidden"
            name="wooProductId"
            value={loadedProduct.wooProductId || ''}
          />
          <input
            type="hidden"
            name="stockStatus"
            value={formValues.stockStatus}
          />

          <div>
            {renderCountries(formValues.country, (value) =>
              handleFormChange('country', value)
            )}

            <FormControl>
              <TextField
                name="name"
                label="Name*"
                variant="outlined"
                size="small"
                value={formValues.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                error={data?.validationErrors?.name ? true : false}
                helperText={data?.validationErrors?.name}
                sx={{ width: '195%' }}
              />
            </FormControl>
          </div>

          <div>
            <FormControl>
              <TextField
                name="beanType"
                label="Bean type*"
                variant="outlined"
                size="small"
                value={formValues.beanType}
                onChange={(e) => handleFormChange('beanType', e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ m: 1 }}>
              <InputLabel id={`product-process-type`}>Process*</InputLabel>
              <Select
                labelId={`product-process-type`}
                name={`processType`}
                value={formValues.processType}
                onChange={(e) =>
                  handleFormChange('processType', e.target.value)
                }
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
                label="Cupping score*"
                variant="outlined"
                size="small"
                value={formValues.cuppingScore}
                onChange={handleCuppingScoreChange}
              />
            </FormControl>
          </div>

          <div>
            {renderStockStatus(formValues.stockStatus, false, (value) =>
              handleFormChange('stockStatus', value)
            )}

            <FormControl>
              <TextField
                name="regularPrice"
                label="Price, webshop*"
                variant="outlined"
                size="small"
                value={formValues.regularPrice}
                onChange={(e) =>
                  handleFormChange('regularPrice', e.target.value)
                }
              />
            </FormControl>
          </div>

          <div>
            <FormControl>
              <TextField
                name="description"
                label="Description*"
                variant="outlined"
                size="small"
                multiline
                rows={4}
                value={formValues.description}
                onChange={(e) =>
                  handleFormChange('description', e.target.value)
                }
                sx={{ width: '195%' }}
              />
            </FormControl>
          </div>

          <div style={{ marginTop: '20px' }}>
            <FormControl>
              <TextField
                name="productCode"
                label="Coffee code"
                variant="outlined"
                size="small"
                value={formValues.productCode}
                onChange={(e) =>
                  handleFormChange('productCode', e.target.value)
                }
                error={data?.validationErrors?.productCode ? true : false}
                helperText={data?.validationErrors?.productCode}
                sx={{
                  '& .MuiInputBase-input': {
                    textTransform: 'uppercase',
                  },
                }}
              />
            </FormControl>

            <FormControl>
              <TextField
                name="stockInitial"
                label="Stock initial (kg)"
                variant="outlined"
                value={formValues.stockInitial}
                onChange={(e) =>
                  handleFormChange('stockInitial', Number(e.target.value))
                }
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
                value={formValues.stockRemaining}
                onChange={(e) =>
                  handleFormChange('stockRemaining', Number(e.target.value))
                }
                size="small"
              />
            </FormControl>
          </div>

          <div>
            <FormControl>
              <TextField
                name="purchasePrice"
                label="Purchase price"
                variant="outlined"
                disabled={true}
                // value={formValues.purchasePrice}
                // onChange={(e) =>
                //   handleFormChange('purchasePrice', Number(e.target.value))
                // }
                size="small"
              />
            </FormControl>

            <FormControl>
              <TextField
                name="infoLink"
                label="Info link"
                variant="outlined"
                size="small"
                value={formValues.infoLink}
                onChange={(e) => handleFormChange('infoLink', e.target.value)}
                sx={{ width: '195%' }}
              />
            </FormControl>
          </div>

          <div>
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    name="labelsPrinted"
                    checked={formValues.labelsPrinted}
                    onChange={(e) =>
                      handleFormChange('labelsPrinted', e.target.checked)
                    }
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
                value={formValues.internalNote}
                onChange={(e) =>
                  handleFormChange('internalNote', e.target.value)
                }
                sx={{ width: '200%' }}
              />
            </FormControl>
          </div>

          {loadedProduct.status === ProductStatus.DELETED ? (
            <div
              style={{
                fontStyle: 'italic',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              This product is deleted and cannot be updated.
            </div>
          ) : (
            <div>
              <FormControl sx={{ m: 2 }}>
                <Button
                  type="submit"
                  disabled={isUpdating || !hasChanges}
                  variant="contained"
                >
                  {isUpdating ? 'Updating...' : 'Update Product'}
                </Button>
              </FormControl>
            </div>
          )}

          <div>
            <Alert severity="success" icon={false}>
              Changes on fields marked with a * will trigger update in Woo
              webshop.
              <p>
                Country is added to the name in Woo (don't add it to the name
                here)
              </p>
              <p>
                Bean type, process and score are added to the product
                description in Woo.
              </p>
              <p>
                Only <em>visibility (status)</em> and <em>stock status</em> will
                be synced back to Backoffice if product is edited in Woo admin.
              </p>
            </Alert>
          </div>
        </Form>
      </Paper>

      <Seperator />

      <Link style={{ margin: '10px' }} to="/products">
        Back to Products
      </Link>

      <Seperator />

      {/* <Typography variant="h5" sx={{ marginTop: '25px' }}>
        Björn's debug stuff
      </Typography>
      <div>{JSON.stringify(loadedProduct, null, 2)}</div> */}
    </Box>
  );
}
