import { json } from '@remix-run/node';
import {
  Form,
  Link,
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

import type { Subscription } from '@prisma/client';
import { SubscriptionStatus, SubscriptionType } from '@prisma/client';

import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import { resolveSubscriptionCode } from '~/_libs/core/utils/gift-subscription-helper';
import { useState } from 'react';

const defaultStatus = SubscriptionStatus.ACTIVE;
const defaultType = '_all';

type LoaderData = {
  subscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getStatusFilter = search.get('status') || defaultStatus;
  if (getStatusFilter !== '_all') filter.where.status = getStatusFilter;

  const getTypeFilter = search.get('type') || defaultType;
  if (getTypeFilter !== '_all') filter.where.type = getTypeFilter;

  filter.orderBy = {
    id: 'desc',
  };

  return filter;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  const subscriptions = await getSubscriptions(filter);

  return json<LoaderData>({
    subscriptions,
  });
};

export default function Subscriptions() {
  const { subscriptions } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const [status, setStatus] = useState(params.get('status') || defaultStatus);
  const [type, setType] = useState(params.get('type') || defaultType);

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const handleSelectType = (e: any) => {
    setType(e.target.value);
    doSubmit({
      status,
      type: e.target.value,
    });
  };

  const handleSelectStatus = (e: any) => {
    setStatus(e.target.value);
    doSubmit({
      status: e.target.value,
      type,
    });
  };

  return (
    <main>
      <Typography variant="h2">Subscriptions</Typography>
      <Button href="/subscriptions/admin/new">Create a new subscription</Button>
      <Form method="get">
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`subscription-type`}>Type</InputLabel>
          <Select
            labelId={`subscription-type`}
            name={`type`}
            defaultValue={type}
            onChange={handleSelectType}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={SubscriptionType.B2B}>B2B</MenuItem>
            <MenuItem value={SubscriptionType.PRIVATE_GIFT}>GABO</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`subscription-status`}>Status</InputLabel>
          <Select
            labelId={`subscription-status`}
            name={`status`}
            defaultValue={status}
            onChange={handleSelectStatus}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={SubscriptionStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={SubscriptionStatus.PASSIVE}>Passive</MenuItem>
            <MenuItem value={SubscriptionStatus.CANCELLED}>Cancelled</MenuItem>
            <MenuItem value={SubscriptionStatus.COMPLETED}>Completed</MenuItem>
          </Select>
        </FormControl>
      </Form>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Recipient</TableCell>
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
                <TableCell>{subscription.recipientName}</TableCell>
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
