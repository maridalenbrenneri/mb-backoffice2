import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { SubscriptionStatus, SubscriptionType } from '@prisma/client';

import { getLastWooImportResult } from '~/_libs/core/models/woo-import-result.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';

import type { SubscriptionStats } from '~/_libs/core/services/subscription-stats';
import { countBags } from '~/_libs/core/services/subscription-stats';
import SubscriptionStatsBox from '~/components/SubscriptionStatsBox';
import RoastOverviewBox from '~/components/RoastOverviewBox';
import { getCargonizerProfile } from '~/_libs/cargonizer';
import CargonizerProfileBox from '~/components/CargonizerProfileBox';
import WooImportInfoBox from '~/components/WooImportInfoBox';
import { Grid, Paper } from '@mui/material';

type LoaderData = {
  wooData: Awaited<ReturnType<typeof getLastWooImportResult>>;
  activeSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
  cargonizerProfile: Awaited<ReturnType<typeof getCargonizerProfile>>;
};

export const loader = async () => {
  const wooData = await getLastWooImportResult();
  const activeSubscriptions = await getSubscriptions({
    where: {
      status: SubscriptionStatus.ACTIVE,
    },
    select: {
      id: true,
      type: true,
      frequency: true,
      quantity250: true,
      quantity500: true,
      quantity1200: true,
    },
  });
  const deliveries = await getDeliveries();
  const cargonizerProfile = await getCargonizerProfile();

  return json<LoaderData>({
    wooData,
    activeSubscriptions,
    deliveries,
    cargonizerProfile,
  });
};

function resolveAboStats(
  woo: SubscriptionStats,
  activeSubscriptions: Subscription[]
): SubscriptionStats {
  // AGGREGATE GIFT AND B2B SUBSCRIPTIONS TO WOO SUBSCRIPTION BAG COUNT
  const bagCounterMonthly = countBags(
    activeSubscriptions,
    woo.bagCounterMonthly
  );
  const bagCounterFortnightly = woo.bagCounterFortnightly;

  // TODO: ADD MONTHLY WITH 3rd WEEK DELIVERY AS OWN bagCounter

  const gifts = activeSubscriptions.filter(
    (s) => s.type === SubscriptionType.PRIVATE_GIFT
  );

  const B2Bs = activeSubscriptions.filter(
    (s) => s.type === SubscriptionType.B2B
  );

  return {
    bagCounterMonthly,
    bagCounterFortnightly,
    totalCount: woo.totalCount + gifts.length,
    giftSubscriptionCount: gifts.length,
    monthlyCount: woo.monthlyCount + gifts.length,
    fortnightlyCount: woo.fortnightlyCount,
    subscriptionCount: woo.subscriptionCount,
    b2bSubscriptionCount: B2Bs.length,
  };
}

export default function Index() {
  const { wooData, activeSubscriptions, deliveries, cargonizerProfile } =
    useLoaderData() as unknown as LoaderData;

  if (!wooData?.length) {
    return (
      <Box>Couldn't load dashboard. No imported data from Woo was found </Box>
    );
  }

  const wooImportResult = JSON.parse(wooData[0].result);
  const wooSubscriptionStats =
    wooImportResult.subscriptionStats as SubscriptionStats;

  const aboStats = resolveAboStats(wooSubscriptionStats, activeSubscriptions);

  return (
    <main>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Roast overview</Typography>
        <RoastOverviewBox stats={aboStats} deliveries={deliveries} />
      </Box>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Subscription overview</Typography>
        <SubscriptionStatsBox stats={aboStats} />
      </Box>

      <Grid container spacing={2}>
        <Grid item md={4} xl={3}>
          <Paper sx={{ p: 1 }}>
            <WooImportInfoBox wooImportResult={wooImportResult} />
          </Paper>
        </Grid>
        <Grid item md={4} xl={3}>
          <Paper sx={{ p: 1 }}>
            <CargonizerProfileBox profile={cargonizerProfile} />
          </Paper>
        </Grid>
      </Grid>
    </main>
  );
}
