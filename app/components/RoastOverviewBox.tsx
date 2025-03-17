import { Form, Link } from '@remix-run/react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { toPrettyDateText } from '~/_libs/core/utils/dates';

import {
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TableFooter,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { roundTotalKg } from '~/_libs/core/utils/numbers';
import { deliveryDayTypeToLabel } from '~/_libs/core/utils/labels';
import { getNextDeliveryFromList } from '~/_services/delivery/delivery.utils';
import { DeliveryEntity } from '~/_services/delivery/delivery.entity';
import { SubscriptionEntity } from '~/_services/subscription/subscription-entity';
import { ProductEntity } from '~/_services/product/product.entity';
import { RoastService } from '~/_services/roast-service';

export default function RoastOverviewBox(props: {
  subscriptions: SubscriptionEntity[];
  deliveries: DeliveryEntity[];
  coffees: ProductEntity[];
}) {
  const { subscriptions, deliveries, coffees } = props;
  const [delivery, setDelivery] = useState<DeliveryEntity>();
  const [overview, setOverview] = useState<any>();

  const notSetLabel = '[Not set]';

  useEffect(() => {
    const delivery = getNextDeliveryFromList(deliveries);
    setDelivery(delivery || deliveries[0]);
  }, [deliveries]);

  useEffect(() => {
    if (!delivery) return;

    const overview = RoastService.getRoastOverview(
      subscriptions,
      delivery,
      coffees
    );

    setOverview(overview);
  }, [delivery, coffees, subscriptions]);

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
    setDelivery(
      deliveries.find((c) => c.id === e.target.value) as DeliveryEntity
    );
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="roast overview table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Form method="post">
                  <FormControl sx={{ m: 1 }}>
                    <FormGroup>
                      <InputLabel id={`delivery-label`}>
                        Delivery day
                      </InputLabel>
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
                            {toPrettyDateText(d.date)} -{' '}
                            {deliveryDayTypeToLabel(d.type)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormGroup>
                  </FormControl>
                </Form>
              </TableCell>
              <TableCell colSpan={4} style={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ m: 3, marginBottom: 0 }}>
                  {roundTotalKg(overview.totalKg)}
                </Typography>
                <Typography variant="subtitle2">kg in total</Typography>
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
                Coffee 1 - {delivery.product1?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee1kg}</TableCell>
              <TableCell>{overview._250.coffee1}</TableCell>
              <TableCell>{overview._500.coffee1}</TableCell>
              <TableCell>{overview._1200.coffee1}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 2 - {delivery.product2?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee2kg}</TableCell>
              <TableCell>{overview._250.coffee2}</TableCell>
              <TableCell>{overview._500.coffee2}</TableCell>
              <TableCell>{overview._1200.coffee2}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 3 - {delivery.product3?.productCode || notSetLabel}
              </TableCell>
              <TableCell>{overview.coffee3kg}</TableCell>
              <TableCell>{overview._250.coffee3}</TableCell>
              <TableCell>{overview._500.coffee3}</TableCell>
              <TableCell>{overview._1200.coffee3}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Coffee 4 - {delivery.product4?.productCode || notSetLabel}
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
                    Coffees from active custom orders not set on the Delivery
                    day
                  </strong>
                </TableCell>
              </TableRow>
            )}
            {overview.notSetOnDelivery.map((i: any) => (
              <TableRow key={i.coffeeId}>
                <TableCell>{i.productCode}</TableCell>
                <TableCell>{i.totalKg}</TableCell>
                <TableCell>{i._250}</TableCell>
                <TableCell>{i._500}</TableCell>
                <TableCell>{i._1200}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <big>
                  <Link to={`deliveries/admin/${delivery.id}`}>
                    Edit coffees for Delivery day / View orders
                  </Link>
                </big>
              </TableCell>
              <TableCell>
                <big>
                  Includes {overview.includedOrderCount} orders and{' '}
                  {overview.includedSubscriptionCount} estimated renewals from
                  subscriptions.
                </big>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
