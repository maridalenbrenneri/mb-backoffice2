import { useLoaderData } from '@remix-run/react';

import { Alert, Paper, Box, Typography, Grid2 } from '@mui/material';

import { SubscriptionStatus, OrderStatus } from '~/services/entities/enums';
import { getSubscriptions } from '~/services/subscription.service';
import { getLastJobResult } from '~/services/job-result.service';
import {
  getAllCoffeeProducts,
  getNotYetPublishedCoffeeProducts,
  getPublishedCoffeeProducts,
} from '~/services/product.service';

import { getDeliveries } from '~/services/delivery.service';
import { resolveAboStats } from '~/services/subscription-stats.service';

// import { getCargonizerProfile } from '~/_libs/cargonizer';
import { TAKE_MAX_ROWS } from '~/settings';

import SubscriptionStatsBox from '~/components/SubscriptionStatsBox';
import RoastOverviewBox from '~/components/RoastOverviewBox';
// import CargonizerProfileBox from '~/components/CargonizerProfileBox';
import JobsInfoBox from '~/components/JobsInfoBox';
import StaffSubscriptions from '~/components/StaffSubscriptions';
import PublishedProductsBox from '~/components/PublishedProductsBox';

type LoaderData = {
  wooSubscriptionImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  wooOrderImportResult: Awaited<ReturnType<typeof getLastJobResult>>;
  wooProductSyncStatusResult: Awaited<ReturnType<typeof getLastJobResult>>;
  updateGaboStatusResult: Awaited<ReturnType<typeof getLastJobResult>>;
  createRenewalOrdersResult: Awaited<ReturnType<typeof getLastJobResult>>;

  allActiveSubscriptions: Awaited<ReturnType<typeof getSubscriptions>>;
  currentDeliveries: Awaited<ReturnType<typeof getDeliveries>>;

  allCoffeeProductsForRoastOverview: Awaited<
    ReturnType<typeof getAllCoffeeProducts>
  >;
  notYetPublishedCoffeeProducts: Awaited<
    ReturnType<typeof getNotYetPublishedCoffeeProducts>
  >;
  publishedCoffeeProducts: Awaited<
    ReturnType<typeof getPublishedCoffeeProducts>
  >;

  // cargonizerProfile: Awaited<ReturnType<typeof getCargonizerProfile>>;
};

export const loader = async () => {
  const [
    wooProductSyncStatusResult,
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    allCoffeeProductsForRoastOverview,
    notYetPublishedCoffeeProducts,
    publishedCoffeeProducts,
    // cargonizerProfile,
  ] = await Promise.all([
    getLastJobResult('woo-product-sync-status'),
    getLastJobResult('woo-import-subscriptions'),
    getLastJobResult('woo-import-orders'),
    getLastJobResult('update-status-on-gift-subscriptions'),
    getLastJobResult('create-renewal-orders'),
    getSubscriptions({
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
    }),
    getDeliveries({
      relations: [
        'product1',
        'product2',
        'product3',
        'product4',
        'orders',
        'orders.orderItems',
      ],
      orderBy: { date: 'desc' },
      take: 5,
    }),
    getAllCoffeeProducts({
      select: {
        id: true,
        productCode: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    getNotYetPublishedCoffeeProducts({
      select: {
        id: true,
        name: true,
        productCode: true,
        status: true,
        coffee_country: true,
        stockStatus: true,
        stockRemaining: true,
      },
    }),
    getPublishedCoffeeProducts({
      select: {
        id: true,
        name: true,
        productCode: true,
        status: true,
        coffee_country: true,
        stockStatus: true,
        stockRemaining: true,
      },
    }),
    // getCargonizerProfile(),
  ]);

  // Filter orders to only include ACTIVE and COMPLETED orders
  currentDeliveries.forEach((delivery) => {
    if (delivery.orders) {
      delivery.orders = delivery.orders.filter(
        (order) =>
          order.status === OrderStatus.ACTIVE ||
          order.status === OrderStatus.COMPLETED
      );
    }
  });

  return Response.json({
    wooProductSyncStatusResult,
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    allCoffeeProductsForRoastOverview,
    notYetPublishedCoffeeProducts,
    publishedCoffeeProducts,
    // cargonizerProfile,
  });
};

export default function Dashboard() {
  const {
    wooProductSyncStatusResult,
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
    allActiveSubscriptions,
    currentDeliveries,
    allCoffeeProductsForRoastOverview,
    notYetPublishedCoffeeProducts,
    publishedCoffeeProducts,
    // cargonizerProfile,
  } = useLoaderData() as unknown as LoaderData;

  const orderImportResult = (() => {
    const result = {
      ordersWithUnknownProduct: null as string[] | null,
      hasErrors: false,
    };

    const importResult = wooOrderImportResult[0]?.result;
    if (importResult) {
      const res = JSON.parse(importResult);
      result.ordersWithUnknownProduct = res.ordersWithUnknownProduct?.length
        ? res.ordersWithUnknownProduct
        : null;
    }

    result.hasErrors = !!wooOrderImportResult[0]?.errors;
    return result;
  })();

  const aboStats = resolveAboStats(allActiveSubscriptions || []);

  return (
    <main>
      {orderImportResult.ordersWithUnknownProduct && (
        <Grid2 size={12} style={{ textAlign: 'center' }}>
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
            <Grid2 size={12} style={{ textAlign: 'center' }}>
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
            </Grid2>
          </Alert>
        </Grid2>
      )}
      {orderImportResult.hasErrors && (
        <Grid2 size={12} style={{ textAlign: 'center' }}>
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
            <Grid2 size={12} style={{ textAlign: 'center' }}>
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
            </Grid2>
          </Alert>
        </Grid2>
      )}

      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Roast overview</Typography>
        <RoastOverviewBox
          subscriptions={allActiveSubscriptions}
          deliveries={currentDeliveries}
          coffees={allCoffeeProductsForRoastOverview}
        />
      </Box>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box sx={{ minWidth: 120, my: 2 }}>
            <Typography variant="h3">Published coffees</Typography>
            <PublishedProductsBox products={publishedCoffeeProducts} />
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box sx={{ minWidth: 120, my: 2 }}>
            <Typography variant="h3">Coffees coming soon</Typography>
            <PublishedProductsBox products={notYetPublishedCoffeeProducts} />
          </Box>
        </Grid2>
      </Grid2>

      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Subscription overview</Typography>
        <SubscriptionStatsBox stats={aboStats} />
      </Box>

      <Typography variant="h3">Other stuff</Typography>
      <Grid2 container spacing={2}>
        <Grid2 size={{ md: 7, xl: 5 }}>
          <Paper sx={{ p: 1 }}>
            <JobsInfoBox
              products={wooProductSyncStatusResult[0]}
              subscriptions={wooSubscriptionImportResult[0]}
              orders={wooOrderImportResult[0]}
              gaboStatus={updateGaboStatusResult[0]}
              createRenewalOrders={createRenewalOrdersResult[0]}
            />
          </Paper>
        </Grid2>
        {/* <Grid2 size={{ md: 5, xl: 3 }}>
          <Paper sx={{ p: 1 }}>
            <CargonizerProfileBox profile={cargonizerProfile} />
          </Paper>
        </Grid2> */}
        <Grid2 size={{ md: 5, xl: 3 }}>
          <Paper sx={{ p: 1 }}>
            <StaffSubscriptions />
          </Paper>
        </Grid2>
      </Grid2>
    </main>
  );
}
