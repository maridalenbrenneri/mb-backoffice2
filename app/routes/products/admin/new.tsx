import { Form, useActionData, useNavigation } from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, FormControl, TextField } from '@mui/material';

import { createAction, CreateActionData, renderStockStatus } from './_shared';
import { ActionFunction } from '@remix-run/node';

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
          <FormControl>
            <TextField
              name="country"
              label="Country"
              variant="outlined"
              size="small"
              defaultValue={''}
              error={data?.validationErrors?.country ? true : false}
            />
          </FormControl>

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
            />
          </FormControl>
        </div>
        <div>
          {renderStockStatus()}

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
        </div>
      </Form>
    </Box>
  );
}
