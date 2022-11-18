import { Box, Typography, Paper } from '@mui/material';

import type { Subscription } from '@prisma/client';
import { SubscriptionType } from '@prisma/client';

import { toPrettyDate } from '~/_libs/core/utils/dates';
import DataLabel from './DataLabel';

export default function GiftSubscriptionWooData(props: {
  subscription: Subscription;
}) {
  const { subscription } = props;

  if (subscription.type !== SubscriptionType.PRIVATE_GIFT) {
    return null;
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Box sx={{ m: 2 }}>
        <Typography variant="subtitle1">Woo GABO data</Typography>
        <Box sx={{ m: 1 }}>
          <DataLabel
            label="First delivery"
            data={toPrettyDate(subscription.gift_firstDeliveryDate)}
          />
          <DataLabel label="Deliveries" data={subscription.deliveries} />
          <DataLabel
            label="Customer"
            data={subscription.gift_wooCustomerName}
          />
          <DataLabel label="Woo order id" data={subscription.gift_wooOrderId} />
          <DataLabel label="Customer note" data={subscription.customerNote} />
          <DataLabel
            label="Message to recipient"
            data={subscription.gift_messageToRecipient}
          />
        </Box>
      </Box>
    </Paper>
  );
}
