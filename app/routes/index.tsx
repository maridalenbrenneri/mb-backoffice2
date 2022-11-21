import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import {
  OrderStatus,
  SubscriptionStatus,
  SubscriptionType,
} from '@prisma/client';

import { getLastImportResult } from '~/_libs/core/models/import-result.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';

import type { SubscriptionStats } from '~/_libs/core/services/subscription-stats';
import { countBags } from '~/_libs/core/services/subscription-stats';
import SubscriptionStatsBox from '~/components/SubscriptionStatsBox';
import RoastOverviewBox from '~/components/RoastOverviewBox';
import { getCargonizerProfile } from '~/_libs/cargonizer';
import CargonizerProfileBox from '~/components/CargonizerProfileBox';
import JobsInfoBox from '~/components/JobsInfoBox';
import { Grid, Paper } from '@mui/material';

type LoaderData = {
  wooSubscriptionImportResult: Awaited<ReturnType<typeof getLastImportResult>>;
  wooOrderImportResult: Awaited<ReturnType<typeof getLastImportResult>>;
  updateGaboStatusResult: Awaited<ReturnType<typeof getLastImportResult>>;
  activeSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
  deliveries: Awaited<ReturnType<typeof getDeliveries>>;
  cargonizerProfile: Awaited<ReturnType<typeof getCargonizerProfile>>;
};

export const loader = async () => {
  const wooSubscriptionImportResult = await getLastImportResult(
    'woo-import-subscription-stats'
  );
  const wooOrderImportResult = await getLastImportResult('woo-import-orders');
  const updateGaboStatusResult = await getLastImportResult(
    'update-status-on-gift-subscriptions'
  );

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

  const deliveries = await getDeliveries({
    include: {
      coffee1: { select: { id: true, productCode: true } },
      coffee2: { select: { id: true, productCode: true } },
      coffee3: { select: { id: true, productCode: true } },
      coffee4: { select: { id: true, productCode: true } },
      orders: {
        where: {
          status: OrderStatus.ACTIVE,
        },
        select: {
          id: true,
          type: true,
          orderItems: {
            select: {
              coffeeId: true,
              quantity: true,
              variation: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'asc' },
    take: 5,
  });

  const cargonizerProfile = await getCargonizerProfile();

  return json<LoaderData>({
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
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

  const gifts =
    activeSubscriptions.filter(
      (s) => s.type === SubscriptionType.PRIVATE_GIFT
    ) || [];

  const B2Bs =
    activeSubscriptions.filter((s) => s.type === SubscriptionType.B2B) || [];

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
  const {
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    activeSubscriptions,
    deliveries,
    cargonizerProfile,
  } = useLoaderData() as unknown as LoaderData;

  if (!wooSubscriptionImportResult?.length) {
    return (
      <Box>Couldn't load dashboard. No imported data from Woo was found </Box>
    );
  }

  const wooStats = JSON.parse(
    wooSubscriptionImportResult[0].result as string
  ) as SubscriptionStats;

  const aboStats = resolveAboStats(wooStats, activeSubscriptions);

  return (
    <main>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h2">Roast overview</Typography>
        <RoastOverviewBox stats={aboStats} deliveries={deliveries} />
      </Box>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h2">Subscription overview</Typography>
        <SubscriptionStatsBox stats={aboStats} />
      </Box>

      <Typography variant="h2">Other stuff</Typography>
      <Grid container spacing={2}>
        <Grid item md={4} xl={3}>
          <Paper sx={{ p: 1 }}>
            <JobsInfoBox
              subscriptions={wooSubscriptionImportResult[0]}
              orders={wooOrderImportResult[0]}
              gaboStatus={updateGaboStatusResult[0]}
            />
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
