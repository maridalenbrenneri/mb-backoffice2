import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";

import type { Coffee } from "~/_libs/core/models/coffee.server";
import { getCoffees } from "~/_libs/core/models/coffee.server";

type LoaderData = {
  coffees: Awaited<ReturnType<typeof getCoffees>>;
};

export const loader = async () => {
  const coffees = await getCoffees();
  return json<LoaderData>({
    coffees,
  });
};

export default function Coffees() {
  const { coffees } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h2">Coffees</Typography>

      <Button href="/coffees/admin/new">Create a new coffee</Button>

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
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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
