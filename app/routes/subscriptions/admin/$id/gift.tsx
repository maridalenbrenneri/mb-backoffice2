import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useParams,
  useTransition,
  Form,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
  Box,
  Typography,
  Button,
  FormControl,
  TextField,
  Paper,
} from '@mui/material';

import { getGiftSubscription } from '~/_libs/core/models/subscription.server';
import type { GiftSubscription } from '@prisma/client';
import { updateGiftSubscriptionAction } from '../_shared';
import { toPrettyDate } from '~/_libs/core/utils/dates';

type LoaderData = { gift: GiftSubscription };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);
  const gift = await getGiftSubscription(+params.id);
  invariant(gift, `Subscription not found: ${params.id}`);
  return json({ gift });
};

export const action: ActionFunction = async ({ request }) => {
  return await updateGiftSubscriptionAction(request);
};

export default function UpdateGiftSubscriptionRecipient() {
  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  const { gift } = useLoaderData() as unknown as LoaderData;

  return (
    <>
      <Typography variant="h3">Gift subscription</Typography>

      <Paper>
        <Box sx={{ m: 2, p: 1 }}>
          First delivery: {toPrettyDate(gift.firstDeliveryDate)} <br></br>
          Deliveries: {gift.durationMonths}
        </Box>
      </Paper>
      <Paper>
        <Box sx={{ m: 2, p: 1 }}>
          Customer: {gift.customerName} <br></br>
          Requested start date: {toPrettyDate(gift.originalFirstDeliveryDate)}
          <br></br>
          Woo order id: {gift.wooOrderId} <br></br>
          Woo customer id: {gift.wooCustomerId}
        </Box>
      </Paper>

      <Form method="post">
        <input type="hidden" name="id" value={gift.id} />

        <FormControl>
          <TextField
            name="name"
            label="Name"
            variant="outlined"
            defaultValue={gift.recipientName}
            error={errors?.recipientName}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="street1"
            label="Street1"
            variant="outlined"
            defaultValue={gift.recipientStreet1}
            error={errors?.recipientStreet1}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="street2"
            label="Street2"
            variant="outlined"
            defaultValue={gift.recipientStreet2}
            error={errors?.recipientStreet2}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="postcode"
            label="Postcode"
            variant="outlined"
            defaultValue={gift.recipientPostcode}
            error={errors?.recipientPostcode}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="place"
            label="Place"
            variant="outlined"
            defaultValue={gift.recipientPlace}
            error={errors?.recipientPlace}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="email"
            label="Email"
            variant="outlined"
            defaultValue={gift.recipientEmail}
            error={errors?.recipientEmail}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="mobile"
            label="Mobile"
            variant="outlined"
            defaultValue={gift.recipientMobile}
            error={errors?.recipientMobile}
          />
        </FormControl>
        <br></br>
        <FormControl sx={{ m: 1 }}>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update recipient'}
          </Button>
        </FormControl>
      </Form>
    </>
  );
}

export function ErrorBoundary() {
  const { id } = useParams();
  return (
    <div className="error-container">{`There was an error updating the gift subscription ${id}. Sorry.`}</div>
  );
}