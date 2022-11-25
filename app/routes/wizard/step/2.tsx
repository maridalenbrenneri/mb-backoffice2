import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useOutletContext } from '@remix-run/react';
import { useState, useEffect } from 'react';

import { Box, Button } from '@mui/material';

import type { OnboardingWizardSession } from '~/sessions/wizard-session.server';
import { getMaybeWizardSession } from '~/sessions/wizard-session.server';
import { commitWizardSession } from '~/sessions/wizard-session.server';
import { assertReferer } from '~/utils/assert-referer.server';
import type { WizardPreviewGroup } from '~/_libs/core/services/wizard-service';
import type { OnboardingWizardHandle } from '../step';

export const handle: OnboardingWizardHandle = {
  key: 'onboarding',
  title: 'Custom orders, print label and ship',
  stepNumber: 2,
  submitButton: (
    <Button type="submit" form="step-2" variant="contained">
      Next to step 3
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
  const data = useLoaderData<typeof loader>();
  const preview = useOutletContext() as WizardPreviewGroup;
  const [orders, setOrders] = useState<number[]>([]);

  useEffect(() => {
    setOrders(preview.orders.privates.custom.ship);
  }, [preview]);

  return (
    <Box>
      <div>{orders.length} custom orders to be packed</div>

      <Button variant="contained" disabled={!orders.length}>
        Complete orders
      </Button>

      <Form
        id="step-2"
        method="post"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* <label>
          Favorite color :
          <input
            type="text"
            name="favoriteColor"
            defaultValue={data?.favoriteColor}
          />
        </label> */}

        <input type="hidden" name="nextStep" value="3" />
      </Form>
    </Box>
  );
}
