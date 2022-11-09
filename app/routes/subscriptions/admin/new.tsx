import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import {
  renderCustomers,
  renderFrequency,
  renderStatus,
  renderTypes,
  upsertAction,
} from './_shared';
import { Button, FormControl, TextField } from '@mui/material';
import { getCustomers } from '~/_libs/fiken';
import { SubscriptionType } from '@prisma/client';

type LoaderData = {
  customers: Awaited<ReturnType<typeof getCustomers>>;
};

export const loader = async () => {
  const customers = await getCustomers();
  return json<LoaderData>({
    customers,
  });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function NewSubscription() {
  const errors = useActionData();
  const transition = useTransition();
  const { customers } = useLoaderData() as unknown as LoaderData;

  const isCreating = Boolean(transition.submission);

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Create New Subscription</Typography>
      <Form method="post">
        <input type="hidden" name="type" value={SubscriptionType.B2B} />

        {renderCustomers(customers)}
        {renderTypes()}
        {renderStatus()}
        {renderFrequency()}
        <FormControl>
          <TextField
            name="quantity250"
            label="Quantity, 250g"
            variant="outlined"
            defaultValue={0}
            error={errors?.quantity250}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity500"
            label="Quantity, 500g"
            variant="outlined"
            defaultValue={0}
            error={errors?.quantity500}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity1200"
            label="Quantity, 1,2kg"
            variant="outlined"
            defaultValue={0}
            error={errors?.quantity1200}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="internalNote"
            label="Note"
            variant="outlined"
            multiline
          />
        </FormControl>
        <FormControl sx={{ m: 1 }}>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Subscription'}
          </Button>
        </FormControl>
      </Form>
    </Box>
  );
}
