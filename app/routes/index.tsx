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
import { toPrettyDateTime } from '~/_libs/core/utils/dates';

type LoaderData = {
  wooData: Awaited<ReturnType<typeof getLastWooImportResult>>;
  activeSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
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

  return json<LoaderData>({
    wooData,
    activeSubscriptions,
    deliveries,
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
  const { wooData, activeSubscriptions, deliveries } =
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
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>MB Dashboard</h1>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Roast overview</Typography>
        <RoastOverviewBox stats={aboStats} delivery={deliveries[0]} />
      </Box>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Subscription overview</Typography>
        <SubscriptionStatsBox stats={aboStats} />
      </Box>
      <Box sx={{ my: 8 }}>
        Data from Woo last imported{' '}
        {toPrettyDateTime(wooImportResult.importStarted)}
      </Box>
    </div>
  );
}
