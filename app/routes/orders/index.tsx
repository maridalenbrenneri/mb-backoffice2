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

import type { Order } from '@prisma/client';
import { OrderStatus } from '@prisma/client';

import { getOrders } from '~/_libs/core/models/order.server';
import { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableFooter,
} from '@mui/material';
import { toPrettyDateText, toPrettyDateTime } from '~/_libs/core/utils/dates';
import { TAKE_MAX_ROWS } from '~/_libs/core/settings';
import {
  generateReference,
  resolveSource,
} from '~/_libs/core/services/order-service';

const defaultStatus = OrderStatus.ACTIVE;

type LoaderData = {
  loadedOrders: Awaited<ReturnType<typeof getOrders>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getStatusFilter = search.get('status') || defaultStatus;

  const getOrderIdsFilter = search.get('orderIds');

  if (getStatusFilter !== '_all') filter.where.status = getStatusFilter;

  if (getOrderIdsFilter) {
    const orderIds = getOrderIdsFilter.split(',').map((id) => +id);
    filter.where.id = { in: orderIds };
  }

  filter.include = {
    delivery: {
      select: {
        id: true,
        date: true,
      },
    },
    orderItems: {
      select: {
        variation: true,
        quantity: true,
        coffee: true,
      },
    },
    subscription: {
      select: {
        id: true,
        type: true,
      },
    },
  };
  filter.take = TAKE_MAX_ROWS;

  return filter;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  const loadedOrders = await getOrders(filter);

  return json<LoaderData>({
    loadedOrders,
  });
};

export default function Orders() {
  const { loadedOrders } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();

  const [orders, setOrders] = useState<Order[]>();
  const [status, setStatus] = useState(params.get('status') || defaultStatus);

  useEffect(() => {
    setOrders(loadedOrders);
  }, [loadedOrders]);

  if (!orders) return null;

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const handleSelectStatus = (e: any) => {
    setStatus(e.target.value);
    doSubmit({
      status: e.target.value,
    });
  };

  return (
    <main>
      <Typography variant="h1">Orders</Typography>

      <Box sx={{ m: 2 }}>
        <Form method="get">
          <FormControl sx={{ m: 1 }}>
            <InputLabel id={`order-status`}>Status</InputLabel>
            <Select
              labelId={`order-status`}
              name={`status`}
              defaultValue={status}
              onChange={handleSelectStatus}
              sx={{ minWidth: 250 }}
              size="small"
            >
              {Object.keys(OrderStatus).map((status: any) => (
                <MenuItem value={status} key={status}>
                  {status}
                </MenuItem>
              ))}
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
              <TableRow>
                <TableCell colSpan={9}>
                  <small>{orders.length} orders</small>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Delivery day</TableCell>
                <TableCell>Item summary</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order: Order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Link to={`admin/${order.id}`}>{order.id}</Link>
                  </TableCell>
                  <TableCell>
                    <small>{order.status}</small>
                  </TableCell>
                  <TableCell>
                    <small>{order.type}</small>
                  </TableCell>
                  <TableCell>
                    <small>{toPrettyDateTime(order.createdAt, true)}</small>
                  </TableCell>
                  <TableCell>
                    <small>{toPrettyDateTime(order.updatedAt, true)}</small>
                  </TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>
                    <Link to={`/deliveries/admin/${order.deliveryId}`}>
                      {toPrettyDateText(order.delivery?.date)}
                    </Link>
                  </TableCell>
                  <TableCell>{generateReference(order)}</TableCell>
                  <TableCell>{resolveSource(order)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>{orders.length} orders</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}
