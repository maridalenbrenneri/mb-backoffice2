import { Box, Button } from '@mui/material';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { OnboardingWizardSession } from '~/sessions/wizard-session.server';
import { getMaybeWizardSession } from '~/sessions/wizard-session.server';
import { commitWizardSession } from '~/sessions/wizard-session.server';
import type { WizardPreviewGroup } from '~/_libs/core/services/wizard-service';
import type { OnboardingWizardHandle } from '../step';

const STEP = 4;

export const handle: OnboardingWizardHandle = {
  key: 'onboarding',
  title: 'Renewal orders with local pick-up',
  stepNumber: STEP,
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

  const [renewalOrders, setRenewalOrders] = useState<number[]>([]);

  useEffect(() => {
    setRenewalOrders(preview.orders.privates.renewal.pickUp);
  }, [preview]);

  return (
    <Box>
      <p>
        These will be be completed but not sent to Cargonizer. Don't forget
        their names on the tape!
      </p>

      <div>
        {renewalOrders.length} subscription renewal orders with local pick up to
        be packed
      </div>

      <Button variant="contained" disabled={!renewalOrders.length}>
        Complete orders
      </Button>

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
