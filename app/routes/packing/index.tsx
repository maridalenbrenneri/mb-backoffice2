import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableRow,
} from '@mui/material';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { completeOrders } from '~/_libs/core/services/order-service';
import { generatePreview } from '~/_libs/core/services/wizard-service';

type LoaderData = {
  preview: Awaited<ReturnType<typeof generatePreview>>;
};

export const loader = async ({ request }) => {
  const preview = await generatePreview();

  return json<LoaderData>({
    preview,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  console.log('VALUES', values);

  const orderIds = values.orderIds
    .toString()
    .split(',')
    .map((s) => +s);

  return await completeOrders(orderIds);
};

export default function Packing() {
  const { preview } = useLoaderData() as unknown as LoaderData;

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

  console.table(preview);

  return (
    <Box>
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
                  disabled={!customPickUpOrders.length}
                >
                  Complete
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
                  disabled={!renewalPickUpOrders.length}
                >
                  Complete
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Custom orders</TableCell>
              <TableCell>
                <small>{customOrders.length}</small>
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
                    disabled={!customOrders.length}
                  >
                    Complete
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
                    disabled={!renewalABO1Orders.length}
                  >
                    Complete
                  </Button>
                </Form>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ABO2</TableCell>
              <TableCell>
                <small>{renewalABO2Orders.length}</small>
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
                    disabled={!renewalABO2Orders.length}
                  >
                    Complete
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
                  disabled={!renewalABO3Orders.length}
                >
                  Complete
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
                  disabled={!renewalABO4Orders.length}
                >
                  Complete
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>{preview.totalCount} orders to be packed</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Form
        id={`step-${1}`}
        method="post"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <input type="hidden" name="nextStep" value={1 + 1} />
      </Form>
    </Box>
  );
}
