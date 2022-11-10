import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import type { SubscriptionStats } from '~/_libs/core/services/subscription-stats';

export default function SubscriptionStatsBox(props: {
  stats: SubscriptionStats;
}) {
  const { stats } = props;

  if (!stats) {
    return <Box>Stats not available</Box>;
  }

  return (
    <Box>
      <p>Active, total: {stats.totalCount}</p>

      <p>Active, monthly: {stats.monthlyCount}</p>
      <p>Active, fortnightly: {stats.fortnightlyCount}</p>

      <p>Active, ABO: {stats.subscriptionCount}</p>
      <p>Active, GABO: {stats.giftSubscriptionCount}</p>

      <p>Active, B2B: {stats.b2bSubscriptionCount}</p>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="subscription table">
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
