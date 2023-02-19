import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

export default function CompleteAndShipResultBox(props: { result: any }) {
  const { result } = props;

  const [successRows, setSuccessRows] = useState<any>([]);
  const [failedRows, setFailedRows] = useState<any[]>([]);

  useEffect(() => {
    setSuccessRows(
      result.orderResult.filter((r: any) => r.result === 'Success')
    );
  }, [result]);

  useEffect(() => {
    setFailedRows(result.orderResult.filter((r: any) => r.result === 'Failed'));
  }, [result]);

  return (
    <Box>
      {successRows.length > 0 && (
        <Alert severity="success">
          {successRows.length} order(s) completed successfully
        </Alert>
      )}

      {result?.printErrors > 0 && (
        <Alert severity="error">{result.printErrors}</Alert>
      )}

      {failedRows.length > 0 && (
        <>
          <Alert severity="warning">
            Failed to complete {failedRows.length} order(s). Verify these in Woo
            and Cargonizer before trying again.
          </Alert>

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table sx={{ minWidth: 800, borderColor: 'red' }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Result</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>Created in Cargonizer</TableCell>
                  <TableCell>Completed in Woo</TableCell>
                  <TableCell>Woo id/status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedRows.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
                      {row.result}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://mb-backoffice.fly.dev/orders/admin/${row.orderId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.orderId}
                      </a>
                    </TableCell>
                    <TableCell>{row.error}</TableCell>
                    <TableCell>
                      {row.isTransferedToCargonizer ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell>{row.isCompletedInWoo ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {row.wooOrderId || ''} {row.wooOrderStatus || ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {successRows.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table sx={{ minWidth: 800 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Result</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Woo, completed</TableCell>
                <TableCell>Woo id</TableCell>
                <TableCell>Cargonizer, consignment created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {successRows.map((row: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{row.result}</TableCell>
                  <TableCell>
                    <a
                      href={`https://mb-backoffice.fly.dev/orders/admin/${row.orderId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.orderId}
                    </a>
                  </TableCell>
                  <TableCell>{row.isCompletedInWoo ? 'Yes' : 'No'} </TableCell>
                  <TableCell>{row.wooOrderId || ''}</TableCell>
                  <TableCell>
                    {row.isTransferedToCargonizer ? 'Yes' : 'No'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
