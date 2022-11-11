import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Box, Button, Typography, FormControl, TextField } from '@mui/material';

import { OrderStatus } from '@prisma/client';

import { upsertAction } from '../../../orders/admin/_shared';
import { getSubscription } from '~/_libs/core/models/subscription.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';

type LoaderData = {
  subscription: Awaited<ReturnType<typeof getSubscription>>;
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.subscriptionId, `params.subscriptionId is required`);

  const subscription = await getSubscription(+params.subscriptionId);
  invariant(subscription, `Subscription not found: ${params.subscriptionId}`);

  const deliveries = await getDeliveries();
  invariant(deliveries, `Deliveries not found`);

  return json({ subscription, deliveries });
};

export default function NewOrder() {
  const { subscription, deliveries } = useLoaderData() as unknown as LoaderData;
  const errors = useActionData();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  if (!subscription)
    throw new Error('Subscription is null, this should never happen');

  const selectedDeliveryId = deliveries[0].id;

  return (
    <Box
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Create New Order</Typography>
      <Form method="post">
        <input type="hidden" name="subscriptionId" value={subscription.id} />
        <input type="hidden" name="deliveryId" value={selectedDeliveryId} />
        <input type="hidden" name="status" value={OrderStatus.ACTIVE} />

        <input
          type="hidden"
          name="deliveryId"
          value={subscription.recipientName}
        />
        <input type="hidden" name="name" value={subscription.recipientName} />
        <input
          type="hidden"
          name="address1"
          value={subscription.recipientAddress1}
        />
        <input
          type="hidden"
          name="address2"
          value={subscription.recipientAddress2 || undefined}
        />
        <input
          type="hidden"
          name="postalCode"
          value={subscription.recipientPostalCode}
        />
        <input
          type="hidden"
          name="postalPlace"
          value={subscription.recipientPostalPlace}
        />
        <input
          type="hidden"
          name="mobile"
          value={subscription.recipientMobile || undefined}
        />
        <input
          type="hidden"
          name="email"
          value={subscription.recipientEmail || undefined}
        />

        <FormControl>
          <TextField
            name="quantity250"
            label="Quantity 250"
            variant="outlined"
            defaultValue={subscription.quantity250}
            error={errors?.quantity250}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity500"
            label="Quantity 500"
            variant="outlined"
            defaultValue={subscription.quantity500}
            error={errors?.quantity500}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="quantity1200"
            label="Quantity 1200"
            variant="outlined"
            defaultValue={subscription.quantity1200}
            error={errors?.quantity1200}
          />
        </FormControl>
        <FormControl sx={{ m: 1 }}>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Order'}
          </Button>
        </FormControl>
      </Form>
    </Box>
  );
}
