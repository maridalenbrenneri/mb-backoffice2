import { Alert, Box, Typography } from '@mui/material';

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
    <Alert severity="info" icon={false}>
      <Typography>Woo GABO data</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel
          dataFields={[
            {
              label: 'First delivery',
              data: toPrettyDate(subscription.gift_firstDeliveryDate),
            },
            {
              label: 'Months',
              data: subscription.gift_durationMonths,
            },
            {
              label: 'Customer',
              data: subscription.gift_wooCustomerName,
            },
            {
              label: 'Woo order id',
              data: subscription.gift_wooOrderId,
            },
            {
              label: 'Customer note',
              data: subscription.customerNote,
            },
            {
              label: 'Message to recipient',
              data: subscription.gift_messageToRecipient,
            },
          ]}
        />
      </Box>
    </Alert>
  );
}
