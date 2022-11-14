import { Form, Link } from '@remix-run/react';

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
import { emptyBagCounter } from '~/_libs/core/services/subscription-stats';
import { toPrettyDate } from '~/_libs/core/utils/dates';
import { getRoastOverview } from '~/_libs/core/services/roast-service';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

export default function RoastOverviewBox(props: {
  stats: SubscriptionStats;
  deliveries: Delivery[];
}) {
  const { stats, deliveries } = props;
  const [delivery, setDelivery] = useState<Delivery>(); // TODO: Resolve "NEXT" as the default selected
  const [overview, setOverview] = useState<any>();

  const notSetLabel = '[Not set]';

  useEffect(() => {
    setDelivery(deliveries[0]);
  }, [deliveries]);

  useEffect(() => {
    setOverview(getRoastOverview(emptyBagCounter()));
  }, [setOverview]);

  useEffect(() => {
    if (!delivery) return;

    const overview =
      delivery.type === 'STORABO'
        ? getRoastOverview(stats.bagCounterMonthly, delivery)
        : getRoastOverview(emptyBagCounter(), delivery);

    setOverview(overview);
  }, [delivery, stats.bagCounterMonthly]);

  if (!stats) {
    return <Box>Data not available :(</Box>;
  }

  if (!deliveries?.length)
    return (
      <Box>
        No deliveries found, please add one{' '}
        <Link to={`/delivieres/`}>here</Link>.
      </Box>
    );

  if (!overview) return null;

  const handleChange = (e: any) => {
    setDelivery(deliveries.find((c) => c.id === e.target.value) as Delivery);
  };

  // INCLUDE WOO ABO DATA IF DELIVERY TYPE IS STOR-ABO

  // INCLUDE B2B ABO DATA IF DELIVERY TYPE IS B2B-ABO // DONE IN bagCounterMonthly

  // INCLUDE SUBSCRIPTION PASSIVE ORDERS (B2B but can also be from GIFT)

  // INCLUDE WOO FORTNIGHTLY ACTIVE RE-CURRENT ORDERS AND NON-RECURRENT ORDERS

  // const weightData = resolveQuantities(stats.bagCounterMonthly, delivery);

  // const overview = getRoastOverview(stats.bagCounterMonthly);

  return (
    <Box>
      <Form method="post">
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`delivery-label`}>Delivery day</InputLabel>
          <Select
            labelId={`delivery-label`}
            name={`deliveryId`}
            defaultValue={delivery?.id || 0}
            onChange={handleChange}
            sx={{ minWidth: 250 }}
          >
            {deliveries.map((d) => (
              <MenuItem value={d.id} key={d.id}>
                {toPrettyDate(d.date)} - {d.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Form>
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
                Coffee 1 - {delivery.coffee1?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee1kg}</TableCell>
              <TableCell>{overview._250.coffee1}</TableCell>
              <TableCell>{overview._500.coffee1}</TableCell>
              <TableCell>{overview._1200.coffee1}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 2 - {delivery.coffee2?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee2kg}</TableCell>
              <TableCell>{overview._250.coffee2}</TableCell>
              <TableCell>{overview._500.coffee2}</TableCell>
              <TableCell>{overview._1200.coffee2}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 3 - {delivery.coffee3?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee3kg}</TableCell>
              <TableCell>{overview._250.coffee3}</TableCell>
              <TableCell>{overview._500.coffee3}</TableCell>
              <TableCell>{overview._1200.coffee3}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 4 - {delivery.coffee4?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee4kg}</TableCell>
              <TableCell>{overview._250.coffee4}</TableCell>
              <TableCell>{overview._500.coffee4}</TableCell>
              <TableCell>{overview._1200.coffee4}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Link to={`deliveries/admin/${delivery.id}`}>Edit coffees</Link>
    </Box>
  );
}