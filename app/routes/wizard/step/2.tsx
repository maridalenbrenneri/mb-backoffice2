import { Box, Button } from '@mui/material';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import type { OnboardingWizardSession } from '~/sessions/wizard-session.server';
import { getMaybeWizardSession } from '~/sessions/wizard-session.server';
import { commitWizardSession } from '~/sessions/wizard-session.server';
import type { OnboardingWizardHandle } from '../step';

const STEP = 2;

export const handle: OnboardingWizardHandle = {
  key: 'onboarding',
  title: 'Orders with special requests from customer',
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
  return (
    <Box>
      <p>
        Nothing to do here. Special requests not yet implemented. Please
        continue to next step
      </p>

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
