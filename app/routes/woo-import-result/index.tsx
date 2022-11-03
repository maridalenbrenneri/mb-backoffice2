import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import JSONPretty from 'react-json-pretty';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { WooImportResult } from '~/_libs/core/models/woo-import-result.server';
import { getWooImportResults } from '~/_libs/core/models/woo-import-result.server';
import { toPrettyDateTime } from '~/_libs/core/utils/dates';

type LoaderData = {
  results: Awaited<ReturnType<typeof getWooImportResults>>;
};

export const loader = async () => {
  const results = await getWooImportResults();
  return json<LoaderData>({
    results,
  });
};

export default function ImportResult() {
  const { results } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h2">Woo Import</Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result: WooImportResult) => (
              <TableRow
                key={result.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{toPrettyDateTime(result.createdAt)}</TableCell>
                <TableCell>
                  <JSONPretty
                    id="json-pretty"
                    data={result.result}
                  ></JSONPretty>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
