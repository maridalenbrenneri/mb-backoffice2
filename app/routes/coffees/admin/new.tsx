import type { ActionFunction } from '@remix-run/node';
import { Form, useActionData, useTransition } from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { upsertAction } from './_shared';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { CoffeeStatus } from '@prisma/client';

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function NewCoffee() {
  const errors = useActionData();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Create New Coffee</Typography>
      <Form method="post">
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`status-label`}>Type</InputLabel>
          <Select
            labelId={`status-label`}
            name="status"
            defaultValue={CoffeeStatus.ACTIVE}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value={CoffeeStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={CoffeeStatus.IN_STOCK}>In stock</MenuItem>
            <MenuItem value={CoffeeStatus.ORDERED}>Ordered</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <TextField
            name="name"
            label="Name"
            variant="outlined"
            error={errors?.name}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="productCode"
            label="Code"
            variant="outlined"
            error={errors?.productCode}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="country"
            label="Country"
            variant="outlined"
            error={errors?.country}
          />
        </FormControl>

        <div>
          <FormControl sx={{ m: 1 }}>
            <Button type="submit" disabled={isCreating} variant="contained">
              {isCreating ? 'Creating...' : 'Create Coffee'}
            </Button>
          </FormControl>
        </div>
      </Form>
    </Box>
  );
}
