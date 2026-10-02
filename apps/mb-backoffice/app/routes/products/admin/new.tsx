import { Form, useActionData, useNavigation, Link } from '@remix-run/react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Alert, Button, FormControl, TextField } from '@mui/material';

import {
  createAction,
  CreateActionData,
  renderCountries,
  renderStockStatus,
} from './_shared';
import { ProductStockStatus } from '~/services/entities';
import { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
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
  });

  const handleFormChange = (field: string, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Add new coffee</Typography>
      <Form method="post">
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
              defaultValue={''}
              error={data?.validationErrors?.name ? true : false}
            />
          </FormControl>
        </div>

        <div>
          {renderStockStatus(formValues.stockStatus, false, (value) =>
            handleFormChange('stockStatus', value)
          )}

          <FormControl>
            <TextField
              name="productCode"
              label="Product code"
              variant="outlined"
              size="small"
              defaultValue={''}
              sx={{
                '& .MuiInputBase-input': {
                  textTransform: 'uppercase',
                },
              }}
            />
          </FormControl>
        </div>

        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isCreating} variant="contained">
              {isCreating ? 'Creating...' : 'Create coffee product'}
            </Button>
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <Link to="/products">
              <Button variant="outlined">Cancel</Button>
            </Link>
          </FormControl>
        </div>

        <div>
          <Alert
            severity="success"
            icon={false}
            sx={{ fontSize: '85%', marginTop: 2 }}
          >
            The coffee product will be created with draft status in Woo webshop.
            <p>
              When created the product can be updated with all data on the edit
              page
            </p>
          </Alert>
        </div>
      </Form>
    </Box>
  );
}
