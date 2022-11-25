import { Box, Button } from '@mui/material';
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

export const handle: OnboardingWizardHandle = {
  key: 'onboarding',
  title: 'Orders with local pick-up',
  stepNumber: 1,
  submitButton: (
    <Button type="submit" form="step-1" variant="contained">
      Next to step 2
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
  const data = useLoaderData<typeof loader>();
  const preview = useOutletContext() as WizardPreviewGroup;

  const [orders, setOrders] = useState<number[]>([]);
  const [renewalOrders, setRenewalOrders] = useState<number[]>([]);

  useEffect(() => {
    setOrders(preview.orders.privates.custom.pickUp);
    setRenewalOrders(preview.orders.privates.renewal.pickUp);
  }, [preview]);

  console.log(preview);

  return (
    <Box>
      <p>
        Let's start with orders with local pick-up. These will be be completed
        but not sent to Cargonizer. Don't forget their names on the tape!
      </p>

      <div>{orders.length} custom orders to be packed</div>

      <Button variant="contained" disabled={!orders.length}>
        Complete orders
      </Button>

      <p></p>

      <div>{renewalOrders.length} subscription renewal orders to be packed</div>

      <Button variant="contained" disabled={!renewalOrders.length}>
        Complete orders
      </Button>

      <Form
        id="step-1"
        method="post"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* <label>
          Favorite fruit :
          <input
            type="text"
            name="favoriteFruit"
            defaultValue={data?.favoriteFruit}
          />
        </label> */}

        <input type="hidden" name="nextStep" value="2" />
      </Form>
    </Box>
  );
}
