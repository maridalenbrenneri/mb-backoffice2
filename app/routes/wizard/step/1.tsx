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
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { OnboardingWizardSession } from '~/sessions/wizard-session.server';
import { getMaybeWizardSession } from '~/sessions/wizard-session.server';
import { commitWizardSession } from '~/sessions/wizard-session.server';
import type { WizardPreviewGroup } from '~/_libs/core/services/wizard-service';
import type { OnboardingWizardHandle } from '../step';

const STEP = 1;

export const handle: OnboardingWizardHandle = {
  key: 'onboarding',
  title: 'Overview of active orders',
  stepNumber: 1,
  submitButton: (
    <Button type="submit" form={`step-${STEP}`} variant="contained">
      Next to step {STEP + 1}
    </Button>
  ),
};

export function meta() {
  return {
    title: `Step ${handle.stepNumber} | ${handle.title}}`,
  };
}

export async function loader({ request }: LoaderArgs) {
  const onboardingWizardSession =
    await getMaybeWizardSession<OnboardingWizardSession>(request);

  return json(onboardingWizardSession);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const { favoriteFruit, nextStep } = Object.fromEntries(formData) as Pick<
    OnboardingWizardSession,
    'favoriteFruit'
  > & {
    nextStep: string;
  };

  return redirect(`wizard/step/${nextStep}`, {
    headers: {
      'Set-Cookie': await commitWizardSession(request, { favoriteFruit }),
    },
  });
}

export default function WizardStep1Screen() {
  const preview = useOutletContext() as WizardPreviewGroup;

  const [customPickUpOrders, setPickUpCustomOrders] = useState<number[]>([]);
  const [renewalPickUpOrders, setPickUpRenewalOrders] = useState<number[]>([]);
  const [customOrders, setCustomOrders] = useState<number[]>([]);

  const [renewalABO1Orders, setRenewalABO1Orders] = useState<number[]>([]);
  const [renewalABO2Orders, setRenewalABO2Orders] = useState<number[]>([]);

  //  const [b2bCusomOrders, setB2bCusomOrders] = useState<number[]>([]);

  useEffect(() => {
    setPickUpCustomOrders(preview.orders.privates.custom.pickUp);
    setPickUpRenewalOrders(preview.orders.privates.renewal.pickUp);
    setCustomOrders(preview.orders.privates.custom.pickUp);
    setRenewalABO1Orders(preview.orders.privates.renewal.ship.ABO1);
    setRenewalABO2Orders(preview.orders.privates.renewal.ship.ABO2);
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
              <TableCell>Pick up, custom</TableCell>
              <TableCell>
                <small>{customPickUpOrders.length}</small>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Pick up, renewal</TableCell>
              <TableCell>
                <small>{renewalPickUpOrders.length}</small>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Ship, custom</TableCell>
              <TableCell>
                <small>{customOrders.length}</small>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Ship, ABO1</TableCell>
              <TableCell>
                <small>{renewalABO1Orders.length}</small>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ship, ABO2</TableCell>
              <TableCell>
                <small>{renewalABO2Orders.length}</small>
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
        id={`step-${STEP}`}
        method="post"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <input type="hidden" name="nextStep" value={STEP + 1} />
      </Form>
    </Box>
  );
}
