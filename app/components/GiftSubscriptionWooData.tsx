import { Alert, Box, Typography } from '@mui/material';

import type { Subscription } from '@prisma/client';
import { SubscriptionType } from '@prisma/client';

import { toPrettyDate, toPrettyDateTime } from '~/_libs/core/utils/dates';
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
              label: 'Customer requested first delivery date',
              data: toPrettyDate(subscription.gift_customerFirstDeliveryDate),
            },
            {
              label: 'System resolved actual first delivery day',
              data: toPrettyDate(subscription.gift_firstDeliveryDate),
            },
            {
              label: 'Months',
              data: subscription.gift_durationMonths,
            },
            {
              label: 'Customer',
              data: subscription.wooCustomerName,
            },
            {
              label: 'Woo customer id',
              data: subscription.wooCustomerId,
            },
            {
              label: 'Customer note',
              data: subscription.customerNote,
            },
            {
              label: 'Message to recipient',
              data: subscription.gift_messageToRecipient,
            },
            {
              label: 'Woo order id',
              data: subscription.gift_wooOrderId,
            },
            {
              label: 'Woo order created at',
              data: toPrettyDateTime(subscription.wooCreatedAt),
            },
          ]}
        />
      </Box>
    </Alert>
  );
}
