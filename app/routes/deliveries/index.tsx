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
import { Button } from '@mui/material';

import type { Delivery } from '~/_libs/core/models/delivery.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';
import { toPrettyDate } from '~/_libs/core/utils/dates';

type LoaderData = {
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
};

export const loader = async () => {
  const deliveries = await getDeliveries();
  return json<LoaderData>({
    deliveries,
  });
};

export default function Deliveries() {
  const { deliveries } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h2">Deliveries</Typography>

      <Button href="/deliveries/admin/new">Create New Delivery</Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Coffee 1</TableCell>
              <TableCell>Coffee 2</TableCell>
              <TableCell>Coffee 3</TableCell>
              <TableCell>Coffee 4</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery: Delivery) => (
              <TableRow
                key={delivery.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link to={`admin/${delivery.id}`}>{delivery.id}</Link>
                </TableCell>
                <TableCell>{toPrettyDate(delivery.date)}</TableCell>
                <TableCell>{delivery.type}</TableCell>
                <TableCell>{delivery.coffee1?.productCode}</TableCell>
                <TableCell>{delivery.coffee2?.productCode}</TableCell>
                <TableCell>{delivery.coffee3?.productCode}</TableCell>
                <TableCell>{delivery.coffee4?.productCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
