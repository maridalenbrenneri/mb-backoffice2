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

export default function Packing() {
  const { preview } = useLoaderData() as unknown as LoaderData;

  const [customPickUpOrders, setPickUpCustomOrders] = useState<number[]>([]);

  //  const [b2bCusomOrders, setB2bCusomOrders] = useState<number[]>([]);

  useEffect(() => {}, []);

  const resolveOrdersUri = (orderIds: number[]) =>
    `/orders?status=_all&orderIds=${orderIds.join()}`;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <Typography variant="h1">Orders selected</Typography>
          <p>Active orders ready to be packed and shipped.</p>
        </Grid>
      </Grid>
    </Box>
  );
}
