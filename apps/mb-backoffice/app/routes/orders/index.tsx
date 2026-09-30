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

import { OrderEntity, OrderStatus } from '~/services/entities';

import { getOrdersPaginated } from '~/services/order.service';
import { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableFooter,
} from '@mui/material';
import { toPrettyDateText, toPrettyDateTime } from '~/utils/dates';
import { generateReference, resolveSource } from '~/services/order.service';

const defaultStatus = OrderStatus.ACTIVE;

type LoaderData = {
  loadedOrders: Awaited<ReturnType<typeof getOrdersPaginated>>;
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

  filter.relations = [
    'delivery',
    'orderItems',
    'orderItems.product',
    'subscription',
  ];

  return filter;
}

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  // pagination params
  const pageParam = parseInt(search.get('page') || '1', 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const take = 100;
  const skip = (page - 1) * take;

  const loadedOrders = await getOrdersPaginated({ ...filter, take, skip });

  return json<LoaderData>({
    loadedOrders,
  });
};

export default function Orders() {
  const { loadedOrders } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();

  const [orders, setOrders] = useState<OrderEntity[]>();
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 100;
  const [status, setStatus] = useState(params.get('status') || defaultStatus);

  useEffect(() => {
    setOrders(loadedOrders.data);
    setTotal(loadedOrders.total);
    setPage(loadedOrders.page);
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
                  <small>
                    {orders.length} of {total} orders
                  </small>
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
              {orders.map((order: OrderEntity) => (
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
                <TableCell colSpan={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <small>
                      Showing {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, total)} of {total}
                    </small>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <Link
                        to={`?${new URLSearchParams({
                          status,
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
