import { Box, Typography } from '@mui/material';

import { toPrettyDateTime } from '~/_libs/core/utils/dates';
import DataLabel from './DataLabel';

export default function WooImportInfoBox(props: {
  subscriptions: any;
  orders: any;
}) {
  const { subscriptions, orders } = props;

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="subtitle1">Woo, last imported</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel
          label="Subscriptions"
          data={toPrettyDateTime(subscriptions?.createdAt) || 'Not available'}
        />
        <DataLabel
          label="Orders"
          data={toPrettyDateTime(orders?.createdAt) || 'Not available'}
        />
      </Box>
    </Box>
  );
}
