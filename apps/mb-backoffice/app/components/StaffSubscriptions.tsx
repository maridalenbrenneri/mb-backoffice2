import { Box, Typography } from '@mui/material';

import DataLabel from './DataLabel';

export default function StaffSubscriptions() {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="subtitle1">Staff subscriptions</Typography>
      <Box sx={{ m: 1 }}>
        <DataLabel
          dataFields={[
            {
              label: 'Audun',
              data: '194466',
              dataLinkUrl: '/subscriptions/admin/194466',
            },
            {
              label: 'Björn',
              data: '7473',
              dataLinkUrl: '/subscriptions/admin/7473',
            },
            {
              label: 'Jørgen',
              data: '194506',
              dataLinkUrl: '/subscriptions/admin/194506',
            },
            {
              label: 'Petter',
              data: '194508',
              dataLinkUrl: '/subscriptions/admin/194508',
            },
            {
              label: 'Reiar',
              data: '194507',
              dataLinkUrl: '/subscriptions/admin/194507',
            },
          ]}
        />
      </Box>
    </Box>
  );
}
