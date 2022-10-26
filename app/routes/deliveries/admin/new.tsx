import type { ActionFunction } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import * as React from "react";
import { json } from "@remix-run/node";

import {
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';

import { upsertAction } from "./_shared";
import type { DeliveryDate} from "~/_libs/core/utils/dates";
import { getNextDeliveryDates } from "~/_libs/core/utils/dates";
import type { Coffee} from "~/_libs/core/models/coffee.server";
import { getCoffees } from "~/_libs/core/models/coffee.server";
import { toPrettyDate } from "~/_libs/core/utils/dates";

type LoaderData = {
  deliveryDates: Awaited<ReturnType<typeof getNextDeliveryDates>>;
  coffees: Awaited<ReturnType<typeof getCoffees>>;
};

export const loader = async () => {
  const deliveryDates = getNextDeliveryDates();
  const coffees = await getCoffees();

  return json<LoaderData>({
    deliveryDates,
    coffees,
  });
};

export const action: ActionFunction = async ({ request }) => {
  return await upsertAction(request);
};

export default function NewDelivery() {
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  const { deliveryDates, coffees } = useLoaderData() as unknown as LoaderData;

  const [deliveryDate, setDeliveryDate] = React.useState(deliveryDates[0]);
  const handleChange = (event: SelectChangeEvent) => {
    const dd = deliveryDates.find(d => d.id === (event.target.value as unknown as number)) as DeliveryDate;
    console.log("DeliveryDate set", dd);
    setDeliveryDate(dd);
  };

  return (
    <Box m={2}>
      <Typography variant="h2">Create Delivery</Typography>
      <Form method="post">
        <input type="hidden" name="delivery_date" value={deliveryDate.date.toString()} />
        <input type="hidden" name="delivery_type" value={deliveryDate.type} />
        <div>
          <FormControl sx={{margin: '10px'}}>
            <InputLabel id="date-label">
              Date
            </InputLabel>
            <Select
              labelId="date-label"
              defaultValue={`${deliveryDates[0].id}`}
              onChange={handleChange}>
                {deliveryDates.map((date: DeliveryDate) => (
                  <MenuItem value={date.id} key={date.id}>
                    {toPrettyDate(date.date)} - {date.type}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>

        {[1, 2, 3, 4].map((coffeeNr: number) => (
          <div key={coffeeNr}>
            <FormControl sx={{margin: '10px'}}>
              <InputLabel id={`coffee-${coffeeNr}-label`}>
                Coffee {coffeeNr}
              </InputLabel>
              <Select
                labelId={`coffee-${coffeeNr}-label`}
                name={`coffee${coffeeNr}`}
                defaultValue={''}
                displayEmpty
                sx={{ minWidth: 200 }}>
                  {coffees.map((coffee: Coffee) => (
                    <MenuItem value={coffee.id} key={coffee.id}>
                      {coffee.productCode} - {coffee.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
        ))}
        <p>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Delivery"}
          </Button>
        </p>
      </Form>
    </Box>
  );
}
