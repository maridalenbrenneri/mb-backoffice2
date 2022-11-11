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

import type { Order } from '@prisma/client';

import { getOrders } from '~/_libs/core/models/order.server';

type LoaderData = {
  orders: Awaited<ReturnType<typeof getOrders>>;
};

export const loader = async () => {
  const orders = await getOrders();
  return json<LoaderData>({
    orders,
  });
};

export default function Orders() {
  const { orders } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h2">Orders</Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
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
                <TableCell>{order.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
