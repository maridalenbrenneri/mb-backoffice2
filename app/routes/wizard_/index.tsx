import { Link, Outlet } from '@remix-run/react';

import { Box } from '@mui/material';

export default function Wizard() {
  return (
    <Box>
      I am the Wizard Index
      <Link to="/wizard/steps/step1">Start</Link>
      <Outlet />
    </Box>
  );
}
