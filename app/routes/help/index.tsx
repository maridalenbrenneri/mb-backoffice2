import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box, Button, FormControl } from '@mui/material';

export default function JobResult() {
  return (
    <main>
      <Typography variant="h1">Help</Typography>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Roast Overview</Typography>
        <p></p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Subscriptions</Typography>

        <Typography variant="h3">Types</Typography>
        <p>PRIVATE_GIFT, PRIVATE, B2B</p>
        <Typography variant="h3">Frequency</Typography>
        <p> MONTHLY, MONTHLY_3RD, FORTNIGHTLY</p>
      </Box>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2">Orders</Typography>
        <p>
          It's no possible to update address etc. on orders imported from Woo.
          Only internal note and quantity/items can be changed. This is because
          Woo is "master" and address etc. will be overriden at next import.
        </p>
      </Box>
    </main>
  );
}
