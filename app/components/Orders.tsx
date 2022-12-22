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

import { toPrettyDateText, toPrettyDateTime } from '~/_libs/core/utils/dates';
import { TableFooter } from '@mui/material';
import { generateReference } from '~/_libs/core/services/order-service';

export default function Orders(props: {
  orders: Order[];
  ignoreFields?: string[] | undefined;
}) {
  const { orders, ignoreFields } = props;

  if (!orders) return null;

  const ignore = (field: string) => {
    if (!ignoreFields) return false;
    return !!ignoreFields.find((f) => f === field);
  };

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
              <TableCell>Updated</TableCell>
              <TableCell>Name</TableCell>
              {!ignore('delivery') && <TableCell>Delivery day</TableCell>}
              <TableCell>Item summary</TableCell>
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
                <TableCell>
                  <small>{toPrettyDateTime(order.createdAt)}</small>
                </TableCell>
                <TableCell>
                  <small>{toPrettyDateTime(order.updatedAt)}</small>
                </TableCell>
                <TableCell>
                  <small>{order.name}</small>
                </TableCell>
                {!ignore('delivery') && (
                  <TableCell>
                    <Link to={`/deliveries/admin/${order.delivery?.id}`}>
                      {toPrettyDateText(order.delivery?.date)}
                    </Link>
                  </TableCell>
                )}
                <TableCell>{generateReference(order)}</TableCell>
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
