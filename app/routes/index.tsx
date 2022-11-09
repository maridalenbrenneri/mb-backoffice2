import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { WooImportResult } from '~/_libs/core/models/woo-import-result.server';
import { getLastWooImportResult } from '~/_libs/core/models/woo-import-result.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import {
  getSubscriptions,
  SubscriptionStatus,
  SubscriptionType,
} from '~/_libs/core/models/subscription.server';
import type { SubscriptionStats } from '~/_libs/core/services/subscription-stats';
import { countBags } from '~/_libs/core/services/subscription-stats';

type LoaderData = {
  wooData: Awaited<ReturnType<typeof getLastWooImportResult>>;
  activeGiftSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
};

export const loader = async () => {
  const wooData = await getLastWooImportResult();
  const activeGiftSubscriptions = await getSubscriptions({
    where: {
      status: SubscriptionStatus.ACTIVE,
      type: SubscriptionType.PRIVATE_GIFT,
    },
    select: {
      id: true,
      frequency: true,
      quantity250: true,
    },
  });

  return json<LoaderData>({
    wooData,
    activeGiftSubscriptions,
  });
};

function resolveAboStats(
  wooData: WooImportResult[],
  activeGiftSubscriptions: Subscription[]
): SubscriptionStats {
  if (!wooData?.length) {
    console.warn('No Subscription stats from Woo was found');
    // TODO: Handle ...
  }

  const data = JSON.parse(wooData[0].result);
  const woo = data.subscriptionStats as SubscriptionStats;

  const bagCounter = countBags(activeGiftSubscriptions, woo.bagCounter);

  // AGGREGATE STATS (WOO DATA + MB DATA)
  return {
    bagCounter,
    totalCount: woo.totalCount + activeGiftSubscriptions.length,
    giftSubscriptionCount: activeGiftSubscriptions.length,
    monthlyCount: woo.monthlyCount + activeGiftSubscriptions.length,
    fortnightlyCount: woo.fortnightlyCount,
    subscriptionCount: woo.subscriptionCount,
  };
}

export default function Index() {
  const { wooData, activeGiftSubscriptions } =
    useLoaderData() as unknown as LoaderData;

  const aboStats = resolveAboStats(wooData, activeGiftSubscriptions);

  const renderStatsTable = (stats: SubscriptionStats) => {
    return (
      <>
        <p>Active, total: {stats.totalCount}</p>

        <p>Active, monthly: {stats.monthlyCount}</p>
        <p>Active, fortnightly: {stats.fortnightlyCount}</p>

        <p>Active, ABO: {stats.subscriptionCount}</p>
        <p>Active, GABO: {stats.giftSubscriptionCount}</p>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="subscription table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>1</TableCell>
                <TableCell>2</TableCell>
                <TableCell>3</TableCell>
                <TableCell>4</TableCell>
                <TableCell>5</TableCell>
                <TableCell>6</TableCell>
                <TableCell>7</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>Monthly</TableCell>
                <TableCell>{stats.bagCounter.monthly.one}</TableCell>
                <TableCell>{stats.bagCounter.monthly.two}</TableCell>
                <TableCell>{stats.bagCounter.monthly.three}</TableCell>
                <TableCell>{stats.bagCounter.monthly.four}</TableCell>
                <TableCell>{stats.bagCounter.monthly.five}</TableCell>
                <TableCell>{stats.bagCounter.monthly.six}</TableCell>
                <TableCell>{stats.bagCounter.monthly.seven}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fortnightly</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.one}</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.two}</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.three}</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.four}</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.five}</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.six}</TableCell>
                <TableCell>{stats.bagCounter.fortnightly.seven}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>MB Dashboard</h1>
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="h3">ABO STATS</Typography>
        {wooData && renderStatsTable(aboStats)}
        {!wooData && <div>Stats not available</div>}
      </Box>
    </div>
  );
}
