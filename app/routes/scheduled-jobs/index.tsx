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

import type { JobResult } from '@prisma/client';

import { getJobResults } from '~/_libs/core/repositories/job-result.server';
import { toPrettyDateTime } from '~/_libs/core/utils/dates';
import { useEffect, useState } from 'react';

type LoaderData = {
  results: Awaited<ReturnType<typeof getJobResults>>;
};

export const loader = async () => {
  const results = await getJobResults();
  return json<LoaderData>({
    results,
  });
};

export default function JobResultPage() {
  const { results } = useLoaderData() as unknown as LoaderData;
  const fetcher = useFetcher();

  const [jobResult, setJobResult] = useState<JobResult[]>();

  useEffect(() => {
    setJobResult(results);
  }, [jobResult, results]);

  if (!jobResult) return null;

  const isRunningImportWooProducts =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') === 'woo-import-products';

  const isRunningImportWooOrders =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') === 'woo-import-orders';

  const isRunningImportWooSubscriptions =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') === 'woo-import-subscriptions';

  const isRunningUpdateStatusOnGiftSubscriptions =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') ===
      'update-status-on-gift-subscriptions';

  const isRunningCreateRenewalOrders =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('_action') === 'create-renewal-orders';

  const importWooProducts = jobResult.find(
    (r) => r.name === 'woo-import-products'
  );

  const importWooOrders = jobResult.find((r) => r.name === 'woo-import-orders');
  const importWooSubscriptions = results.find(
    (r) => r.name === 'woo-import-subscriptions'
  );
  const updateStatusOnGiftSubscriptions = jobResult.find(
    (r) => r.name === 'update-status-on-gift-subscriptions'
  );
  const createRenewalOrders = jobResult.find(
    (r) => r.name === 'create-renewal-orders'
  );

  return (
    <main>
      <Typography variant="h1" sx={{ m: 2 }}>
        Scheduled jobs
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Last run</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>woo-import-orders</TableCell>
              <TableCell>
                Import of orders from Woo updated in last 7 days. Status changes
                are synced with Backoffice, but no other changes are updated
                after first import. Runs every hour.
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(importWooOrders?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form method="post" action="/api/woo-import-orders">
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-import-orders"
                      disabled={isRunningImportWooOrders}
                    >
                      {isRunningImportWooOrders ? 'Running...' : 'Run now'}
                    </Button>
                  </FormControl>
                </fetcher.Form>
              </TableCell>
            </TableRow>

            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>woo-import-products</TableCell>
              <TableCell>Import products from Woo.</TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(importWooProducts?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form method="post" action="/api/woo-import-products">
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-import-products"
                      disabled={isRunningImportWooProducts}
                    >
                      {isRunningImportWooProducts ? 'Running...' : 'Run now'}
                    </Button>
                  </FormControl>
                </fetcher.Form>
              </TableCell>
            </TableRow>

            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>woo-import-subscriptions</TableCell>
              <TableCell>
                Import of all subscriptions from Woo. Runs once a day.
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(importWooSubscriptions?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form
                  method="post"
                  action="/api/woo-import-subscriptions"
                >
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-import-subscriptions"
                      disabled={isRunningImportWooSubscriptions}
                    >
                      {isRunningImportWooSubscriptions
                        ? 'Running...'
                        : 'Run now '}
                    </Button>
                  </FormControl>
                </fetcher.Form>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>update-status-on-gift-subscriptions</TableCell>
              <TableCell>
                Resolves and updates status on any gift subscription that has
                expired or should be started . Runs once a day.
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(
                    updateStatusOnGiftSubscriptions?.createdAt,
                    true
                  )}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form
                  method="post"
                  action="/api/update-status-on-gift-subscriptions"
                >
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="update-status-on-gift-subscriptions"
                      disabled={isRunningUpdateStatusOnGiftSubscriptions}
                    >
                      {isRunningUpdateStatusOnGiftSubscriptions
                        ? 'Running...'
                        : 'Run now'}
                    </Button>
                  </FormControl>
                </fetcher.Form>
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>create-renewal-orders</TableCell>
              <TableCell>
                Creates renewal orders for active gift and B2B subscriptions.
                Runs every Thursday.
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(createRenewalOrders?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form
                  method="post"
                  action="/api/create-renewal-orders?ignoreRenewalDay=true"
                >
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="create-renewal-orders"
                      disabled={isRunningCreateRenewalOrders}
                    >
                      {isRunningCreateRenewalOrders ? 'Running...' : 'Run now'}
                    </Button>
                  </FormControl>
                </fetcher.Form>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h2" sx={{ m: 2 }}>
        Job history
      </Typography>

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
                    <small>{toPrettyDateTime(result.createdAt, true)}</small>
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
