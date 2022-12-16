import { Box, Typography } from '@mui/material';

import { toPrettyDateTime } from '~/_libs/core/utils/dates';
import DataLabel from './DataLabel';

export default function JobsInfoBox(props: {
  subscriptions: any;
  orders: any;
  gaboStatus: any;
}) {
  const { subscriptions, orders, gaboStatus } = props;

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="subtitle1">Scheduled jobs (last run)</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel
          label="Woo import, orders"
          data={toPrettyDateTime(orders?.createdAt, true) || 'Not available'}
        />

        <DataLabel
          label="Woo import, subscriptions"
          data={
            toPrettyDateTime(subscriptions?.createdAt, true) || 'Not available'
          }
        />

        <DataLabel
          label="Update GABO status"
          data={
            toPrettyDateTime(gaboStatus?.createdAt, true) || 'Not available'
          }
        />
      </Box>
    </Box>
  );
}
