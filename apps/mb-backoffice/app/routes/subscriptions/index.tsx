import { json } from '@remix-run/node';
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { ILike, In } from 'typeorm';

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
  TextField,
} from '@mui/material';

import {
  SubscriptionStatus,
  SubscriptionType,
} from '~/services/entities/enums';

import { resolveSubscriptionCode } from '~/services/subscription.service';

import { toPrettyDate, toPrettyDateTime } from '~/utils/dates';
import { getSubscriptionsPaginated } from '~/services/subscription.service';
import { SubscriptionEntity } from '~/services/entities';

const defaultStatus = '_all';
const defaultType = '_all';

type LoaderData = {
  loadedSubscriptions: Awaited<ReturnType<typeof getSubscriptionsPaginated>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getStatusFilter = search.get('status') || defaultStatus;
  if (getStatusFilter === '_all') {
    filter.where.status = In([
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.PASSIVE,
    ]);
  } else {
    filter.where.status = getStatusFilter;
  }

  const getTypeFilter = search.get('type') || defaultType;
  if (getTypeFilter !== '_all') filter.where.type = getTypeFilter;

  const getRecipientNameFilter = search.get('recipientName');
  if (getRecipientNameFilter)
    filter.where.recipientName = ILike(`%${getRecipientNameFilter}%`);

  const getRecipientEmailFilter = search.get('recipientEmail');
  if (getRecipientEmailFilter)
    filter.where.recipientEmail = ILike(`%${getRecipientEmailFilter}%`);

  const getCustomerNameFilter = search.get('customerName');
  if (getCustomerNameFilter)
    filter.where.wooCustomerName = ILike(`%${getCustomerNameFilter}%`);

  filter.order = {
    id: 'desc',
  };

  return filter;
}

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  const pageParam = parseInt(search.get('page') || '1', 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const take = 100;
  const skip = (page - 1) * take;

  const loadedSubscriptions = await getSubscriptionsPaginated({
    ...filter,
    take,
    skip,
  });

  return json<LoaderData>({
    loadedSubscriptions,
  });
};

export default function Subscriptions() {
  const { loadedSubscriptions } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();

  const [subscriptions, setSubscriptions] = useState<SubscriptionEntity[]>();
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 100;
  const [status, setStatus] = useState(params.get('status') || defaultStatus);
  const [type, setType] = useState(params.get('type') || defaultType);
  const [recipientName, setRecipientName] = useState(
    params.get('recipientName') || ''
  );
  const [recipientEmail, setRecipientEmail] = useState(
    params.get('recipientEmail') || ''
  );
  const [customerName, setCustomerName] = useState(
    params.get('customerName') || ''
  );

  useEffect(() => {
    setSubscriptions(loadedSubscriptions.data);
    setTotal(loadedSubscriptions.total);
    setPage(loadedSubscriptions.page);
  }, [loadedSubscriptions]);

  if (!subscriptions) return null;

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const handleSelectType = (e: any) => {
    setType(e.target.value);
    doSubmit({
      status,
      type: e.target.value,
      customerName,
      recipientName,
      recipientEmail,
    });
  };

  const handleSelectStatus = (e: any) => {
    setStatus(e.target.value);
    doSubmit({
      status: e.target.value,
      type,
      customerName,
      recipientName,
      recipientEmail,
    });
  };

  const handleSelectRecipientName = (e: any) => {
    setRecipientName(e.target.value);
    doSubmit({
      recipientName: e.target.value,
      recipientEmail,
      customerName,
      type,
      status,
    });
  };

  const handleSelectRecipientEmail = (e: any) => {
    if (e.target.value?.length === 1) return;
    setRecipientEmail(e.target.value);
    doSubmit({
      recipientEmail: e.target.value,
      customerName,
      type,
      status,
      recipientName,
    });
  };

  const handleSelectCustomerName = (e: any) => {
    setCustomerName(e.target.value);
    doSubmit({
      customerName: e.target.value,
      recipientName,
      recipientEmail,
      type,
      status,
    });
  };

  const gaboInfoString = (s: SubscriptionEntity) => {
    if (s.type !== SubscriptionType.PRIVATE_GIFT) return '';

    return `
      ${toPrettyDate(s.gift_firstDeliveryDate)} / ${s.gift_durationMonths}`;
  };

  // TODO: Does not clear content of form controls
  // const clearFilters = () => {
  //   setType(defaultType);
  //   setStatus(defaultStatus);
  //   setRecipientName('');
  //   setRecipientEmail('');

  //   doSubmit({});
  // };

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
              <MenuItem value={SubscriptionType.PRIVATE}>ABO</MenuItem>
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
              <MenuItem value={SubscriptionStatus.ON_HOLD}>On hold</MenuItem>
              <MenuItem value={SubscriptionStatus.NOT_STARTED}>
                Not started
              </MenuItem>
              <MenuItem value={SubscriptionStatus.COMPLETED}>
                Completed
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <TextField
              name="recipientName"
              label="Recipient, name"
              variant="outlined"
              size="small"
              defaultValue={recipientName}
              onChange={handleSelectRecipientName}
            />
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <TextField
              name="recipientEmail"
              label="Recipent, email"
              variant="outlined"
              size="small"
              defaultValue={recipientEmail}
              onChange={handleSelectRecipientEmail}
            />
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <TextField
              name="customername"
              label="Customer, name"
              variant="outlined"
              size="small"
              defaultValue={customerName}
              onChange={handleSelectCustomerName}
            />
          </FormControl>
          {/* <FormControl>
            <Button onClick={clearFilters}>Clear filters</Button>
          </FormControl> */}
        </Form>

        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 650 }}
            aria-label="subscription table"
            size="small"
          >
            <TableHead>
              <TableRow>
                <TableCell colSpan={10} sx={{ border: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <small>
                      Showing {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, total)} of {total}
                    </small>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <Link
                        to={`?${new URLSearchParams({
                          status,
                          type,
                          recipientName,
                          recipientEmail,
                          customerName,
                          page: String(Math.max(page - 1, 1)),
                        }).toString()}`}
                        aria-disabled={page <= 1}
                        style={{
                          pointerEvents: page <= 1 ? 'none' : 'auto',
                          opacity: page <= 1 ? 0.5 : 1,
                        }}
                      >
                        Prev
                      </Link>
                      <Link
                        to={`?${new URLSearchParams({
                          status,
                          type,
                          recipientName,
                          recipientEmail,
                          customerName,
                          page: String(
                            page * pageSize < total ? page + 1 : page
                          ),
                        }).toString()}`}
                        aria-disabled={page * pageSize >= total}
                        style={{
                          pointerEvents:
                            page * pageSize >= total ? 'none' : 'auto',
                          opacity: page * pageSize >= total ? 0.5 : 1,
                        }}
                      >
                        Next
                      </Link>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Created/Imported</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Recipient, email</TableCell>
                <TableCell>Customer, name</TableCell>
                <TableCell>Abo type</TableCell>
                <TableCell>GABO start/months</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((subscription: SubscriptionEntity) => (
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
                  <TableCell>
                    <small>
                      {subscription.status === SubscriptionStatus.PASSIVE
                        ? ''
                        : subscription.frequency}
                    </small>
                  </TableCell>
                  <TableCell>
                    <small>{toPrettyDateTime(subscription.createdAt)}</small>
                  </TableCell>
                  <TableCell>{subscription.recipientName}</TableCell>
                  <TableCell>{subscription.recipientEmail}</TableCell>
                  <TableCell>{subscription.wooCustomerName}</TableCell>
                  <TableCell>{resolveSubscriptionCode(subscription)}</TableCell>
                  <TableCell>{gaboInfoString(subscription)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <small>
                      Showing {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, total)} of {total}
                    </small>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <Link
                        to={`?${new URLSearchParams({
                          status,
                          type,
                          recipientName,
                          recipientEmail,
                          customerName,
                          page: String(Math.max(page - 1, 1)),
                        }).toString()}`}
                        aria-disabled={page <= 1}
                        style={{
                          pointerEvents: page <= 1 ? 'none' : 'auto',
                          opacity: page <= 1 ? 0.5 : 1,
                        }}
                      >
                        Prev
                      </Link>
                      <Link
                        to={`?${new URLSearchParams({
                          status,
                          type,
                          recipientName,
                          recipientEmail,
                          customerName,
                          page: String(
                            page * pageSize < total ? page + 1 : page
                          ),
                        }).toString()}`}
                        aria-disabled={page * pageSize >= total}
                        style={{
                          pointerEvents:
                            page * pageSize >= total ? 'none' : 'auto',
                          opacity: page * pageSize >= total ? 0.5 : 1,
                        }}
                      >
                        Next
                      </Link>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}
