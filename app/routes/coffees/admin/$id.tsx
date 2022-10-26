import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useTransition,
  useLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { Box, Button, FormControl, TextField, Typography } from "@mui/material";

import { getCoffee } from "~/_libs/core/models/coffee.server";
import type { Coffee } from "~/_libs/core/models/coffee.server";
import { upsertAction } from "./_shared";

type LoaderData = { coffee: Coffee };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required`);
  const coffee = await getCoffee(+params.id);
  invariant(coffee, `Coffee not found: ${params.id}`);
  return json({ coffee });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function UpdateCoffee() {
  const { coffee } = useLoaderData() as unknown as LoaderData;

  const errors = useActionData();
  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  return (
    <Box
      m={2}
      sx={{
        "& .MuiTextField-root": { m: 1, minWidth: 250 },
      }}
    >
      <Typography variant="h2">Edit Coffee</Typography>
      <Form method="post">
        <input type="hidden" name="id" value={coffee.id} />

        <FormControl>
          <TextField
            name="name"
            label="Name"
            variant="outlined"
            defaultValue={coffee.name}
            error={errors?.name}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="productCode"
            label="Code"
            variant="outlined"
            defaultValue={coffee.productCode}
            error={errors?.productCode}
          />
        </FormControl>
        <FormControl>
          <TextField
            name="country"
            label="Country"
            variant="outlined"
            defaultValue={coffee.country}
            error={errors?.country}
          />
        </FormControl>
        <FormControl sx={{m: 1}}>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Coffee"}
          </Button>
        </FormControl>
      </Form>
    </Box>
  );
}
