import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import JSONPretty from 'react-json-pretty';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

import { getImportResults } from '~/_libs/core/models/import-result.server';
import { toPrettyDateTime } from '~/_libs/core/utils/dates';

type LoaderData = {
  results: Awaited<ReturnType<typeof getImportResults>>;
};

export const loader = async () => {
  const results = await getImportResults();
  return json<LoaderData>({
    results,
  });
};

export default function ImportResult() {
  const { results } = useLoaderData() as unknown as LoaderData;

  return (
    <main>
      <Typography variant="h1">Woo Import</Typography>

      <Box sx={{ m: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Error</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow
                  key={result.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    {toPrettyDateTime(result.createdAt, true)}
                  </TableCell>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.errors}</TableCell>
                  <TableCell sx={{ width: '50%' }}>
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
      </Box>
    </main>
  );
}
