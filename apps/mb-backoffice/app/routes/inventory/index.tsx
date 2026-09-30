import type { ActionFunction } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { useEffect, useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';

import { type ProductEntity } from '~/services/entities';
import { toPrettyDateTime } from '~/utils/dates';
import { productActionHandler } from './actions';
import type { LoaderData } from './loader';
import { inventoryLoader } from './loader';
import SetProductStockRemainingDialog from './set-inventory-stock-remaining';
import StockDisplay from '~/components/StockDisplay';

export const loader = async ({ request }: { request: Request }) => {
  return await inventoryLoader(request);
};

export const action: ActionFunction = async ({ request }) => {
  return await productActionHandler(request);
};

export default function Products() {
  const data = useActionData() as
    | { didUpdate?: boolean; updateMessage?: string }
    | undefined;

  const { products } = useLoaderData() as unknown as LoaderData;

  const submit = useSubmit();
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
    null
  );

  const [
    isSetProductStockRemainingDialogOpen,
    setIsSetProductStockRemainingDialogOpen,
  ] = useState(false);

  useEffect(() => {
    if (data?.didUpdate === true) {
      setOpenSnack(true);
      setOpenErrorSnack(false);
    } else if (data?.didUpdate === false) {
      setOpenErrorSnack(true);
      setOpenSnack(false);
    }
  }, [data]);

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const openSetProductStockRemainingDialog = (product: ProductEntity) => {
    setSelectedProduct(product);
    setIsSetProductStockRemainingDialogOpen(true);
  };

  const onCloseSetProductStockRenamingDialog = () => {
    setSelectedProduct(null);
    setIsSetProductStockRemainingDialogOpen(false);
  };

  return (
    <main>
      <Snackbar
        open={openSnack}
        autoHideDuration={4000}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">{data?.updateMessage || 'Updated'}</Alert>
      </Snackbar>
      <Snackbar
        open={openErrorSnack}
        autoHideDuration={6000}
        onClose={() => setOpenErrorSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error">
          {data?.updateMessage || 'An error occurred'}
        </Alert>
      </Snackbar>

      <Box>
        {/* <Box sx={{ m: 1, p: 2 }}>
          <Button href="/products/admin/new" variant="contained">
            Add new coffee
          </Button>
        </Box> */}

        <Typography variant="h2">Inventory</Typography>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Current stock</TableCell>
                <TableCell>Min stock</TableCell>
                <TableCell>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product: ProductEntity) => (
                <TableRow
                  key={product.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>

                  <TableCell>
                    <Button
                      sx={{
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                        },
                        borderRadius: 1,
                        padding: '4px 8px',
                        minWidth: 'auto',
                      }}
                      onClick={() =>
                        openSetProductStockRemainingDialog(product)
                      }
                      variant="text"
                    >
                      <StockDisplay
                        stockRemaining={product.stockRemaining || 0}
                        stockRemainingWarning={
                          product.stockRemainingWarning || 0
                        }
                        unit=""
                      />
                    </Button>
                  </TableCell>

                  <TableCell>
                    <small>{product.stockRemainingWarning || 0}</small>
                  </TableCell>

                  <TableCell>
                    <small>{toPrettyDateTime(product.updatedAt, false)}</small>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <SetProductStockRemainingDialog
        product={selectedProduct}
        open={isSetProductStockRemainingDialogOpen}
        onClose={onCloseSetProductStockRenamingDialog}
      />
    </main>
  );
}
