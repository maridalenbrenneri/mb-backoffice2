import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { useEffect, useState } from 'react';

import type { Delivery, Order } from '@prisma/client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DoneIcon from '@mui/icons-material/Done';

import { completeAndShipOrders } from '~/_libs/core/services/order-service';
import { generatePreview } from '~/_libs/core/services/packing-service';
import Orders from '../../components/Orders';
import { COMPLETE_ORDERS_BATCH_MAX } from '~/_libs/core/settings';
import { modalStyle } from '~/style/theme';
import { getDeliveries } from '~/_libs/core/repositories/delivery.server';
import { getNextOrCreateDelivery } from '~/_libs/core/services/delivery-service';
import { toPrettyDateText } from '~/_libs/core/utils/dates';
import { deliveryDayTypeToLabel } from '~/_libs/core/utils/labels';
import CompleteAndShipResultBox from '~/components/CompleteAndShipResultBox';

type LoaderData = {
  preview: Awaited<ReturnType<typeof generatePreview>>;
  currentDeliveries: Awaited<ReturnType<typeof getDeliveries>>;
  selectedDelivery: Delivery;
};

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  const deliveryId = search.get('deliveryId');

  const currentDeliveries = await getDeliveries({
    select: {
      id: true,
      date: true,
      type: true,
    },
    orderBy: { date: 'desc' },
    take: 10,
  });

  const selectedDelivery = deliveryId
    ? currentDeliveries.find((d) => d.id === +deliveryId)
    : await getNextOrCreateDelivery();

  if (!selectedDelivery) throw new Error("Couldn't resolve Delivery day");

  const deliveries = currentDeliveries.filter(
    (d) => d.date <= selectedDelivery.date
  );
  const preview = await generatePreview(deliveries.map((d) => d.id));

  return json<LoaderData>({
    preview,
    currentDeliveries,
    selectedDelivery,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...values } = Object.fromEntries(formData);

  const allOrderIds: number[] = values.orderIds
    .toString()
    .split(',')
    .map((s) => +s);

  const orderIds =
    allOrderIds.length > COMPLETE_ORDERS_BATCH_MAX
      ? allOrderIds.slice(0, COMPLETE_ORDERS_BATCH_MAX)
      : allOrderIds;

  return await completeAndShipOrders(orderIds);
};

export default function Packing() {
  const { preview, currentDeliveries, selectedDelivery } =
    useLoaderData() as unknown as LoaderData;
  const data = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isWorking = Boolean(navigation.state === 'submitting');
  const [delivery, setDelivery] = useState<Delivery>();
  const [deliveries, setDeliveries] = useState<Delivery[]>();
  const [resultData, setResultData] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [open, setOpen] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [specialRequestOrders, setSpecialRequestOrders] = useState<Order[]>([]);
  const [customPickUpOrders, setPickUpCustomOrders] = useState<Order[]>([]);
  const [renewalPickUpOrders, setPickUpRenewalOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<Order[]>([]);
  const [renewalABO1Orders, setRenewalABO1Orders] = useState<Order[]>([]);
  const [renewalABO2Orders, setRenewalABO2Orders] = useState<Order[]>([]);
  const [renewalABO3Orders, setRenewalABO3Orders] = useState<Order[]>([]);
  const [renewalABO4Orders, setRenewalABO4Orders] = useState<Order[]>([]);
  const [renewalABO5Orders, setRenewalABO5Orders] = useState<Order[]>([]);
  const [renewalABO6Orders, setRenewalABO6Orders] = useState<Order[]>([]);
  const [renewalABO7Orders, setRenewalABO7Orders] = useState<Order[]>([]);

  const [b2bCustomPickUpOrders, setB2bPickUpCustomOrders] = useState<Order[]>(
    []
  );
  const [b2bRenewalPickUpOrders, setB2bPickUpRenewalOrders] = useState<Order[]>(
    []
  );
  const [b2bCustomOrders, setB2bCustomOrders] = useState<Order[]>([]);
  const [b2bRenewalOrders, setB2bRenewalOrders] = useState<Order[]>([]);

  const [staffOrders, setStaffOrders] = useState<Order[]>([]);

  useEffect(() => {
    setAllOrders(preview.orders.all);
    setSpecialRequestOrders(preview.orders.allSpecialRequets);

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

    setB2bPickUpCustomOrders(preview.orders.b2bs.custom.pickUp);
    setB2bPickUpRenewalOrders(preview.orders.b2bs.renewal.pickUp);
    setB2bCustomOrders(preview.orders.b2bs.custom.ship);
    setB2bRenewalOrders(preview.orders.b2bs.renewal.ship);

    setStaffOrders(preview.orders.staff.all);
  }, [preview]);

  useEffect(() => {
    setDeliveries(currentDeliveries);
  }, [currentDeliveries]);

  useEffect(() => {
    setDelivery(selectedDelivery);
  }, [selectedDelivery]);

  useEffect(() => {
    setResultData(data);
  }, [data]);

  if (!preview || !deliveries || !delivery) return null;

  const handleOpen = (orders: Order[]) => {
    setCurrentOrders(orders);
    setOpen(true);
  };

  const handleClose = (_event: any, reason: string) => {
    if (reason === 'closeBtnClick') {
      setResultData(null);
      setCurrentOrders([]);
      setOpen(false);
    }
  };

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleSelectDelivery = (e: any) => {
    setDelivery(e.target.value);
    submit(
      {
        deliveryId: e.target.value,
      },
      { replace: true }
    );
  };

  const completingText = () => {
    if (currentOrders.length >= COMPLETE_ORDERS_BATCH_MAX) {
      return `Completing ${COMPLETE_ORDERS_BATCH_MAX} of ${currentOrders.length} orders...`;
    }

    return `Completing ${currentOrders.length} order(s)...`;
  };

  const renderAccordian = (
    title: string,
    orders: Order[],
    ship: boolean = true,
    isB2B: boolean = false,
    isAll: boolean = false,
    isAllSpecialRequest: boolean = false
  ) => {
    const extraFields = isB2B ? ['fiken'] : [];
    extraFields.push('source');
    extraFields.push('delivery');
    extraFields.push('shipping');
    extraFields.push('specialRequest');
    return (
      <>
        <Accordion expanded={expanded === title} onChange={handleChange(title)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ width: '25%', flexShrink: 0 }}>
              {title}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {orders.length} <small>order(s)</small>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container>
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <Form method="post">
                  <input
                    type="hidden"
                    name="orderIds"
                    value={orders.map((o) => o.id).join()}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!orders.length || isWorking}
                    onClick={() => handleOpen(orders)}
                    sx={{ marginBottom: 2, minWidth: 200 }}
                  >
                    {ship && <LocalShippingIcon />}
                    {!ship && <DoneIcon />}

                    {isWorking && (
                      <Typography sx={{ m: 1 }}>Completing...</Typography>
                    )}
                    {!isWorking && (
                      <Typography sx={{ m: 1 }}>Complete</Typography>
                    )}
                  </Button>
                </Form>
                {isB2B && (
                  <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <Alert
                      severity="info"
                      sx={{
                        marginBottom: 1,
                        p: 1,
                        '& .MuiAlert-message': {
                          textAlign: 'center',
                          width: 'inherit',
                        },
                      }}
                    >
                      <Grid item xs={12} style={{ textAlign: 'center' }}>
                        Remember to create invoice/delivery note in Fiken for
                        these orders.
                      </Grid>
                    </Alert>
                  </Grid>
                )}
                {isAll && (
                  <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <Alert
                      severity="info"
                      sx={{
                        marginBottom: 1,
                        p: 1,
                        '& .MuiAlert-message': {
                          textAlign: 'center',
                          width: 'inherit',
                        },
                      }}
                    >
                      <Grid item xs={12} style={{ textAlign: 'center' }}>
                        This will complete all active orders, remember
                        invoice/delivery note for any B2B orders and handling of
                        orders with local pick-up.
                      </Grid>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Grid>
            {!!orders.length && (
              <Orders orders={orders} extraFields={extraFields} />
            )}
          </AccordionDetails>
        </Accordion>
      </>
    );
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Typography variant="h1">Packing & Shipping</Typography>
          <p>
            Active orders ready to be packed and shipped, grouped by
            packing/shipping type.
          </p>
          <Paper sx={{ m: 2, px: 2, py: 1 }}>
            <Form method="post">
              <FormControl>
                <InputLabel id={`status-label`}>Delivery day</InputLabel>
                <Select
                  labelId={`delivery-label`}
                  name={`deliveryId`}
                  defaultValue={delivery?.id || 0}
                  onChange={handleSelectDelivery}
                  sx={{ minWidth: 250 }}
                  size="small"
                >
                  {deliveries &&
                    deliveries.map((d) => (
                      <MenuItem value={d.id} key={d.id}>
                        {toPrettyDateText(d.date)} -{' '}
                        {deliveryDayTypeToLabel(d.type)}
                      </MenuItem>
                    ))}
                </Select>
                <small>
                  Any active orders on the selected and past Delivery days are
                  included.
                </small>
              </FormControl>
              <div>
                <FormControl sx={{ marginTop: 1.5 }}>
                  <small>
                    Max orders sent in complete-batch:{' '}
                    <strong>{COMPLETE_ORDERS_BATCH_MAX}</strong>
                  </small>
                </FormControl>
              </div>
            </Form>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          {renderAccordian(`ALL active orders`, allOrders, true, false, true)}
          <div style={{ marginTop: 20 }}></div>
          {renderAccordian(
            `Orders with special request`,
            specialRequestOrders,
            true,
            false,
            false,
            true
          )}
          <div style={{ marginTop: 20 }}></div>
          {renderAccordian(`Custom - local pick-up`, customPickUpOrders, false)}
          {renderAccordian(`ABO's - local pick-up`, renewalPickUpOrders, false)}
          {renderAccordian(`Custom`, customOrders)}
          {renderAccordian(`ABO1`, renewalABO1Orders)}
          {renderAccordian(`ABO2`, renewalABO2Orders)}
          {renderAccordian(`ABO3`, renewalABO3Orders)}
          {renderAccordian(`ABO4`, renewalABO4Orders)}
          {renderAccordian(`ABO5`, renewalABO5Orders)}
          {renderAccordian(`ABO6`, renewalABO6Orders)}
          {renderAccordian(`ABO7`, renewalABO7Orders)}

          {renderAccordian(
            `B2B Custom - local pick-up`,
            b2bCustomPickUpOrders,
            false,
            true
          )}
          {renderAccordian(
            `B2B ABO - local pick-up`,
            b2bRenewalPickUpOrders,
            false,
            true
          )}
          {renderAccordian(`B2B Custom`, b2bCustomOrders)}
          {renderAccordian(`B2B ABO`, b2bRenewalOrders)}

          <div style={{ marginTop: 20 }}></div>
          {renderAccordian(`Personalen!`, staffOrders)}
        </Grid>
        <Grid item md={12}></Grid>
      </Grid>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth={true}
          maxWidth={'xl'}
        >
          <Box sx={modalStyle}>
            {!resultData && (
              <Grid container>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <CircularProgress color="primary" />
                  <Typography>{completingText()}</Typography>
                  <p>
                    <small>This can take a while if many orders.</small>
                  </p>
                </Grid>
              </Grid>
            )}
            {resultData && (
              <Box>
                <CompleteAndShipResultBox result={resultData} />

                <Grid container>
                  <Grid item xs={4} style={{ textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      onClick={() => handleClose(null, 'closeBtnClick')}
                      sx={{ m: 2, marginTop: 4 }}
                    >
                      Close
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Dialog>
      </div>
    </Box>
  );
}
