import { Suspense } from 'react';
import { Await, useLoaderData } from '@remix-run/react';

import { Alert, Paper, Box, Typography, Grid2 } from '@mui/material';

import { SubscriptionStatus } from '~/services/entities/enums';
import { getSubscriptions } from '~/services/subscription.service';
import { getLastJobResult } from '~/services/job-result.service';
import {
  getAllCoffeeProducts,
  getNotYetPublishedCoffeeProducts,
  getPublishedCoffeeProducts,
} from '~/services/product.service';

import { getDeliveries } from '~/services/delivery.service';
import { getOrdersForRoastOverview } from '~/services/order.service';
import { attachOrdersToDeliveries } from '~/services/roast.service';
import { resolveAboStats } from '~/services/subscription-stats.service';

import { TAKE_MAX_ROWS } from '~/settings';

import SubscriptionStatsBox from '~/components/SubscriptionStatsBox';
import RoastOverviewBox from '~/components/RoastOverviewBox';
import JobsInfoBox from '~/components/JobsInfoBox';
import StaffSubscriptions from '~/components/StaffSubscriptions';
import PublishedProductsBox from '~/components/PublishedProductsBox';
import { SectionSkeleton } from '~/components/DashboardFallback';

const subscriptionQuery = {
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
};

const productSelect = {
  id: true,
  name: true,
  productCode: true,
  status: true,
  coffee_country: true,
  stockStatus: true,
  stockRemaining: true,
};

type JobResult = Awaited<ReturnType<typeof getLastJobResult>>[number];
type Subscriptions = Awaited<ReturnType<typeof getSubscriptions>>;
type Deliveries = Awaited<ReturnType<typeof getDeliveries>>;
type CoffeeProducts = Awaited<ReturnType<typeof getAllCoffeeProducts>>;

type RoastOverviewData = {
  subscriptions: Subscriptions;
  deliveries: Deliveries;
  coffees: CoffeeProducts;
};

type JobResultsData = {
  products: JobResult | undefined;
  subscriptions: JobResult | undefined;
  orders: JobResult | undefined;
  gaboStatus: JobResult | undefined;
  createRenewalOrders: JobResult | undefined;
  orderImport: {
    ordersWithUnknownProduct: string[] | null;
    hasErrors: boolean;
  };
};

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function parseOrderImportResult(
  wooOrderImportResult: Awaited<ReturnType<typeof getLastJobResult>>
) {
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
}

async function loadRoastOverview(
  allActiveSubscriptions: Promise<Subscriptions>
): Promise<RoastOverviewData> {
  const deliveriesPromise = getDeliveries({
    relations: ['product1', 'product2', 'product3', 'product4'],
    orderBy: { date: 'desc' },
    take: 5,
  }).then(async (deliveries) => {
    const orders = await getOrdersForRoastOverview(
      deliveries.map((delivery) => delivery.id)
    );
    return attachOrdersToDeliveries(deliveries, orders);
  });

  const [subscriptions, deliveries, coffees] = await Promise.all([
    allActiveSubscriptions,
    deliveriesPromise,
    getAllCoffeeProducts({
      select: {
        id: true,
        productCode: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ]);

  return serialize({ subscriptions, deliveries, coffees });
}

async function loadJobResults(): Promise<JobResultsData> {
  const [
    wooProductSyncStatusResult,
    wooSubscriptionImportResult,
    wooOrderImportResult,
    updateGaboStatusResult,
    createRenewalOrdersResult,
  ] = await Promise.all([
    getLastJobResult('woo-product-sync-status'),
    getLastJobResult('woo-import-subscriptions'),
    getLastJobResult('woo-import-orders'),
    getLastJobResult('update-status-on-gift-subscriptions'),
    getLastJobResult('create-renewal-orders'),
  ]);

  return serialize({
    products: wooProductSyncStatusResult[0],
    subscriptions: wooSubscriptionImportResult[0],
    orders: wooOrderImportResult[0],
    gaboStatus: updateGaboStatusResult[0],
    createRenewalOrders: createRenewalOrdersResult[0],
    orderImport: parseOrderImportResult(wooOrderImportResult),
  });
}

function SectionError({ message }: { message: string }) {
  return <Alert severity="error">{message}</Alert>;
}

export const loader = async () => {
  const allActiveSubscriptions = getSubscriptions(subscriptionQuery);

  return {
    roastOverview: loadRoastOverview(allActiveSubscriptions),
    allActiveSubscriptions: allActiveSubscriptions.then(serialize),
    publishedCoffeeProducts: getPublishedCoffeeProducts({
      select: productSelect,
    }).then(serialize),
    notYetPublishedCoffeeProducts: getNotYetPublishedCoffeeProducts({
      select: productSelect,
    }).then(serialize),
    jobResults: loadJobResults(),
  };
};

type DashboardLoaderData = {
  roastOverview: Promise<RoastOverviewData>;
  allActiveSubscriptions: Promise<Subscriptions>;
  publishedCoffeeProducts: Promise<CoffeeProducts>;
  notYetPublishedCoffeeProducts: Promise<CoffeeProducts>;
  jobResults: Promise<JobResultsData>;
};

export default function Dashboard() {
  const data = useLoaderData() as unknown as DashboardLoaderData;

  return (
    <main>
      <Suspense fallback={null}>
        <Await resolve={data.jobResults}>
          {(jobResults) => (
            <OrderImportAlerts orderImport={jobResults.orderImport} />
          )}
        </Await>
      </Suspense>

      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Roast overview</Typography>
        <Suspense fallback={<SectionSkeleton height={180} />}>
          <Await
            resolve={data.roastOverview}
            errorElement={
              <SectionError message="Could not load roast overview" />
            }
          >
            {(roastOverview) => (
              <RoastOverviewBox
                subscriptions={roastOverview.subscriptions}
                deliveries={roastOverview.deliveries}
                coffees={roastOverview.coffees}
              />
            )}
          </Await>
        </Suspense>
      </Box>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box sx={{ minWidth: 120, my: 2 }}>
            <Typography variant="h3">Published coffees</Typography>
            <Suspense fallback={<SectionSkeleton height={140} />}>
              <Await
                resolve={data.publishedCoffeeProducts}
                errorElement={
                  <SectionError message="Could not load published coffees" />
                }
              >
                {(products) => <PublishedProductsBox products={products} />}
              </Await>
            </Suspense>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box sx={{ minWidth: 120, my: 2 }}>
            <Typography variant="h3">Coffees coming soon</Typography>
            <Suspense fallback={<SectionSkeleton height={140} />}>
              <Await
                resolve={data.notYetPublishedCoffeeProducts}
                errorElement={
                  <SectionError message="Could not load upcoming coffees" />
                }
              >
                {(products) => <PublishedProductsBox products={products} />}
              </Await>
            </Suspense>
          </Box>
        </Grid2>
      </Grid2>

      <Box sx={{ minWidth: 120, my: 4 }}>
        <Typography variant="h3">Subscription overview</Typography>
        <Suspense fallback={<SectionSkeleton height={160} />}>
          <Await
            resolve={data.allActiveSubscriptions}
            errorElement={
              <SectionError message="Could not load subscription overview" />
            }
          >
            {(subscriptions) => (
              <SubscriptionStatsBox
                stats={resolveAboStats(subscriptions || [])}
              />
            )}
          </Await>
        </Suspense>
      </Box>

      <Typography variant="h3">Other stuff</Typography>
      <Grid2 container spacing={2}>
        <Grid2 size={{ md: 7, xl: 5 }}>
          <Suspense fallback={<SectionSkeleton height={160} />}>
            <Await
              resolve={data.jobResults}
              errorElement={
                <SectionError message="Could not load scheduled jobs" />
              }
            >
              {(jobResults) => (
                <Paper sx={{ p: 1 }}>
                  <JobsInfoBox
                    products={jobResults.products}
                    subscriptions={jobResults.subscriptions}
                    orders={jobResults.orders}
                    gaboStatus={jobResults.gaboStatus}
                    createRenewalOrders={jobResults.createRenewalOrders}
                  />
                </Paper>
              )}
            </Await>
          </Suspense>
        </Grid2>
        <Grid2 size={{ md: 5, xl: 3 }}>
          <Paper sx={{ p: 1 }}>
            <StaffSubscriptions />
          </Paper>
        </Grid2>
      </Grid2>
    </main>
  );
}

function OrderImportAlerts({
  orderImport,
}: {
  orderImport: JobResultsData['orderImport'];
}) {
  return (
    <>
      {orderImport.ordersWithUnknownProduct && (
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
                {orderImport.ordersWithUnknownProduct.join()}
              </p>
            </Grid2>
          </Alert>
        </Grid2>
      )}
      {orderImport.hasErrors && (
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
    </>
  );
}
