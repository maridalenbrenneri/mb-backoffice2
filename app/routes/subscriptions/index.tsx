import { json } from '@remix-run/node';
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  Box,
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
import { resolveSubscriptionCode } from '~/_libs/core/services/subscription-service';
import { TAKE_MAX_ROWS } from '~/_libs/core/settings';

const defaultStatus = '_all';
const defaultType = '_all';

type LoaderData = {
  subscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getStatusFilter = search.get('status') || defaultStatus;
  if (getStatusFilter === '_all') {
    filter.where.OR = [
      {
        status: SubscriptionStatus.ACTIVE,
      },
      {
        status: SubscriptionStatus.PASSIVE,
      },
    ];
  } else {
    filter.where.status = getStatusFilter;
  }

  const getTypeFilter = search.get('type') || defaultType;
  if (getTypeFilter !== '_all') filter.where.type = getTypeFilter;

  filter.orderBy = {
    id: 'desc',
  };

  filter.take = TAKE_MAX_ROWS;

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
      <Typography variant="h1">Subscriptions</Typography>

      <Box sx={{ m: 1, p: 2 }}>
        <Button href="/subscriptions/admin/new" variant="contained">
          Create a new subscription
        </Button>
      </Box>

      <Box sx={{ m: 1 }}>
        <Form method="get">
          <FormControl sx={{ m: 1 }}>
            <InputLabel id={`subscription-type`}>Type</InputLabel>
            <Select
              labelId={`subscription-type`}
              name={`type`}
              defaultValue={type}
              onChange={handleSelectType}
              sx={{ minWidth: 250 }}
              size="small"
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
              size="small"
            >
              <MenuItem value={'_all'}>Active & Passive</MenuItem>
              <MenuItem value={SubscriptionStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={SubscriptionStatus.PASSIVE}>Passive</MenuItem>
              <MenuItem value={SubscriptionStatus.NOT_STARTED}>
                Not started
              </MenuItem>
              <MenuItem value={SubscriptionStatus.COMPLETED}>
                Completed
              </MenuItem>
            </Select>
          </FormControl>
        </Form>

        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 650 }}
            aria-label="subscription table"
            size="small"
          >
            <TableHead>
              <TableRow sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell colSpan={4} sx={{ border: 0, fontSize: 12 }}>
                  <small>{subscriptions.length} subscriptions</small>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <small>ID</small>
                </TableCell>
                <TableCell>
                  <small>Type</small>
                </TableCell>
                <TableCell>
                  <small>Status</small>
                </TableCell>
                <TableCell>
                  <small>Recipient</small>
                </TableCell>
                <TableCell>
                  <small>Abo type</small>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((subscription: Subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <Link to={`admin/${subscription.id}`}>
                      {subscription.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <small>{subscription.type}</small>
                  </TableCell>
                  <TableCell>
                    <small>{subscription.status}</small>
                  </TableCell>
                  <TableCell>{subscription.recipientName}</TableCell>
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
      </Box>
    </main>
  );
}
