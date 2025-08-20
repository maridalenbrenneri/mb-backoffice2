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

import { getDeliveries } from '~/services/delivery.service';
import { toPrettyDate } from '~/utils/dates';
import { useEffect, useState } from 'react';
import { DeliveryEntity, ProductEntity } from '~/services/entities';

type LoaderData = {
  loadedDeliveries: Awaited<ReturnType<typeof getDeliveries>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = {
    where: {},
    relations: ['product1', 'product2', 'product3', 'product4', 'orders'],
    orderBy: {
      date: 'desc',
    },
  };

  return filter;
}

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  const loadedDeliveries = await getDeliveries(filter);

  return json<LoaderData>({
    loadedDeliveries,
  });
};

function resolveCoffeeLabel(product: ProductEntity | null) {
  console.log('resolveCoffeeLabel', product?.productCode);
  if (product) return product.productCode || `${product.id} (no code set)`;

  return 'not set';
}

export default function Deliveries() {
  const { loadedDeliveries } = useLoaderData() as unknown as LoaderData;

  const [deliveries, setDeliveries] = useState<DeliveryEntity[]>();

  useEffect(() => {
    setDeliveries(loadedDeliveries);
  }, [loadedDeliveries]);

  if (!deliveries) return null;

  return (
    <main>
      <Typography variant="h1">Delivery Days</Typography>

      <Box sx={{ m: 2 }}>
        <Button href="/deliveries/admin/new" variant="contained">
          Create New Delivery day
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
            {deliveries.map((delivery: DeliveryEntity) => (
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
                <TableCell>{resolveCoffeeLabel(delivery.product1)}</TableCell>
                <TableCell>{resolveCoffeeLabel(delivery.product2)}</TableCell>
                <TableCell>{resolveCoffeeLabel(delivery.product3)}</TableCell>
                <TableCell>{resolveCoffeeLabel(delivery.product4)}</TableCell>
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
