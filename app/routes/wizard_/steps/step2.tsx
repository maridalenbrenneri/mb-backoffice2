import { useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import type { WizardPreviewGroup } from '~/_libs/core/services/wizard-service';

export default function Wizard() {
  const preview = useOutletContext() as WizardPreviewGroup;
  const [orders, setOrders] = useState<number[]>([]);

  useEffect(() => {
    setOrders(preview.orders.privates.custom.ship);
  }, [preview]);

  if (!preview) return null;

  return (
    <Box>
      <div>Custom orders with local pick-up</div>

      <div>{orders.length} renewal orders to be packed</div>
    </Box>
  );
}
