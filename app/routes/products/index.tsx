import type { ActionFunction } from '@remix-run/node';
import {
  Form,
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
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
} from '@mui/material';

import { ProductStatus, ProductStockStatus } from '@prisma/client';

import type { Product } from '~/_libs/core/repositories/product';
import { toPrettyDateTime } from '~/_libs/core/utils/dates';
import { Edit } from '@mui/icons-material';
import { productActionHandler } from './actions';
import type { LoaderData } from './loader';
import { productLoader } from './loader';
import SetProductCodeDialog from './set-product-code-dialog';
import SetProductStockStatusDialog from './set-product-stock-status-dialog';

const defaultStatus = ProductStatus.PUBLISHED;
const defaultStockStatus = ProductStockStatus.IN_STOCK;

export const loader = async ({ request }) => {
  return await productLoader(request);
};

export const action: ActionFunction = async ({ request }) => {
  return await productActionHandler(request);
};

export default function Products() {
  const data = useActionData();

  const { products } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [status, setStatus] = useState(params.get('status') || defaultStatus);
  const [stockStatus, setStockStatus] = useState(
    params.get('stockStatus') || defaultStockStatus
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSetProductCodeDialogOpen, setIsSetProductCodeDialogOpen] =
    useState(false);
  const [
    isSetProductStockStatusDialogOpen,
    setIsSetProductStockStatusDialogOpen,
  ] = useState(false);

  useEffect(() => {
    setOpenSnack(data?.didUpdate === true);
  }, [data]);

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const handleSelectStatus = (e: any) => {
    setStatus(e.target.value);
    doSubmit({
      status: e.target.value,
      stockStatus,
    });
  };

  const handleSelectStockStatus = (e: any) => {
    setStockStatus(e.target.value);
    doSubmit({
      status,
      stockStatus: e.target.value,
    });
  };

  const openSetProductCodeDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsSetProductCodeDialogOpen(true);
  };

  const onCloseSetProductCodeDialog = () => {
    setSelectedProduct(null);
    setIsSetProductCodeDialogOpen(false);
  };

  const openSetProductStockStatusDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsSetProductStockStatusDialogOpen(true);
  };

  const onCloseSetProductStockStatusDialog = () => {
    setSelectedProduct(null);
    setIsSetProductStockStatusDialogOpen(false);
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

      <Typography variant="h1">Products</Typography>

      <Form method="get">
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`product-status`}>Status</InputLabel>
          <Select
            labelId={`product-status`}
            name={`status`}
            defaultValue={status}
            onChange={handleSelectStatus}
            sx={{ minWidth: 250 }}
            size="small"
          >
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={ProductStatus.PUBLISHED}>Published</MenuItem>
            <MenuItem value={ProductStatus.PRIVATE}>Private</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`product-stock-status`}>Stock status</InputLabel>
          <Select
            labelId={`product-stock-status`}
            name={`stockStatus`}
            defaultValue={stockStatus}
            onChange={handleSelectStockStatus}
            sx={{ minWidth: 250 }}
            size="small"
          >
            <MenuItem value={'_all'}>All</MenuItem>
            <MenuItem value={ProductStockStatus.IN_STOCK}>In stock</MenuItem>
            <MenuItem value={ProductStockStatus.OUT_OF_STOCK}>
              Out of stock
            </MenuItem>
          </Select>
        </FormControl>
      </Form>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Stock status</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Woo Product ID</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product: Product) => (
              <TableRow
                key={product.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{product.id}</TableCell>
                <TableCell>
                  <small>{product.status}</small>
                </TableCell>
                <TableCell>
                  <small>{product.stockStatus}</small>

                  <Button
                    sx={{
                      color: '#999',
                      fontSize: 11,
                      marginLeft: 1,
                    }}
                    onClick={() => openSetProductStockStatusDialog(product)}
                    variant="text"
                  >
                    <Edit />
                  </Button>
                </TableCell>
                <TableCell>
                  {product.productCode ? (
                    <span>{product.productCode} </span>
                  ) : (
                    <small style={{ fontStyle: 'italic' }}>n/a</small>
                  )}
                  <Button
                    sx={{
                      color: '#999',
                      fontSize: 11,
                      marginLeft: 1,
                    }}
                    onClick={() => openSetProductCodeDialog(product)}
                    variant="text"
                  >
                    <Edit />
                  </Button>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <a
                    href={product.wooProductUrl || ''}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {product.wooProductId}
                  </a>
                </TableCell>
                <TableCell>
                  <small>{toPrettyDateTime(product.createdAt, false)}</small>
                </TableCell>
                <TableCell>
                  <small>{toPrettyDateTime(product.updatedAt, false)}</small>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SetProductStockStatusDialog
        product={selectedProduct}
        open={isSetProductStockStatusDialogOpen}
        onClose={onCloseSetProductStockStatusDialog}
      />

      <SetProductCodeDialog
        product={selectedProduct}
        open={isSetProductCodeDialogOpen}
        onClose={onCloseSetProductCodeDialog}
      />
    </main>
  );
}
