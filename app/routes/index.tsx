import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Delivery } from '@prisma/client';
import {
  OrderStatus,
  SubscriptionFrequency,
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
import { CircularProgress, Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { TAKE_MAX_ROWS } from '~/_libs/core/settings';

type LoaderData = {
  wooSubscriptionImportResult: Awaited<ReturnType<typeof getLastImportResult>>;
  wooOrderImportResult: Awaited<ReturnType<typeof getLastImportResult>>;
  updateGaboStatusResult: Awaited<ReturnType<typeof getLastImportResult>>;
  createRenewalOrdersResult: Awaited<ReturnType<typeof getLastImportResult>>;
  allActiveSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
  currentDeliveries: Awaited<ReturnType<typeof getDeliveries>>;
  cargonizerProfile: Awaited<ReturnType<typeof getCargonizerProfile>>;
};

export const loader = async () => {
  const wooSubscriptionImportResult = await getLastImportResult(
    'woo-import-subscriptions'
  );
  const wooOrderImportResult = await getLastImportResult('woo-import-orders');
  const updateGaboStatusResult = await getLastImportResult(
    'update-status-on-gift-subscriptions'
  );
  const createRenewalOrdersResult = await getLastImportResult(
    'create-renewal-orders'
  );

  const allActiveSubscriptions = await getSubscriptions({
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
    take: TAKE_MAX_ROWS,
  });

  const currentDeliveries = await getDeliveries({
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
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    cargonizerProfile,
  });
};

function resolveAboStats(
  allActiveSubscriptions: Subscription[]
): SubscriptionStats {
  const activeMonthly = allActiveSubscriptions.filter(
    (s) => s.frequency === SubscriptionFrequency.MONTHLY
  );

  const activeMonthly3rd = allActiveSubscriptions.filter(
    (s) => s.frequency === SubscriptionFrequency.MONTHLY_3RD
  );

  const activeFortnightly = allActiveSubscriptions.filter(
    (s) => s.frequency === SubscriptionFrequency.FORTNIGHTLY
  );

  const bagCounterMonthly = countBags(activeMonthly);
  const bagCounterMonthly3rd = countBags(activeMonthly3rd); // No Monthly3rd comes from Woo
  const bagCounterFortnightly = countBags(activeFortnightly);

  const gifts =
    allActiveSubscriptions.filter(
      (s) => s.type === SubscriptionType.PRIVATE_GIFT
    ) || [];

  const B2Bs =
    allActiveSubscriptions.filter((s) => s.type === SubscriptionType.B2B) || [];

  return {
    bagCounterMonthly,
    bagCounterMonthly3rd,
    bagCounterFortnightly,
    totalCount: allActiveSubscriptions.length,
    monthlyCount: activeMonthly.length,
    fortnightlyCount: activeFortnightly.length,
    subscriptionCount: allActiveSubscriptions.length,
    giftSubscriptionCount: gifts.length,
    b2bSubscriptionCount: B2Bs.length,
  };
}

export default function Index() {
  const {
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    cargonizerProfile,
  } = useLoaderData() as unknown as LoaderData;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [deliveries, setDeliveries] = useState<Delivery[]>();
  const [cargonizer, setCargonizer] = useState();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allActiveSubscriptions && currentDeliveries && cargonizerProfile) {
      setSubscriptions(allActiveSubscriptions);
      setDeliveries(currentDeliveries);
      setCargonizer(cargonizerProfile);
      setLoading(false);
    }
  }, [allActiveSubscriptions, currentDeliveries, cargonizerProfile]);

  if (loading)
    return (
      <main>
        <Grid container>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Box sx={{ m: 10 }}>
              <CircularProgress color="primary" />
              <Typography>Loading dashboard...</Typography>
            </Box>
          </Grid>
        </Grid>
      </main>
    );

  const aboStats = resolveAboStats(subscriptions || []);

  return (
    <main>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h2">Roast overview</Typography>
        <RoastOverviewBox stats={aboStats} deliveries={deliveries || []} />
      </Box>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h2">Subscription overview</Typography>
        <SubscriptionStatsBox stats={aboStats} />
      </Box>

      <Typography variant="h2">Other stuff</Typography>
      <Grid container spacing={2}>
        <Grid item md={5} xl={4}>
          <Paper sx={{ p: 1 }}>
            <JobsInfoBox
              subscriptions={wooSubscriptionImportResult[0]}
              orders={wooOrderImportResult[0]}
              gaboStatus={updateGaboStatusResult[0]}
              createRenewalOrders={createRenewalOrdersResult[0]}
            />
          </Paper>
        </Grid>
        <Grid item md={4} xl={3}>
          <Paper sx={{ p: 1 }}>
            <CargonizerProfileBox profile={cargonizer} />
          </Paper>
        </Grid>
      </Grid>
    </main>
  );
}
