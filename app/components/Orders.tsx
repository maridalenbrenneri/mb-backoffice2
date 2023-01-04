import { Link } from '@remix-run/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import type { Order } from '@prisma/client';

import { toPrettyDateText, toPrettyDateTime } from '~/_libs/core/utils/dates';
import { TableFooter } from '@mui/material';
import {
  generateReference,
  resolveSource,
} from '~/_libs/core/services/order-service';
import { FIKEN_CONTACT_URL } from '~/_libs/core/settings';

export default function Orders(props: {
  orders: Order[];
  extraFields?: string[] | null | undefined; // "delivery", "fiken"
}) {
  const { orders, extraFields: ignoreFields } = props;

  if (!orders) return null;

  const extra = (field: string) => {
    if (!ignoreFields) return false;
    return !!ignoreFields.find((f) => f === field);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="orders table" size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={7 + extra.length}>
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
              {extra('fiken') && <TableCell>Customer in Fiken</TableCell>}
              {extra('delivery') && <TableCell>Delivery day</TableCell>}
              <TableCell>Item summary</TableCell>
              {extra('source') && <TableCell>Source</TableCell>}
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
                {extra('fiken') && order.subscription && (
                  <TableCell>
                    <a
                      href={`${FIKEN_CONTACT_URL}${order.subscription.fikenContactId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {order.subscription.fikenContactId}{' '}
                      <OpenInNewIcon sx={{}} />
                    </a>
                  </TableCell>
                )}
                {extra('delivery') && order.delivery && (
                  <TableCell>
                    <Link to={`/deliveries/admin/${order.deliveryId}`}>
                      {toPrettyDateText(order.delivery.date)}
                    </Link>
                  </TableCell>
                )}

                <TableCell>{generateReference(order)}</TableCell>
                {extra('source') && (
                  <TableCell>{resolveSource(order)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7 + extra.length}>
                {orders.length} orders
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
