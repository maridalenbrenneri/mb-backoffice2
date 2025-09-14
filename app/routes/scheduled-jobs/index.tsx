import { json } from '@remix-run/node';
import {
  useFetcher,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import JSONPretty from 'react-json-pretty';
import { useEffect, useState } from 'react';

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

import { getJobResults } from '~/services/job-result.service';
import { toPrettyDateTime } from '~/utils/dates';
import { JobResultEntity } from '~/services/entities';

// TODO: Use this to make UI more dynamic (lot's of duplicated code now)
const jobInfos = [
  {
    name: 'woo-import-orders',
    description: '',
  },
  {
    name: 'woo-import-orders-full',
    description: '',
  },
  {
    name: 'woo-import-subscriptions',
    description: '',
  },
  {
    name: 'woo-import-subscriptions-full',
    description: '',
  },
  {
    name: 'woo-product-sync-status',
    description: '',
  },
  {
    name: 'woo-product-cleanup',
    description: '',
  },
  {
    name: 'update-status-on-gift-subscriptions',
    description: '',
  },
  {
    name: 'create-renewal-orders',
    description: '',
  },
];

type LoaderData = {
  results: Awaited<ReturnType<typeof getJobResults>>;
};

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  const nameFilter = search.get('name') || '_all';

  const results = await getJobResults(nameFilter);
  return json<LoaderData>({
    results,
  });
};

export default function JobResultPage() {
  const { results } = useLoaderData() as unknown as LoaderData;
  const fetcher = useFetcher();
  const [params] = useSearchParams();
  const submit = useSubmit();

  const [jobResult, setJobResult] = useState<JobResultEntity[]>();
  const [nameFilter, setNameFilter] = useState(params.get('name') || '_all');

  useEffect(() => {
    setJobResult(results);
  }, [jobResult, results]);

  if (!jobResult) return null;

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const handleSelectName = (e: any) => {
    setNameFilter(e.target.value);
    doSubmit({
      name: e.target.value,
    });
  };

  // Get unique job names for the filter options
  const uniqueJobNames = jobInfos.map((j) => j.name);

  // Is running

  const isRunningSyncWooProductStatus =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'woo-product-sync-status';

  const isRunningWooProductCleanup =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'woo-product-cleanup';

  const isRunningImportWooOrders =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'woo-import-orders';

  const isRunningImportWooOrdersFull =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'woo-import-orders-full';

  const isRunningImportWooSubscriptions =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'woo-import-subscriptions';

  const isRunningImportWooSubscriptionsFull =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'woo-import-subscriptions-full';

  const isRunningUpdateStatusOnGiftSubscriptions =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'update-status-on-gift-subscriptions';

  const isRunningCreateRenewalOrders =
    fetcher.state === 'submitting' &&
    fetcher.formData?.get('_action') === 'create-renewal-orders';

  // Results

  const syncWooProductStatus = jobResult.find(
    (r) => r.name === 'woo-product-sync-status'
  );

  const wooProductCleanup = jobResult.find(
    (r) => r.name === 'woo-product-cleanup'
  );

  const importWooOrders = jobResult.find((r) => r.name === 'woo-import-orders');

  const importWooOrdersFull = jobResult.find(
    (r) => r.name === 'woo-import-orders-full'
  );

  const importWooSubscriptions = jobResult.find(
    (r) => r.name === 'woo-import-subscriptions'
  );

  const importWooSubscriptionsFull = jobResult.find(
    (r) => r.name === 'woo-import-subscriptions-full'
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
                Import of orders from Woo updated in last 1 day. Fetches all
                orders. Runs every 30 minutes between 06:00 and 23:00.
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
                      sx={{ whiteSpace: 'nowrap' }}
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
              <TableCell>woo-import-orders-full</TableCell>
              <TableCell>
                Import of orders from Woo updated in the last 3o days. Runs
                weekly.
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(importWooOrdersFull?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form
                  method="post"
                  action="/api/woo-import-orders?full=true"
                >
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-import-orders-full"
                      disabled={isRunningImportWooOrdersFull}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {isRunningImportWooOrdersFull ? 'Running...' : 'Run now'}
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
                Import of subscriptions from Woo updated in last 1 day. Runs
                every hour between 06:00 and 23:00.
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
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {isRunningImportWooSubscriptions
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
              <TableCell>woo-import-subscriptions-full</TableCell>
              <TableCell>
                Import of subscriptions from Woo updated in the last 30 days.
                Runs weekly
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(
                    importWooSubscriptionsFull?.createdAt,
                    true
                  )}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form
                  method="post"
                  action="/api/woo-import-subscriptions?full=true"
                >
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-import-subscriptions-full"
                      disabled={isRunningImportWooSubscriptionsFull}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {isRunningImportWooSubscriptionsFull
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
              <TableCell>woo-product-sync-status</TableCell>
              <TableCell>
                Sync product status and stock status from Woo to Backoffice (if
                changes done in Woo admin). Runs every hour
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(syncWooProductStatus?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form
                  method="post"
                  action="/api/woo-product-sync-status"
                >
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-product-sync-status"
                      disabled={isRunningSyncWooProductStatus}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {isRunningSyncWooProductStatus ? 'Running...' : 'Run now'}
                    </Button>
                  </FormControl>
                </fetcher.Form>
              </TableCell>
            </TableRow>

            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>woo-product-cleanup</TableCell>
              <TableCell>
                Sets status 'deleted' on any products that are deleted in Woo.
                Runs weekly.
              </TableCell>
              <TableCell>
                <small>
                  {toPrettyDateTime(wooProductCleanup?.createdAt, true)}
                </small>
              </TableCell>
              <TableCell>
                <fetcher.Form method="post" action="/api/woo-product-cleanup">
                  <FormControl sx={{ m: 1 }}>
                    <Button
                      type="submit"
                      name="_action"
                      value="woo-product-cleanup"
                      disabled={isRunningWooProductCleanup}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {isRunningWooProductCleanup ? 'Running...' : 'Run now'}
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
                expired or should be started . Runs once a day at 04:00
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
                      sx={{ whiteSpace: 'nowrap' }}
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
                Runs every Thursday at 05:00.
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
                      sx={{ whiteSpace: 'nowrap' }}
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

      <Box sx={{ m: 2 }}>
        <FormControl sx={{ m: 1 }}>
          <InputLabel id="job-name-filter">Job name</InputLabel>
          <Select
            labelId="job-name-filter"
            name="name"
            value={nameFilter}
            onChange={handleSelectName}
            sx={{ minWidth: 250 }}
            size="small"
          >
            <MenuItem value="_all">All</MenuItem>
            {uniqueJobNames.map((jobName) => (
              <MenuItem key={jobName} value={jobName}>
                {jobName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
