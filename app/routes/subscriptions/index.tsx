import { json } from '@remix-run/node';
import {
  Form,
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableFooter,
} from '@mui/material';

import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import {
  resolveCustomerName,
  resolveSubscriptionCode,
} from '~/_libs/core/utils/gift-subscription-helper';
import { useEffect, useState } from 'react';
import { CheckBox } from '@mui/icons-material';

type LoaderData = {
  subscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getTypeFilter = search.get('type');
  const getStatusFilter = search.get('status');

  console.log('getTypeFilter', getTypeFilter);
  console.log('getStatusFilter', getStatusFilter);

  if (getStatusFilter && getStatusFilter !== '_all') {
    filter.where.status = getStatusFilter;
  }

  if (getTypeFilter && getTypeFilter !== '_all') {
    filter.where.type = getTypeFilter;
  }

  return filter;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  console.log('loader', filter);

  const subscriptions = await getSubscriptions(filter);

  return json<LoaderData>({
    subscriptions,
  });
};

export default function Subscriptions() {
  const { subscriptions } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();

  function handleChange(event: any) {
    console.log('ON CHANGE');
    // submit DOES NOT WORK, WHY??
    submit(event.currentTarget, { replace: true });
  }

  return (
    <main>
      <Typography variant="h2">Subscriptions</Typography>
      <Button href="/subscriptions/admin/new">Create a new subscription</Button>
      <Form method="get" onChange={handleChange}>
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`subscription-type`}>Type</InputLabel>
          <Select
            labelId={`subscription-type`}
            name={`type`}
            defaultValue={params.get('type') || '_all'}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={'B2B'}>B2B</MenuItem>
            <MenuItem value={'PRIVATE_GIFT'}>GABO</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`subscription-status`}>Status</InputLabel>
          <Select
            labelId={`subscription-status`}
            name={`status`}
            defaultValue={params.get('status') || '_all'}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={'ACTIVE'}>Active</MenuItem>
            <MenuItem value={'PASSIVE'}>Passive</MenuItem>
            <MenuItem value={'CANCELLED'}>Cancelled</MenuItem>
            <MenuItem value={'COMPLETED'}>Completed</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit">Filter</Button>
      </Form>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
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
                <TableCell>{subscription.customerName}</TableCell>
                <TableCell>{subscription.status}</TableCell>
                <TableCell>{resolveSubscriptionCode(subscription)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>{subscriptions.length} subscriptions</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </main>
  );
}
