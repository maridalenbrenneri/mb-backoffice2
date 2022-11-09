import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  Outlet,
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Box, Button, FormControl, TextField, Typography } from '@mui/material';

import { SubscriptionType } from '@prisma/client';
import {
  renderFrequency,
  renderStatus,
  renderTypes,
  upsertAction,
} from './_shared';
import { getSubscription } from '~/_libs/core/models/subscription.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getCustomer } from '~/_libs/fiken';

type LoaderData = {
  subscription: Subscription;
  customer: Awaited<ReturnType<typeof getCustomer>>;
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);
  const subscription = await getSubscription(+params.id);
  invariant(subscription, `Subscription not found: ${params.id}`);

  const customer = !subscription.fikenContactId
    ? null
    : await getCustomer(subscription.fikenContactId);

  return json({ subscription, customer });
};

export default function UpdateSubscription() {
  const errors = useActionData();
  const transition = useTransition();
  const { subscription, customer } = useLoaderData() as unknown as LoaderData;

  const isUpdating = Boolean(transition.submission);

  console.log('Subscription', subscription);

  const resolveRecipientName = () => {
    if (subscription.type === SubscriptionType.B2B && customer)
      return customer.name;

    if (subscription.giftSubscription)
      return subscription.giftSubscription.recipientName;

    return 'Unknown';
  };

  return (
    <Box
      m={2}
      p={1}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Subscription</Typography>

      <p>Customer: {resolveRecipientName()}</p>

      <Form method="post">
        <input type="hidden" name="id" value={subscription.id} />
        <input type="hidden" name="type" value={subscription.type} />
        <input
          type="hidden"
          name="fikenContactId"
          value={subscription.fikenContactId || undefined}
        />

        {renderTypes(subscription.type)}
        {renderStatus(subscription.status)}
        {renderFrequency(subscription.frequency)}
        <FormControl>
          <TextField
            name="quantity250"
            label="Quantity, 250g"
            variant="outlined"
            defaultValue={subscription.quantity250}
            error={errors?.quantity250}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity500"
            label="Quantity, 500g"
            variant="outlined"
            defaultValue={subscription.quantity500}
            error={errors?.quantity500}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity1200"
            label="Quantity, 1,2kg"
            variant="outlined"
            defaultValue={subscription.quantity1200}
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
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Subscription'}
          </Button>
        </FormControl>
      </Form>

      <Outlet />
    </Box>
  );
}

export function ErrorBoundary() {
  const { id } = useParams();
  return (
    <div className="error-container">{`There was an error loading subscription by the id ${id}. Sorry.`}</div>
  );
}
