import { Form, useActionData, useNavigation, Link } from '@remix-run/react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import {
  createAction,
  CreateActionData,
  renderCountries,
  renderStockStatus,
} from './_shared';
import { ProductStockStatus } from '~/services/entities';
import { ActionFunction } from '@remix-run/node';
import { WOO_PRODUCT_REGULAR_PRICE_DEFAULT } from '~/settings';

export const action: ActionFunction = async ({ request }) => {
  console.log('AM I HERE IN NEW');

  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  return await createAction(values);
};

export default function NewProduct() {
  const data = useActionData<CreateActionData>();
  const navigation = useNavigation();

  const isCreating = Boolean(navigation.state === 'submitting');

  // Form state management
  const [formValues, setFormValues] = useState({
    country: 'Colombia',
    stockStatus: ProductStockStatus.ON_BACKORDER,
    cuppingScore: '0',
    processType: 'washed',
  });

  const handleFormChange = (field: string, value: string | number) => {
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

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Create New Product</Typography>
      <Form method="post">
        <div>
          {renderCountries(formValues.country, (value) =>
            handleFormChange('country', value)
          )}

          <FormControl>
            <TextField
              name="name"
              label="Name"
              variant="outlined"
              size="small"
              defaultValue={''}
              error={data?.validationErrors?.name ? true : false}
            />
          </FormControl>

          <FormControl>
            <TextField
              name="productCode"
              label="Product code"
              variant="outlined"
              size="small"
              defaultValue={''}
              error={data?.validationErrors?.productCode ? true : false}
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
              defaultValue={''}
            />
          </FormControl>

          <FormControl sx={{ m: 1 }}>
            <InputLabel id={`product-process-type`}>Process</InputLabel>
            <Select
              labelId={`product-process-type`}
              name={`processType`}
              value={formValues.processType}
              onChange={(e) => handleFormChange('processType', e.target.value)}
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
              name="stockInitial"
              label="Stock initial (kg)"
              variant="outlined"
              defaultValue={0}
              error={data?.validationErrors?.stockInitial ? true : false}
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
              defaultValue={WOO_PRODUCT_REGULAR_PRICE_DEFAULT}
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
              rows={4}
              defaultValue={''}
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
              defaultValue={''}
              sx={{ width: '190%' }}
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
              sx={{ width: '190%' }}
            />
          </FormControl>
        </div>

        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isCreating} variant="contained">
              {isCreating ? 'Creating...' : 'Create Product'}
            </Button>
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <Link to="/products">
              <Button variant="outlined">Cancel</Button>
            </Link>
          </FormControl>
        </div>

        <div>
          <Alert severity="info">
            The product will be created with draft status in Woo.
            <p>
              Country is added to the name in Woo (don't add it to the name
              here)
            </p>
            <p>
              Bean type, process and score are added to the product description
              in Woo.
            </p>
          </Alert>
        </div>
      </Form>
    </Box>
  );
}
