import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';

import { Button } from '@mui/material';

import type { WizardHandle } from '~/hooks/use-outlet-handle';
import { useOutletHandle } from '~/hooks/use-outlet-handle';
import { generatePreview } from '~/_libs/core/services/wizard-service';

export type OnboardingWizardHandle = WizardHandle<'onboarding'> & {
  title: string;
  stepNumber: number;
  submitButton: React.ReactElement;
};

type LoaderData = {
  preview: Awaited<ReturnType<typeof generatePreview>>;
};

export const loader = async ({ request }) => {
  const preview = await generatePreview();
  return json<LoaderData>({
    preview,
  });
};

export default function WizardStepsLayoutScreen() {
  const { title, stepNumber, submitButton } =
    useOutletHandle<OnboardingWizardHandle>('onboarding')[0];

  const { preview } = useLoaderData() as unknown as LoaderData;

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        lineHeight: '1.4',
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>MB Packing Wizard</h1>

      <h2 style={{ textAlign: 'center' }}>{title}</h2>

      <Outlet context={preview} />

      <hr />

      <div style={{ marginTop: '12px' }}>
        {stepNumber !== 0 ? <BackButton /> : null}
        <span style={{ marginLeft: '12px', marginRight: '12px' }}>
          Step {stepNumber} of 9
        </span>
        {submitButton}
      </div>
    </div>
  );
}

function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="contained"
      onClick={(e) => {
        navigate(-1);
        e.preventDefault();
      }}
    >
      Back
    </Button>
  );
}
