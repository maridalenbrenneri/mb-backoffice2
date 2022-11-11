import { Box, Typography, Paper } from '@mui/material';

import type { Subscription } from '@prisma/client';
import { SubscriptionType } from '@prisma/client';

import { toPrettyDate } from '~/_libs/core/utils/dates';

export default function GiftSubscriptionWooData(props: {
  subscription: Subscription;
}) {
  const { subscription } = props;

  if (subscription.type !== SubscriptionType.PRIVATE_GIFT) {
    return <Box sx={{ my: 4 }}>Not a gift subscription.</Box>;
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Typography variant="h5">
        Data from Woo Gift Subscription Order
      </Typography>
      <Box sx={{ m: 2 }}>
        First delivery: {toPrettyDate(subscription.gift_firstDeliveryDate)}
        <br></br>
        Deliveries: {subscription.gift_durationMonths} <br></br>
        Customer: {subscription.gift_wooCustomerName} <br></br>
        Woo order id: {subscription.gift_wooOrderId} <br></br>
        Customer note: {subscription.customerNote}
        <br></br>
        Message to recipient: {subscription.gift_messageToRecipient}
      </Box>
    </Paper>
  );
}
