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
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableFooter,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getNextDeliveryFromList } from '~/_libs/core/services/delivery-service';

export default function RoastOverviewBox(props: {
  stats: SubscriptionStats;
  deliveries: Delivery[];
}) {
  const { stats, deliveries } = props;
  const [delivery, setDelivery] = useState<Delivery>();
  const [overview, setOverview] = useState<any>();

  const notSetLabel = '[Not set]';

  useEffect(() => {
    const delivery = getNextDeliveryFromList(deliveries);
    setDelivery(delivery || deliveries[0]);
  }, [deliveries]);

  useEffect(() => {
    setOverview(getRoastOverview(emptyBagCounter()));
  }, [setOverview]);

  useEffect(() => {
    if (!delivery) return;

    const resolve = () => {
      if (delivery.type === 'MONTHLY')
        return getRoastOverview(stats.bagCounterMonthly, delivery);
      if (delivery.type === 'MONTHLY_3RD')
        return getRoastOverview(stats.bagCounterMonthly3rd, delivery);

      return getRoastOverview(emptyBagCounter(), delivery);
    };

    const overview = resolve();

    setOverview(overview);
  }, [delivery, stats.bagCounterMonthly, stats.bagCounterMonthly3rd]);

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

  if (!delivery) return null;
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="roast overview table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Form method="post">
                  <FormControl sx={{ m: 1 }}>
                    <InputLabel id={`delivery-label`}>Delivery day</InputLabel>
                    <Select
                      labelId={`delivery-label`}
                      name={`deliveryId`}
                      defaultValue={delivery?.id || 0}
                      onChange={handleChange}
                      sx={{ minWidth: 250 }}
                      size="small"
                    >
                      {deliveries.map((d) => (
                        <MenuItem value={d.id} key={d.id}>
                          {toPrettyDate(d.date)} - {d.type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl></FormControl>
                </Form>
              </TableCell>
              <TableCell colSpan={4}>
                Total <big>{overview.totalKg}</big>kg
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Total (kg)</TableCell>
              <TableCell>250g</TableCell>
              <TableCell>500g</TableCell>
              <TableCell>1,2kg</TableCell>
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

            {overview.notSetOnDelivery.length > 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <strong>
                    Coffees in active orders not set on the Delivery
                  </strong>
                </TableCell>
              </TableRow>
            )}
            {overview.notSetOnDelivery.map((i: any) => (
              <TableRow key={i.coffeeId}>
                <TableCell>{i.coffeeId}</TableCell>
                <TableCell>{i.totalKg}</TableCell>
                <TableCell>{i._250}</TableCell>
                <TableCell>{i._500}</TableCell>
                <TableCell>{i._1200}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <big>
                  <Link to={`deliveries/admin/${delivery.id}`}>
                    Edit coffees for Delivery / View orders
                  </Link>
                </big>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
