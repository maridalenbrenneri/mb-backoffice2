import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import JSONPretty from 'react-json-pretty';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box, Button, FormControl } from '@mui/material';

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
  const fetcher = useFetcher();

  const isRunningImportWooOrders =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') === 'import-woo-orders';

  const isRunningImportWooSubscriptions =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') === 'import-woo-subscriptions';

  const isRunningUpdateStatusOnGiftSubscriptions =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') ===
      'update-status-on-gift-subscriptions';

  return (
    <main>
      <Typography variant="h1">Scheduled jobs</Typography>

      <Box>
        <fetcher.Form method="post" action="/api/import-woo-orders">
          <FormControl sx={{ m: 1 }}>
            <Button
              type="submit"
              name="_action"
              value="import-woo-orders"
              variant="contained"
              disabled={isRunningImportWooOrders}
            >
              {isRunningImportWooOrders
                ? 'Running...'
                : 'Run "Import Woo Orders"'}
            </Button>
          </FormControl>
        </fetcher.Form>

        <fetcher.Form method="post" action="/api/import-woo-subscriptions">
          <FormControl sx={{ m: 1 }}>
            <Button
              type="submit"
              name="_action"
              value="import-woo-subscriptions"
              variant="contained"
              disabled={isRunningImportWooSubscriptions}
            >
              {isRunningImportWooSubscriptions
                ? 'Running...'
                : 'Run "Import Woo Subscriptions"'}
            </Button>
          </FormControl>
        </fetcher.Form>

        <fetcher.Form
          method="post"
          action="/api/update-status-on-gift-subscriptions"
        >
          <FormControl sx={{ m: 1 }}>
            <Button
              type="submit"
              name="_action"
              value="update-status-on-gift-subscriptions"
              variant="contained"
              disabled={isRunningUpdateStatusOnGiftSubscriptions}
            >
              {isRunningUpdateStatusOnGiftSubscriptions
                ? 'Running...'
                : 'Run "Update Status On Gift Subscriptions"'}
            </Button>
          </FormControl>
        </fetcher.Form>
      </Box>

      <Box sx={{ my: 2 }}>
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
