import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useOutletContext } from '@remix-run/react';
import { useState, useEffect } from 'react';

import { Box, Button } from '@mui/material';

import type { OnboardingWizardSession } from '~/sessions/wizard-session.server';
import { getMaybeWizardSession } from '~/sessions/wizard-session.server';
import { commitWizardSession } from '~/sessions/wizard-session.server';
import { assertReferer } from '~/utils/assert-referer.server';
import type { WizardPreviewGroup } from '~/_libs/core/services/wizard-service';
import type { OnboardingWizardHandle } from '../step';

const STEP = 8;

export const handle: OnboardingWizardHandle = {
  key: 'onboarding',
  title: 'B2B renewal orders, print label and ship',
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
  assertReferer(request, { redirectTo: '/wizard' });

  const onboardingWizardSession =
    await getMaybeWizardSession<OnboardingWizardSession>(request);

  return json(onboardingWizardSession);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const { favoriteColor, nextStep } = Object.fromEntries(formData) as Pick<
    OnboardingWizardSession,
    'favoriteColor'
  > & {
    nextStep: string;
  };

  return redirect(`wizard/step/${nextStep}`, {
    headers: {
      'Set-Cookie': await commitWizardSession(request, { favoriteColor }),
    },
  });
}

export default function WizardStep2Screen() {
  const preview = useOutletContext() as WizardPreviewGroup;
  const [orders, setOrders] = useState<number[]>([]);

  useEffect(() => {
    setOrders(preview.orders.privates.renewal.ship);
  }, [preview]);

  return (
    <Box>
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
