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
          data={toPrettyDateTime(orders?.createdAt) || 'Not available'}
        />

        <DataLabel
          label="Woo import, subscription stats"
          data={toPrettyDateTime(subscriptions?.createdAt) || 'Not available'}
        />

        <DataLabel
          label="Update GABO status"
          data={toPrettyDateTime(gaboStatus?.createdAt) || 'Not available'}
        />
      </Box>
    </Box>
  );
}
