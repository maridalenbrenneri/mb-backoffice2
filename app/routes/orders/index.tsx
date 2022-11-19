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
import { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const defaultStatus = OrderStatus.ACTIVE;

type LoaderData = {
  orders: Awaited<ReturnType<typeof getOrders>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getStatusFilter = search.get('status') || defaultStatus;

  if (getStatusFilter !== '_all') filter.where.status = getStatusFilter;

  return filter;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  const orders = await getOrders(filter);
  return json<LoaderData>({
    orders,
  });
};

export default function Orders() {
  const { orders } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const [status, setStatus] = useState(params.get('status') || defaultStatus);

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
          <Table sx={{ minWidth: 650 }} aria-label="subscription table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
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
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}
