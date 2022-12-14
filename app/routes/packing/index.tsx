import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { completeOrders } from '~/_libs/core/services/order-service';
import { generatePreview } from '~/_libs/core/services/wizard-service';

// enum PACKING_GROUPS {
//   CUSTOM_PICKUP,
//   CUSTOM_RENEWAL,
//   CUSTOM,
//   ABO1,
//   ABO2,
// }

type LoaderData = {
  preview: Awaited<ReturnType<typeof generatePreview>>;
};

export const loader = async () => {
  const preview = await generatePreview();

  return json<LoaderData>({
    preview,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  const orderIds = values.orderIds
    .toString()
    .split(',')
    .map((s) => +s);

  return await completeOrders(orderIds);
};

export default function Packing() {
  const { preview } = useLoaderData() as unknown as LoaderData;
  const data = useActionData();
  const transition = useTransition();

  const isWorking = Boolean(transition.submission);

  const [customPickUpOrders, setPickUpCustomOrders] = useState<number[]>([]);
  const [renewalPickUpOrders, setPickUpRenewalOrders] = useState<number[]>([]);
  const [customOrders, setCustomOrders] = useState<number[]>([]);

  const [renewalABO1Orders, setRenewalABO1Orders] = useState<number[]>([]);
  const [renewalABO2Orders, setRenewalABO2Orders] = useState<number[]>([]);
  const [renewalABO3Orders, setRenewalABO3Orders] = useState<number[]>([]);
  const [renewalABO4Orders, setRenewalABO4Orders] = useState<number[]>([]);
  const [renewalABO5Orders, setRenewalABO5Orders] = useState<number[]>([]);
  const [renewalABO6Orders, setRenewalABO6Orders] = useState<number[]>([]);
  const [renewalABO7Orders, setRenewalABO7Orders] = useState<number[]>([]);

  //  const [b2bCusomOrders, setB2bCusomOrders] = useState<number[]>([]);

  useEffect(() => {
    setPickUpCustomOrders(preview.orders.privates.custom.pickUp);
    setPickUpRenewalOrders(preview.orders.privates.renewal.pickUp);
    setCustomOrders(preview.orders.privates.custom.ship);
    setRenewalABO1Orders(preview.orders.privates.renewal.ship.ABO1);
    setRenewalABO2Orders(preview.orders.privates.renewal.ship.ABO2);
    setRenewalABO3Orders(preview.orders.privates.renewal.ship.ABO3);
    setRenewalABO4Orders(preview.orders.privates.renewal.ship.ABO4);
    setRenewalABO5Orders(preview.orders.privates.renewal.ship.ABO5);
    setRenewalABO6Orders(preview.orders.privates.renewal.ship.ABO6);
    setRenewalABO7Orders(preview.orders.privates.renewal.ship.ABO7);
  }, [preview]);

  const resolveOrdersUri = (orderIds: number[]) =>
    `/orders?status=_all&orderIds=${orderIds.join()}`;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Typography variant="h1">Packing overview</Typography>
        </Grid>
        <Grid item md={12}>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="subscription table"
              size="small"
            >
              <TableBody>
                <TableRow>
                  <TableCell>Custom - local pick-up</TableCell>
                  <TableCell>
                    <small>{customPickUpOrders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!customPickUpOrders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>ABO's - local pick-up</TableCell>
                  <TableCell>
                    <small>{renewalPickUpOrders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!renewalPickUpOrders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Custom orders</TableCell>
                  <TableCell>
                    <Link to={resolveOrdersUri(customOrders)}>
                      {customOrders.length}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Form method="post">
                      <input
                        type="hidden"
                        name="orderIds"
                        value={customOrders.join()}
                      />
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!customOrders.length || isWorking}
                      >
                        {isWorking ? 'Working...' : 'Complete'}
                      </Button>
                    </Form>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>ABO1</TableCell>
                  <TableCell>
                    <small>{renewalABO1Orders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Form method="post">
                      <input
                        type="hidden"
                        name="orderIds"
                        value={renewalABO1Orders.join()}
                      />
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!renewalABO1Orders.length || isWorking}
                      >
                        {isWorking ? 'Working...' : 'Complete'}
                      </Button>
                    </Form>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ABO2</TableCell>
                  <TableCell>
                    <Link to={resolveOrdersUri(renewalABO2Orders)}>
                      {renewalABO2Orders.length}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Form method="post">
                      <input
                        type="hidden"
                        name="orderIds"
                        value={renewalABO2Orders.join()}
                      />
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!renewalABO2Orders.length || isWorking}
                      >
                        {isWorking ? 'Working...' : 'Complete'}
                      </Button>
                    </Form>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ABO3</TableCell>
                  <TableCell>
                    <small>{renewalABO3Orders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!renewalABO3Orders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ABO4</TableCell>
                  <TableCell>
                    <small>{renewalABO4Orders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!renewalABO4Orders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ABO5</TableCell>
                  <TableCell>
                    <small>{renewalABO5Orders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!renewalABO5Orders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ABO6</TableCell>
                  <TableCell>
                    <small>{renewalABO6Orders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!renewalABO6Orders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ABO7</TableCell>
                  <TableCell>
                    <small>{renewalABO7Orders.length}</small>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={!renewalABO7Orders.length || isWorking}
                    >
                      {isWorking ? 'Working...' : 'Complete'}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>
                    {preview.totalCount} orders to be packed
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item md={12}>
          {data && (
            <Box>
              <Typography variant="h2">Last result</Typography>

              <TableContainer component={Paper}>
                <Table
                  sx={{ minWidth: 650 }}
                  aria-label="subscription table"
                  size="small"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Result</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Woo id/status</TableCell>
                      <TableCell>Woo error</TableCell>
                      <TableCell>Cargonizer Print requested</TableCell>
                      <TableCell>Cargonizer Print error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.length &&
                      data.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{row.result}</TableCell>
                          <TableCell>{row.orderId}</TableCell>
                          <TableCell>
                            {row.wooOrderId || ''} {row.wooOrderStatus || ''}
                          </TableCell>
                          <TableCell>{row.wooError}</TableCell>
                          <TableCell>
                            {row.printRequested ? 'Yes' : 'No'}
                          </TableCell>
                          <TableCell>{row.printError}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
