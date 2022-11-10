import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import type { Delivery } from '@prisma/client';

import type { SubscriptionStats } from '~/_libs/core/services/subscription-stats';
import { toPrettyDate } from '~/_libs/core/utils/dates';
import { getRoastOverview } from '~/_libs/core/services/roast-service';

export default function RoastOverviewBox(props: {
  stats: SubscriptionStats;
  delivery: Delivery;
}) {
  const { stats, delivery } = props;

  const notSetLabel = '[Not set]';

  if (!stats) {
    return <Box>Data not available</Box>;
  }

  // INCLUDE WOO ABO DATA IF DELIVERY TYPE IS STOR-ABO

  // INCLUDE B2B ABO DATA IF DELIVERY TYPE IS B2B-ABO ?

  // INCLUDE B2B PASSIVE ORDERS

  // INCLUDE WOO FORTNIGHTLY ACTIVE RE-CURRENT ORDERS AND NON-RECURRENT ORDERS

  // const weightData = resolveQuantities(stats.bagCounterMonthly, delivery);

  const overview = getRoastOverview(stats.bagCounterMonthly);

  return (
    <Box>
      <p>
        Delivery day: {toPrettyDate(delivery.date)} {delivery.type}
      </p>
      <p>Total weight, kg: {overview.totalKg}</p>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="roast overview table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Total (kg)</TableCell>
              <TableCell>250</TableCell>
              <TableCell>500</TableCell>
              <TableCell>1200</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                Coffee 1 - {delivery.coffee1.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee1kg}</TableCell>
              <TableCell>{overview._250.coffee1}</TableCell>
              <TableCell>{overview._500.coffee1}</TableCell>
              <TableCell>{overview._1200.coffee1}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 2 - {delivery.coffee2.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee2kg}</TableCell>
              <TableCell>{overview._250.coffee2}</TableCell>
              <TableCell>{overview._500.coffee2}</TableCell>
              <TableCell>{overview._1200.coffee2}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 3 - {delivery.coffee3.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee3kg}</TableCell>
              <TableCell>{overview._250.coffee3}</TableCell>
              <TableCell>{overview._500.coffee3}</TableCell>
              <TableCell>{overview._1200.coffee3}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 4 - {delivery.coffee4.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee4kg}</TableCell>
              <TableCell>{overview._250.coffee4}</TableCell>
              <TableCell>{overview._500.coffee4}</TableCell>
              <TableCell>{overview._1200.coffee4}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
