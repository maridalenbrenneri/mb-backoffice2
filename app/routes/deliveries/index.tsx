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
import { Box, Button, TableFooter } from '@mui/material';

import type { Delivery } from '~/_libs/core/models/delivery.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';
import { toPrettyDate } from '~/_libs/core/utils/dates';

type LoaderData = {
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = {
    where: {},
    include: {
      coffee1: true,
      coffee2: true,
      coffee3: true,
      coffee4: true,
      orders: true,
    },
    orderBy: {
      date: 'desc',
    },
  };

  return filter;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  const deliveries = await getDeliveries(filter);

  return json<LoaderData>({
    deliveries,
  });
};

export default function Deliveries() {
  const { deliveries } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h1">Deliveries</Typography>

      <Box sx={{ m: 2 }}>
        <Button href="/deliveries/admin/new" variant="contained">
          Create New Delivery
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={7}>
                <small>{deliveries.length} deliveries</small>
              </TableCell>
            </TableRow>
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
                <TableCell>
                  <small>{toPrettyDate(delivery.date)}</small>
                </TableCell>
                <TableCell>
                  <small>{delivery.type}</small>
                </TableCell>
                <TableCell>{delivery.coffee1?.productCode}</TableCell>
                <TableCell>{delivery.coffee2?.productCode}</TableCell>
                <TableCell>{delivery.coffee3?.productCode}</TableCell>
                <TableCell>{delivery.coffee4?.productCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>{deliveries.length} deliveries</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </main>
  );
}
