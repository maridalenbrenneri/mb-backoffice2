import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Grid, Typography } from '@mui/material';

import type { SubscriptionStats } from '~/services/subscription-stats.service';
import DataLabel from './DataLabel';

export default function SubscriptionStatsBox(props: {
  stats: SubscriptionStats;
}) {
  const { stats } = props;

  if (!stats) {
    return null;
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={6} style={{ textAlign: 'center' }}>
          <Paper sx={{ p: 1, paddingBottom: 3.5 }}>
            <Typography variant="h2" sx={{ m: 3, marginBottom: 0 }}>
              {stats.totalCount}
            </Typography>
            <Typography variant="subtitle2">active subscriptions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <DataLabel
              dataFields={[
                {
                  label: 'ABO, monthly',
                  data: stats.privateActiveMonthlyCount || 0,
                },
                {
                  label: 'ABO, fortnightly',
                  data: stats.privateActiveFortnigthlyCount || 0,
                },
                {
                  label: 'GABO, monthly',
                  data: stats.privateGiftActiveMonthlyCount || 0,
                },
                {
                  label: 'B2B, monthly',
                  data: stats.b2bMonthlySubscriptionCount || 0,
                },
                {
                  label: 'B2B, twice a month',
                  data: stats.b2bFortnightlySubscriptionCount || 0,
                },
              ]}
            />
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mx: 1 }}>
        Bag distribution <small>(B2B not included)</small>
      </Typography>

      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650 }}
          aria-label="subscription table"
          size="small"
        >
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>1</TableCell>
              <TableCell>2</TableCell>
              <TableCell>3</TableCell>
              <TableCell>4</TableCell>
              <TableCell>5</TableCell>
              <TableCell>6</TableCell>
              <TableCell>7</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>Monthly</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.one}</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.two}</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.three}</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.four}</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.five}</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.six}</TableCell>
              <TableCell>{stats.bagCounterMonthly._250.seven}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fortnightly</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.one}</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.two}</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.three}</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.four}</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.five}</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.six}</TableCell>
              <TableCell>{stats.bagCounterFortnightly._250.seven}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
