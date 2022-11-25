import type { ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Outlet, useLoaderData } from '@remix-run/react';
import JSONPretty from 'react-json-pretty';
import { useEffect, useState } from 'react';

import { Box, Button, FormControl, Typography } from '@mui/material';

import { generatePreview } from '~/_libs/core/services/wizard-service';

let currentStep = 1;

type LoaderData = {
  preview: Awaited<ReturnType<typeof generatePreview>>;
};

export const resolveNextStepAction = async (values: any) => {
  currentStep += 1;
  return redirect(`/wizard/steps/step${currentStep}`);
};

export const resolvPrevStepAction = async (values: any) => {
  currentStep -= 1;
  return redirect(`/wizard/steps/step${currentStep}`);
};

export const loader = async ({ request }) => {
  const preview = await generatePreview();
  return json<LoaderData>({
    preview,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  console.log('I AM THE SERVER');
  if (_action === 'next-step') {
    currentStep += 1;
    return redirect(`/wizard/steps/step${currentStep}`);
  }
  if (_action === 'prev-step') {
    currentStep -= 1;
    return redirect(`/wizard/steps/step${currentStep}`);
  }

  //   if (_action === 'create-order')
  //     return await createNonRecurringOrder(+(values as any).id, {
  //       _250: +(values as any).quantity250,
  //       _500: +(values as any).quantity500,
  //       _1200: +(values as any).quantity1200,
  //     });

  //   if (_action === 'create-custom-order')
  //     return await createCustomdOrder(+(values as any).id);

  return null;
};

export default function Steps() {
  const { preview } = useLoaderData() as unknown as LoaderData;
  // const [step, setStep] = useState(1);

  if (!preview) return null;

  //   const onNextStep = () => {
  //     const nextStep = step + 1;
  //     setStep(nextStep);
  //     redirect(`/wizard/steps/step${nextStep}`);
  //   };

  //   const onPreviusStep = () => {
  //     const prevStep = step - 1;
  //     setStep(prevStep);
  //     redirect(`/wizard/steps/step${prevStep}`);
  //   };

  return (
    <Box>
      <Typography variant="h2">Packing Wizard </Typography>
      <Outlet context={preview} />

      <div>
        <Form method="post">
          <FormControl sx={{ m: 1 }}>
            <Button
              type="submit"
              name="_action"
              value="prev-step"
              variant="contained"
            >
              Previus
            </Button>
          </FormControl>
          <FormControl sx={{ m: 1 }}>
            <Button
              type="submit"
              name="_action"
              value="next-step"
              variant="contained"
            >
              Next
            </Button>
          </FormControl>
        </Form>
      </div>

      <JSONPretty data={preview} />
    </Box>
  );
}
