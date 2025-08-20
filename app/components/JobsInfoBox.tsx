import { Box, Typography } from '@mui/material';

import { toPrettyDateTime } from '~/utils/dates';
import DataLabel from './DataLabel';

export default function JobsInfoBox(props: {
  products: any;
  subscriptions: any;
  orders: any;
  gaboStatus: any;
  createRenewalOrders: any;
}) {
  const { products, subscriptions, orders, gaboStatus, createRenewalOrders } =
    props;

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="subtitle1">Scheduled jobs (last run)</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel
          dataFields={[
            {
              label: 'Woo import, orders',
              data:
                toPrettyDateTime(orders?.createdAt, true) || 'Not available',
            },
            {
              label: 'Woo import, subscriptions',
              data:
                toPrettyDateTime(subscriptions?.createdAt, true) ||
                'Not available',
            },
            {
              label: 'Woo import, products',
              data:
                toPrettyDateTime(products?.createdAt, true) || 'Not available',
            },
            {
              label: 'Create renewal orders',
              data:
                toPrettyDateTime(createRenewalOrders?.createdAt, true) ||
                'Not available',
            },
            {
              label: 'Update GABO status',
              data:
                toPrettyDateTime(gaboStatus?.createdAt, true) ||
                'Not available',
            },
          ]}
        />
      </Box>
    </Box>
  );
}
