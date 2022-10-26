import type { ActionFunction } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { upsertAction } from "./_shared";
import { Button, TextField } from "@mui/material";

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function NewCoffee() {
  const errors = useActionData();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Box 
      m={2}
      sx={{
      "& .MuiTextField-root": { m: 1, width: "30ch" },
    }}>
      <Typography variant="h2">Create New Coffee</Typography>
      <Form method="post">
        <div>
          <TextField
            name="name"
            label="Name"
            variant="outlined"
            error={errors?.name}
          />
        </div>
        <div>
          <TextField
            name="productCode"
            label="Code"
            variant="outlined"
            error={errors?.productCode}
            sx={{margin: 5}}
          />
        </div>
        <div>
          <TextField
            name="country"
            label="Country"
            variant="outlined"
            error={errors?.country}
          />
        </div>
        <div>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Coffee"}
          </Button>
        </div>
      </Form>
    </Box>
  );
}
