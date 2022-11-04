import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Box, Paper, Typography } from '@mui/material';

import { getSubscription } from '~/_libs/core/models/subscription.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';

type LoaderData = { subscription: Subscription };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);
  const subscription = await getSubscription(+params.id);
  invariant(subscription, `Subscription not found: ${params.id}`);

  return json({ subscription });
};

export default function UpdateSubscription() {
  const { subscription } = useLoaderData() as unknown as LoaderData;

  return (
    <Box
      m={2}
      p={1}
      sx={{
        '& .MuiTextField-root': { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Subscription</Typography>

      <Paper>
        <Box sx={{ m: 2, p: 1 }}>
          Type: {subscription.type} <br></br>
          Status: {subscription.status} <br></br>
          Frequency: {subscription.frequency} <br></br>
          <br></br>
          250: {subscription.quantity250} <br></br>
          500: {subscription.quantity500} <br></br>
          1200: {subscription.quantity1200} <br></br>
        </Box>
      </Paper>
      <Paper>
        <Box sx={{ m: 2, p: 1 }}>
          Customer note: {subscription.customerNote} <br></br>
        </Box>
      </Paper>

      <Outlet />
    </Box>
  );
}

export function ErrorBoundary() {
  const { id } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${id}. Sorry.`}</div>
  );
}
