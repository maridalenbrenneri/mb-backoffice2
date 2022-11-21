import { Link } from '@remix-run/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import type { Order } from '@prisma/client';

import { toPrettyDate, toPrettyDateTime } from '~/_libs/core/utils/dates';
import { TableFooter } from '@mui/material';

export default function Orders(props: { orders: Order[] }) {
  const { orders } = props;

  if (!orders) return <Box>Orders was null :(</Box>;

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="orders table" size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={8}>
                <small>{orders.length} orders</small>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Delivery</TableCell>
              <TableCell>250g</TableCell>
              <TableCell>500g</TableCell>
              <TableCell>1,2kg</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow
                key={order.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link to={`/orders/admin/${order.id}`}>{order.id}</Link>
                </TableCell>
                <TableCell>
                  <small>{order.status}</small>
                </TableCell>
                <TableCell>
                  <small>{order.type}</small>
                </TableCell>
                <TableCell>{toPrettyDateTime(order.createdAt)}</TableCell>
                <TableCell>
                  <Link to={`/deliveries/admin/${order.delivery?.id}`}>
                    {toPrettyDate(order.delivery?.date)}
                  </Link>
                </TableCell>
                <TableCell>{order.quantity250}</TableCell>
                <TableCell>{order.quantity500}</TableCell>
                <TableCell>{order.quantity1200}</TableCell>
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
  );
}
