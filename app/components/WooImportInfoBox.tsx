import { Box, Typography } from '@mui/material';

import { toPrettyDateTime } from '~/_libs/core/utils/dates';
import DataLabel from './DataLabel';

export default function WooImportInfoBox(props: { wooImportResult: any }) {
  const { wooImportResult } = props;

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="subtitle1">Woo Import</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel
          label="Last imported"
          data={toPrettyDateTime(wooImportResult?.createdAt) || 'Not available'}
        />
      </Box>
    </Box>
  );
}
