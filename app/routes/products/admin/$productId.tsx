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
  useFetcher,
  useLoaderData,
  useNavigation,
  useRevalidator,
  Form,
  Link,
} from '@remix-run/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import invariant from 'tiny-invariant';
import { ProductEntity, ProductStatus } from '~/services/entities';
import { getProductById } from '~/services/product.service';
import {
  updateAction,
  publishAction,
  unpublishAction,
  uploadImageAction,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { WOO_PRODUCT_REGULAR_PRICE_DEFAULT } from '~/settings';
import { toPrettyDateTime } from '~/utils/dates';
import Seperator from '~/components/Seperator';
import DataLabel from '~/components/DataLabel';
import ExternalLink from '~/components/ExternalLink';
import { getValidationForCoffee } from '~/utils/product-utils';

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
  const _action = formData.get('_action');

  if (_action === 'publish')
    return await publishAction({ id: String(formData.get('id')) });
  if (_action === 'unpublish')
    return await unpublishAction({ id: String(formData.get('id')) });
  if (_action === 'uploadImage')
    return await uploadImageAction(request, formData);

  const values = Object.fromEntries(formData);
  return await updateAction(values);
};

export default function UpdateProduct() {
  const data = useActionData<CreateActionData>();
  const imageFetcher = useFetcher<CreateActionData>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { loadedProduct } = useLoaderData() as unknown as LoaderData;
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImagePreviewRef = useRef<string | null>(null);

  // Add state for form values to track changes
  const [formValues, setFormValues] = useState({
    country: loadedProduct.coffee_country || '',
    name: loadedProduct.name,
    productCode: loadedProduct.productCode || '',
    stockStatus: loadedProduct.stockStatus,
    stockInitial: loadedProduct.stockInitial || 0,
    stockRemaining: loadedProduct.stockRemaining || 0,
    infoLink: loadedProduct.infoLink || '',
    labelsPrinted: loadedProduct.coffee_labelsPrinted,
    internalNote: loadedProduct.internalNote || '',
    beanType: loadedProduct.coffee_beanType || '',
    processType: loadedProduct.coffee_processType || 'washed',
    cuppingScore: String(loadedProduct.coffee_cuppingScore || 0),
    regularPrice:
      loadedProduct.retailPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
    purchasePrice: loadedProduct.purchasePrice || 0,
    description: loadedProduct.description || '',
  });

  const isSubmitting = navigation.state === 'submitting';
  const submitAction = navigation.formData?.get('_action');
  const isUpdating =
    isSubmitting && (!submitAction || submitAction === 'update');
  const isPublishing = isSubmitting && submitAction === 'publish';
  const isUnpublishing = isSubmitting && submitAction === 'unpublish';
  const isUploadingImage = imageFetcher.state !== 'idle';
  const canUploadImage =
    loadedProduct.status !== ProductStatus.DELETED &&
    !!loadedProduct.wooProductId &&
    !hasChanges &&
    !isUploadingImage;

  const showPublishButton =
    loadedProduct.status === ProductStatus.DRAFT ||
    loadedProduct.status === ProductStatus.PRIVATE;
  const showUnpublishButton = loadedProduct.status === ProductStatus.PUBLISHED;

  const productForValidation = useMemo(
    (): ProductEntity => ({
      ...loadedProduct,
      coffee_country: formValues.country || null,
      name: formValues.name,
      coffee_beanType: formValues.beanType || null,
      coffee_processType: formValues.processType || null,
      coffee_cuppingScore: formValues.cuppingScore
        ? +formValues.cuppingScore
        : null,
      description: formValues.description || null,
    }),
    [loadedProduct, formValues]
  );

  const publishValidation = getValidationForCoffee(productForValidation);

  // Create initial form values object
  const [initialFormValues, setInitialFormValues] = useState({
    country: loadedProduct.coffee_country || '',
    name: loadedProduct.name,
    productCode: loadedProduct.productCode || '',
    stockStatus: loadedProduct.stockStatus,
    stockInitial: loadedProduct.stockInitial || 0,
    stockRemaining: loadedProduct.stockRemaining || 0,
    infoLink: loadedProduct.infoLink || '',
    labelsPrinted: loadedProduct.coffee_labelsPrinted,
    internalNote: loadedProduct.internalNote || '',
    beanType: loadedProduct.coffee_beanType || '',
    processType: loadedProduct.coffee_processType || 'washed',
    cuppingScore: String(loadedProduct.coffee_cuppingScore || 0),
    regularPrice:
      loadedProduct.retailPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
    purchasePrice: loadedProduct.purchasePrice || 0,
    description: loadedProduct.description || '',
  });

  // Check for form changes
  const checkFormChanges = () => {
    const hasFormChanges = Object.keys(initialFormValues).some((key) => {
      const initialValue =
        initialFormValues[key as keyof typeof initialFormValues];
      const currentValue = formValues[key as keyof typeof formValues];

      // Special handling for numeric values to ensure proper comparison
      if (
        key === 'purchasePrice' ||
        key === 'stockInitial' ||
        key === 'stockRemaining'
      ) {
        return Number(initialValue) !== Number(currentValue);
      }

      return initialValue !== currentValue;
    });

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

  const handlePurchasePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;

    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    // Only allow up to two decimal places
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > 2) {
        return;
      }
    }

    handleFormChange('purchasePrice', value);
  };

  // Check for changes whenever formValues changes
  useEffect(() => {
    checkFormChanges();
  }, [formValues]);

  useEffect(() => {
    if (data?.didUpdate === true) {
      setSnackMessage(data.updateMessage || 'Updated');
      setOpenSnack(true);
      setOpenErrorSnack(false);
      setPublishDialogOpen(false);
      setUnpublishDialogOpen(false);
      // Reset changes after successful update
      setHasChanges(false);
      // Update initial values to current form values
      setInitialFormValues(formValues);
      // Revalidate the loader data to fetch fresh data from the database
      revalidator.revalidate();
    } else if (data?.didUpdate === false) {
      setSnackMessage(data.updateMessage || 'An error occurred');
      setOpenErrorSnack(true);
      setOpenSnack(false);
      setPublishDialogOpen(false);
      setUnpublishDialogOpen(false);
    }
  }, [data, formValues, revalidator]);

  const clearSelectedImagePreview = () => {
    if (selectedImagePreviewRef.current) {
      URL.revokeObjectURL(selectedImagePreviewRef.current);
      selectedImagePreviewRef.current = null;
    }
    setSelectedImagePreview(null);
    setSelectedImageName(null);
  };

  const closeUploadDialog = () => {
    if (isUploadingImage) return;
    setUploadDialogOpen(false);
    clearSelectedImagePreview();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (imageFetcher.data?.didUpdate === true) {
      setSnackMessage(imageFetcher.data.updateMessage || 'Updated');
      setOpenSnack(true);
      setOpenErrorSnack(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      clearSelectedImagePreview();
      setUploadDialogOpen(false);
    } else if (imageFetcher.data?.didUpdate === false) {
      setSnackMessage(imageFetcher.data.updateMessage || 'An error occurred');
      setOpenErrorSnack(true);
      setOpenSnack(false);
    }
  }, [imageFetcher.data]);

  const handleSelectedImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    clearSelectedImagePreview();
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    selectedImagePreviewRef.current = previewUrl;
    setSelectedImagePreview(previewUrl);
    setSelectedImageName(file.name);
  };

  const handleUploadImage = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setSnackMessage('Select an image to upload');
      setOpenErrorSnack(true);
      return;
    }

    const formData = new FormData();
    formData.append('_action', 'uploadImage');
    formData.append('id', String(loadedProduct.id));
    formData.append('image', file);
    imageFetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });
  };

  // Update form values when loadedProduct changes (after revalidation)
  useEffect(() => {
    const updatedFormValues = {
      country: loadedProduct.coffee_country || '',
      name: loadedProduct.name,
      productCode: loadedProduct.productCode || '',
      stockStatus: loadedProduct.stockStatus,
      stockInitial: loadedProduct.stockInitial || 0,
      stockRemaining: loadedProduct.stockRemaining || 0,
      infoLink: loadedProduct.infoLink || '',
      labelsPrinted: loadedProduct.coffee_labelsPrinted,
      internalNote: loadedProduct.internalNote || '',
      beanType: loadedProduct.coffee_beanType || '',
      processType: loadedProduct.coffee_processType || 'washed',
      cuppingScore: String(loadedProduct.coffee_cuppingScore || 0),
      regularPrice:
        loadedProduct.retailPrice || WOO_PRODUCT_REGULAR_PRICE_DEFAULT,
      purchasePrice: loadedProduct.purchasePrice || 0,
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
        <Alert severity="success">{snackMessage || 'Updated'}</Alert>
      </Snackbar>

      <Snackbar
        open={openErrorSnack}
        autoHideDuration={6000}
        onClose={() => setOpenErrorSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error">{snackMessage || 'An error occurred'}</Alert>
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

      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
      >
        <DialogTitle>Publish coffee in webshop</DialogTitle>
        <DialogContent>
          <Alert
            severity={
              publishValidation.kind === 'success'
                ? 'success'
                : publishValidation.kind === 'warning'
                ? 'warning'
                : 'error'
            }
          >
            {publishValidation.message.trim()}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Form method="post">
            <input type="hidden" name="id" value={loadedProduct.id} />
            <Button
              type="submit"
              variant="contained"
              disabled={
                isPublishing || hasChanges || publishValidation.kind === 'error'
              }
              name="_action"
              value="publish"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </Form>
        </DialogActions>
      </Dialog>

      <Dialog
        open={unpublishDialogOpen}
        onClose={() => setUnpublishDialogOpen(false)}
      >
        <DialogTitle>Unpublish coffee from webshop</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unpublish?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUnpublishDialogOpen(false)}>Cancel</Button>
          <Form method="post">
            <input type="hidden" name="id" value={loadedProduct.id} />
            <Button
              type="submit"
              variant="contained"
              disabled={isUnpublishing}
              name="_action"
              value="unpublish"
            >
              {isUnpublishing ? 'Unpublishing...' : 'OK'}
            </Button>
          </Form>
        </DialogActions>
      </Dialog>

      <Dialog
        open={uploadDialogOpen}
        onClose={closeUploadDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add image</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            ref={fileInputRef}
            disabled={!canUploadImage}
            onChange={handleSelectedImageChange}
            style={{ display: 'none' }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              disabled={!canUploadImage}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse
            </Button>
            <span>{selectedImageName || 'No file selected'}</span>
          </div>
          {selectedImagePreview && (
            <div style={{ marginTop: 16 }}>
              <img
                src={selectedImagePreview}
                alt="Selected image preview"
                width={120}
                style={{
                  objectFit: 'cover',
                  height: 120,
                  border: '1px solid #ccc',
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeUploadDialog} disabled={isUploadingImage}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            disabled={!canUploadImage || !selectedImagePreview}
            onClick={handleUploadImage}
          >
            {isUploadingImage ? 'Uploading...' : 'Upload image'}
          </Button>
        </DialogActions>
      </Dialog>

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
                <MenuItem value={'fermented'}>Fermented</MenuItem>
                <MenuItem value={'honey'}>Honey</MenuItem>
                <MenuItem value={'natural'}>Natural</MenuItem>
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

          <div>
            <div style={{ marginLeft: 16, marginTop: 8 }}>
              <p>Product has {loadedProduct.images.length} images</p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                {loadedProduct.images.map((image) => (
                  <div key={image.wooMediaId}>
                    <img src={image.src} width={75} />
                  </div>
                ))}
              </div>
              {loadedProduct.status !== ProductStatus.DELETED && (
                <div>
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={!canUploadImage}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Add image
                  </Button>
                  {hasChanges && (
                    <div>
                      <small>
                        Save product changes before uploading an image.
                      </small>
                    </div>
                  )}
                  {!loadedProduct.wooProductId && (
                    <div>
                      <small>
                        Product must exist in Woo before an image can be
                        uploaded.
                      </small>
                    </div>
                  )}
                </div>
              )}
              <p>
                <small>
                  Removing images must be done in{' '}
                  <ExternalLink
                    href={`${loadedProduct.wooProductUrl}`}
                    text="Woo Admin"
                  />
                  <br />
                  <strong>Note:</strong> It may take some time before changes
                  done in Woo are visible here.
                </small>
              </p>
            </div>
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
                label="Purchase price, kg (USD)"
                variant="outlined"
                value={formValues.purchasePrice}
                onChange={handlePurchasePriceChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <span style={{ marginRight: 8, color: '#666' }}>$</span>
                  ),
                }}
                placeholder="0.00"
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]{0,2}',
                }}
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
                  name="_action"
                  value="update"
                  disabled={isUpdating || isUploadingImage || !hasChanges}
                  variant="contained"
                >
                  {isUpdating ? 'Updating...' : 'Update Product'}
                </Button>
              </FormControl>
              {showPublishButton && (
                <FormControl sx={{ m: 2 }}>
                  <Button
                    type="button"
                    variant="contained"
                    disabled={hasChanges}
                    onClick={() => setPublishDialogOpen(true)}
                  >
                    Publish in webshop
                  </Button>
                </FormControl>
              )}
              {showUnpublishButton && (
                <FormControl sx={{ m: 2 }}>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => setUnpublishDialogOpen(true)}
                  >
                    Unpublish from webshop
                  </Button>
                </FormControl>
              )}
            </div>
          )}

          <div>
            <Alert severity="success" icon={false} sx={{ fontSize: '85%' }}>
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
                Only <em>visibility (status)</em>, <em>stock status</em> and{' '}
                <em>images</em> will be synced back to Backoffice if product is
                edited in Woo admin.
              </p>
            </Alert>
          </div>
        </Form>
      </Paper>

      <Seperator />

      <Link style={{ margin: '10px' }} to="/products">
        Back to Coffee List
      </Link>

      <Seperator />

      {/* <Typography variant="h5" sx={{ marginTop: '25px' }}>
        Björn's debug stuff
      </Typography>
      <div>{JSON.stringify(loadedProduct, null, 2)}</div> */}
    </Box>
  );
}
