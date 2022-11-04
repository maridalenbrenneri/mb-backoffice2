import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { WooImportResult } from '~/_libs/core/models/woo-import-result.server';
import { getLastWooImportResult } from '~/_libs/core/models/woo-import-result.server';

type LoaderData = {
  wooDatas: Awaited<ReturnType<typeof getLastWooImportResult>>;
};

export const loader = async () => {
  const wooDatas = await getLastWooImportResult();

  return json<LoaderData>({
    wooDatas,
  });
};

function resolveAboStats(wooData: WooImportResult[]) {
  const data = JSON.parse(wooData[0].result);

  console.log(data);

  return data;
}

export default function Index() {
  const { wooDatas } = useLoaderData() as unknown as LoaderData;
  const aboStats = resolveAboStats(wooDatas);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Test stuff</h1>
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="h3">ABO STATS</Typography>

        <p>Active, total: {aboStats.subscriptionData.activeCount}</p>
        <p>Active, monthly: {aboStats.subscriptionData.monthlyCount}</p>
        <p>Active, fortnightly: {aboStats.subscriptionData.activeCount}</p>
        <p>Gift: {aboStats.giftSubscriptions}</p>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="subscription table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>1</TableCell>
                <TableCell>2</TableCell>
                <TableCell>3</TableCell>
                <TableCell>4</TableCell>
                <TableCell>5</TableCell>
                <TableCell>6</TableCell>
                <TableCell>7</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>Monthly</TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.one}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.two}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.three}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.four}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.five}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.six}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.monthly.seven}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fortnightly</TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.one}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.two}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.three}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.four}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.five}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.six}
                </TableCell>
                <TableCell>
                  {aboStats.subscriptionData.bagCounter.fortnightly.seven}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}
