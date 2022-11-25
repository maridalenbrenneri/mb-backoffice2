import { Link, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box, Button } from '@mui/material';

import type { WizardPreviewGroup } from '~/_libs/core/services/wizard-service';

export default function Wizard() {
  const preview = useOutletContext() as WizardPreviewGroup;
  const [orders, setOrders] = useState<number[]>([]);
  const [renewalOrders, setRenewalOrders] = useState<number[]>([]);

  useEffect(() => {
    setOrders(preview.orders.privates.custom.pickUp);
    setRenewalOrders(preview.orders.privates.renewal.pickUp);
  }, [preview]);

  console.log(preview);

  if (!preview) return null;

  return (
    <Box>
      <p>
        Let's start with orders with local pick-up. These will be be completed
        but not sent to Cargonizer. Don't forget their name on the tape!
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

      <div>
        <Link to="/wizard/steps/step2">Next</Link>
      </div>
    </Box>
  );
}
