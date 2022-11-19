import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { FikenCustomer } from '~/_libs/fiken';
import { getCustomers } from '~/_libs/fiken';
import { Box } from '@mui/material';

type LoaderData = {
  customers: Awaited<ReturnType<typeof getCustomers>>;
};

export const loader = async () => {
  const customers = await getCustomers();
  return json<LoaderData>({
    customers,
  });
};

export default function B2BCustomers() {
  const { customers } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h1">Fiken Customers</Typography>

      <Box sx={{ m: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="subscription table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer: FikenCustomer) => (
                <TableRow
                  key={customer.contactId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{customer.contactId}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}
