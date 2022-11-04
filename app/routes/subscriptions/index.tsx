import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';

import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import { resolveSubscriptionCode } from '~/_libs/core/utils/gift-subscription-helper';

type LoaderData = {
  subscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
};

export const loader = async () => {
  const subscriptions = await getSubscriptions();
  return json<LoaderData>({
    subscriptions,
  });
};

export default function Subscriptions() {
  const { subscriptions } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h2">Subscriptions</Typography>

      <Button href="/subscriptions/admin/new">Create a new subscription</Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Abo type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription: Subscription) => (
              <TableRow
                key={subscription.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link to={`admin/${subscription.id}`}>{subscription.id}</Link>
                </TableCell>
                <TableCell>{subscription.status}</TableCell>
                <TableCell>{resolveSubscriptionCode(subscription)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
