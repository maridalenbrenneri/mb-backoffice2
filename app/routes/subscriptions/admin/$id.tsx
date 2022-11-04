import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useTransition,
  useLoaderData,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Box,
  Button,
  FormControl,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { getSubscription } from '~/_libs/core/models/subscription.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import { upsertAction } from './_shared';
import type { GiftSubscription } from '@prisma/client';
import { toPrettyDate } from '~/_libs/core/utils/dates';

type LoaderData = { subscription: Subscription };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);
  const subscription = await getSubscription(+params.id);
  invariant(subscription, `Subscription not found: ${params.id}`);
  return json({ subscription });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateSubscription() {
  const { subscription } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  const renderGiftSubscription = (gift: GiftSubscription) => {
    return (
      <>
        <Paper>
          <Typography variant="h3">Data</Typography>
          <p>
            Requested start date: {toPrettyDate(gift.originalFirstDeliveryDate)}{' '}
            <br></br>
            First delivery: {toPrettyDate(gift.firstDeliveryDate)} <br></br>
            Duration: {gift.durationMonths} months
            <br></br>
            <br></br>
            Customer: {gift.customerName} <br></br>
            Woo order: {gift.wooOrderId} <br></br>
            Woo customer: {gift.wooCustomerId}
          </p>
        </Paper>

        <br></br>
        <br></br>

        <Paper>
          <Typography variant="h3">Recipent</Typography>
          <Form method="post">
            <input type="hidden" name="id" value={gift.id} />

            <FormControl>
              <TextField
                name="recipientName"
                label="Name"
                variant="outlined"
                defaultValue={gift.recipientName}
                error={errors?.recipientName}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="recipientStreet1"
                label="Street1"
                variant="outlined"
                defaultValue={gift.recipientStreet1}
                error={errors?.recipientStreet1}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="recipientStreet2"
                label="Street2"
                variant="outlined"
                defaultValue={gift.recipientStreet2}
                error={errors?.recipientStreet2}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="recipientPostcode"
                label="Postcode"
                variant="outlined"
                defaultValue={gift.recipientPostcode}
                error={errors?.recipientPostcode}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="recipientPlace"
                label="Place"
                variant="outlined"
                defaultValue={gift.recipientPlace}
                error={errors?.recipientPlace}
              />
            </FormControl>
            <br></br>
            <FormControl sx={{ m: 1 }}>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update recipient'}
              </Button>
            </FormControl>
          </Form>
        </Paper>
      </>
    );
  };

  return (
    <Box
      m={2}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Edit Subscription</Typography>

      <Paper>
        Type: {subscription.type} <br></br>
        Status: {subscription.status} <br></br>
        Frequency: {subscription.frequency} <br></br>
        250: {subscription.quantity250} <br></br>
        500: {subscription.quantity500} <br></br>
        1200: {subscription.quantity1200} <br></br>
        <br></br>
        Customer note: {subscription.customerNote} <br></br>
      </Paper>

      {subscription.giftSubscription &&
        renderGiftSubscription(subscription.giftSubscription)}
    </Box>
  );
}
