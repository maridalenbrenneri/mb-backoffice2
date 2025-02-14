import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';

import {
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Box,
  Typography,
} from '@mui/material';

import type { Delivery, Product } from '@prisma/client';

import { SubscriptionStatus } from '~/_libs/core/repositories/subscription';
import type { Subscription } from '~/_libs/core/repositories/subscription';
import * as subscriptionRepo from '~/_libs/core/repositories/subscription';

import { OrderStatus } from '~/_libs/core/repositories/order';

import { getLastJobResult } from '~/_libs/core/repositories/job-result.server';
import { getDeliveries } from '~/_libs/core/repositories/delivery.server';

import { resolveAboStats } from '~/_libs/core/services/subscription-stats';
import SubscriptionStatsBox from '~/components/SubscriptionStatsBox';
import RoastOverviewBox from '~/components/RoastOverviewBox';
import { getCargonizerProfile } from '~/_libs/cargonizer';
import CargonizerProfileBox from '~/components/CargonizerProfileBox';
import JobsInfoBox from '~/components/JobsInfoBox';

import { TAKE_MAX_ROWS } from '~/_libs/core/settings';
import { getProducts } from '~/_libs/core/repositories/product';
import StaffSubscriptions from '~/components/StaffSubscriptions';

type LoaderData = {
  wooProductImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  wooSubscriptionImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  wooOrderImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  updateGaboStatusResult: Awaited<ReturnType<typeof getLastJobResult>>;
  createRenewalOrdersResult: Awaited<ReturnType<typeof getLastJobResult>>;
  allActiveSubscriptions: Awaited<
    ReturnType<typeof subscriptionRepo.getSubscriptions>
  >;
  currentDeliveries: Awaited<ReturnType<typeof getDeliveries>>;
  currentCoffees: Awaited<ReturnType<typeof getProducts>>;
  cargonizerProfile: Awaited<ReturnType<typeof getCargonizerProfile>>;
};

export const loader = async () => {
  const wooProductImportResult = await getLastJobResult('woo-import-products');
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

  const allActiveSubscriptions = await subscriptionRepo.getSubscriptions({
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
      product1: { select: { id: true, productCode: true } },
      product2: { select: { id: true, productCode: true } },
      product3: { select: { id: true, productCode: true } },
      product4: { select: { id: true, productCode: true } },
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
              productId: true,
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

  const currentCoffees = await getProducts({
    where: { category: 'coffee' },
    select: {
      id: true,
      productCode: true,
    },
    take: 10,
  });

  const cargonizerProfile = await getCargonizerProfile();

  return Response.json({
    wooProductImportResult,
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
    wooProductImportResult,
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
  const [coffees, setCoffees] = useState<Product[]>();
  const [cargonizer, setCargonizer] = useState();

  const [orderImportResult, setOrderImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function resolveOrderImportResult() {
      const result = {
        ordersWithUnknownProduct: null,
        hasErrors: false,
      };

      const importResult = wooOrderImportResult[0].result;
      if (importResult) {
        const res = JSON.parse(importResult);
        result.ordersWithUnknownProduct = res.ordersWithUnknownProduct.length
          ? res.ordersWithUnknownProduct
          : null;
      }

      result.hasErrors = !!wooOrderImportResult[0].errors;
      return result;
    }

    if (
      loading &&
      allActiveSubscriptions &&
      currentDeliveries &&
      currentCoffees &&
      cargonizerProfile &&
      wooOrderImportResult
    ) {
      setSubscriptions(allActiveSubscriptions);
      setDeliveries(currentDeliveries);
      setCoffees(currentCoffees);
      setCargonizer(cargonizerProfile);
      setOrderImportResult(resolveOrderImportResult());
      setLoading(false);
    }
  }, [
    loading,
    allActiveSubscriptions,
    currentDeliveries,
    currentCoffees,
    cargonizerProfile,
    wooOrderImportResult,
    orderImportResult,
  ]);

  if (loading) {
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
  }

  const aboStats = resolveAboStats(subscriptions || []);

  return (
    <main>
      {orderImportResult.ordersWithUnknownProduct && (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Alert
            severity="error"
            sx={{
              marginBottom: 1,
              p: 1,
              '& .MuiAlert-message': {
                textAlign: 'center',
                width: 'inherit',
              },
            }}
          >
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              SOME ORDERS COULDN'T BE IMPORTED FROM WOO
              <p>
                Most likely because the product (coffee code) doesn't exist in
                Backoffice. Check active orders in Woo to resolve which coffee
                is missing and add it to Backoffice.
              </p>
              <p>
                Orders not imported (woo order ids):{' '}
                {orderImportResult.ordersWithUnknownProduct.join()}
              </p>
            </Grid>
          </Alert>
        </Grid>
      )}
      {orderImportResult.hasErrors && (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <Alert
            severity="error"
            sx={{
              marginBottom: 1,
              p: 1,
              '& .MuiAlert-message': {
                textAlign: 'center',
                width: 'inherit',
              },
            }}
          >
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              LAST IMPORT OF WOO ORDERS FAILED
              <p>
                It can be active orders in Woo that haven't been imported to
                Backoffice. This is most likely because the Woo REST API is not
                available.
              </p>
              <p>
                If it's time for packing, complete/ship all orders from Woo
                admin.{' '}
                <small>
                  (B2B and GABO orders not affected, they can still be completed
                  from Backoffice)
                </small>
              </p>
              <p>
                If this error doesn't disappear after next import, call Björn.
                Order import runs every hour, it can also be triggered manually
                from "Scheduled jobs" page.
              </p>
            </Grid>
          </Alert>
        </Grid>
      )}

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
              products={wooProductImportResult[0]}
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
        <Grid item md={5} xl={3}>
          <Paper sx={{ p: 1 }}>
            <StaffSubscriptions />
          </Paper>
        </Grid>
      </Grid>
    </main>
  );
}
