import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Coffee, Delivery } from '@prisma/client';
import { OrderStatus, SubscriptionStatus } from '@prisma/client';

import { getLastJobResult } from '~/_libs/core/models/job-result.server';
import type { Subscription } from '~/_libs/core/models/subscription.server';
import { getSubscriptions } from '~/_libs/core/models/subscription.server';
import { getDeliveries } from '~/_libs/core/models/delivery.server';
import { getCoffees } from '~/_libs/core/models/coffee.server';

import { resolveAboStats } from '~/_libs/core/services/subscription-stats';
import SubscriptionStatsBox from '~/components/SubscriptionStatsBox';
import RoastOverviewBox from '~/components/RoastOverviewBox';
import { getCargonizerProfile } from '~/_libs/cargonizer';
import CargonizerProfileBox from '~/components/CargonizerProfileBox';
import JobsInfoBox from '~/components/JobsInfoBox';
import { CircularProgress, Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { TAKE_MAX_ROWS } from '~/_libs/core/settings';

type LoaderData = {
  wooSubscriptionImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  wooOrderImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  updateGaboStatusResult: Awaited<ReturnType<typeof getLastJobResult>>;
  createRenewalOrdersResult: Awaited<ReturnType<typeof getLastJobResult>>;
  allActiveSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
  currentDeliveries: Awaited<ReturnType<typeof getDeliveries>>;
  currentCoffees: Awaited<ReturnType<typeof getCoffees>>;
  cargonizerProfile: Awaited<ReturnType<typeof getCargonizerProfile>>;
};

export const loader = async () => {
  const wooSubscriptionImportResult = await getLastJobResult(
    'woo-import-subscriptions'
  );
  const wooOrderImportResult = await getLastJobResult('woo-import-orders');
  const updateGaboStatusResult = await getLastJobResult(
    'update-status-on-gift-subscriptions'
  );
  const createRenewalOrdersResult = await getLastJobResult(
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
      wooNextPaymentDate: true,
    },
    take: TAKE_MAX_ROWS,
  });

  // DELIVERIES USED IN ROAST OVERVIEW - ONLY "ACTIVE" AND "COMPLETED"
  // TODO: ROAST OVERVIEW SHOULD DO IT'S OWN DATA LOADING
  const currentDeliveries = await getDeliveries({
    include: {
      coffee1: { select: { id: true, productCode: true } },
      coffee2: { select: { id: true, productCode: true } },
      coffee3: { select: { id: true, productCode: true } },
      coffee4: { select: { id: true, productCode: true } },
      orders: {
        where: {
          status: { in: [OrderStatus.ACTIVE, OrderStatus.COMPLETED] },
        },
        select: {
          id: true,
          subscriptionId: true,
          status: true,
          type: true,
          quantity250: true,
          quantity500: true,
          quantity1200: true,
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
    orderBy: { date: 'desc' },
    take: 5,
  });

  const currentCoffees = await getCoffees({
    select: {
      id: true,
      productCode: true,
    },
    take: 10,
  });

  const cargonizerProfile = await getCargonizerProfile();

  return json<LoaderData>({
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    currentCoffees,
    cargonizerProfile,
  });
};

export default function Index() {
  const {
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    currentCoffees,
    cargonizerProfile,
  } = useLoaderData() as unknown as LoaderData;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [deliveries, setDeliveries] = useState<Delivery[]>();
  const [coffees, setCoffees] = useState<Coffee[]>();
  const [cargonizer, setCargonizer] = useState();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allActiveSubscriptions && currentDeliveries && cargonizerProfile) {
      setSubscriptions(allActiveSubscriptions);
      setDeliveries(currentDeliveries);
      setCoffees(currentCoffees);
      setCargonizer(cargonizerProfile);

      setLoading(false);
    }
  }, [
    allActiveSubscriptions,
    currentDeliveries,
    currentCoffees,
    cargonizerProfile,
  ]);

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
        <RoastOverviewBox
          subscriptions={allActiveSubscriptions}
          deliveries={deliveries || []}
          coffees={coffees || []}
        />
      </Box>
      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h2">Subscription overview</Typography>
        <SubscriptionStatsBox stats={aboStats} />
      </Box>

      <Typography variant="h2">Other stuff</Typography>
      <Grid container spacing={2}>
        <Grid item md={7} xl={5}>
          <Paper sx={{ p: 1 }}>
            <JobsInfoBox
              subscriptions={wooSubscriptionImportResult[0]}
              orders={wooOrderImportResult[0]}
              gaboStatus={updateGaboStatusResult[0]}
              createRenewalOrders={createRenewalOrdersResult[0]}
            />
          </Paper>
        </Grid>
        <Grid item md={5} xl={3}>
          <Paper sx={{ p: 1 }}>
            <CargonizerProfileBox profile={cargonizer} />
          </Paper>
        </Grid>
      </Grid>
    </main>
  );
}
