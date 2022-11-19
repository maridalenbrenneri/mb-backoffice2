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
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import type { Coffee } from '~/_libs/core/models/coffee.server';
import { getCoffees } from '~/_libs/core/models/coffee.server';
import { CoffeeStatus } from '@prisma/client';
import { useState } from 'react';

const defaultStatus = CoffeeStatus.ACTIVE;

type LoaderData = {
  coffees: Awaited<ReturnType<typeof getCoffees>>;
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

  const coffees = await getCoffees(filter);
  return json<LoaderData>({
    coffees,
  });
};

export default function Coffees() {
  const { coffees } = useLoaderData() as unknown as LoaderData;
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
      <Typography variant="h1">Coffees</Typography>

      <Box sx={{ m: 2 }}>
        <Button href="/coffees/admin/new" variant="contained">
          Create a new coffee
        </Button>
      </Box>

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
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={CoffeeStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={CoffeeStatus.SOLD_OUT}>Sold out</MenuItem>
            <MenuItem value={CoffeeStatus.IN_ORDER}>In order</MenuItem>
          </Select>
        </FormControl>
      </Form>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Country</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coffees.map((coffee: Coffee) => (
              <TableRow
                key={coffee.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link to={`admin/${coffee.id}`}>{coffee.id}</Link>
                </TableCell>
                <TableCell>{coffee.status}</TableCell>
                <TableCell>{coffee.productCode}</TableCell>
                <TableCell>{coffee.name}</TableCell>
                <TableCell>{coffee.country}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
