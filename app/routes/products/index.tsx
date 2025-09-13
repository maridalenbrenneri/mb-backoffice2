import type { ActionFunction } from '@remix-run/node';
import {
  Form,
  Link,
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
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

import {
  ProductStatus,
  ProductStockStatus,
  type ProductEntity,
} from '~/services/entities';
import { toPrettyDateTime } from '~/utils/dates';
import { productActionHandler } from './actions';
import type { LoaderData } from './loader';
import { productLoader } from './loader';
import SetProductStockStatusDialog from './set-product-stock-status-dialog';
import SetProductStockRemainingDialog from './set-product-stock-remaining';
import StockDisplay from '~/components/StockDisplay';
import StockStatusDisplay from '~/components/StockStatusDisplay';
import SetProductLabelsPrintedDialog from './set-product-labels-printed';
import { defaultStatus, defaultStockStatus } from './loader';

export const loader = async ({ request }: { request: Request }) => {
  return await productLoader(request);
};

export const action: ActionFunction = async ({ request }) => {
  return await productActionHandler(request);
};

export default function Products() {
  const data = useActionData() as
    | { didUpdate?: boolean; updateMessage?: string }
    | undefined;

  const { products } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);
  const [status, setStatus] = useState(params.get('status') || defaultStatus);
  const [stockStatus, setStockStatus] = useState(
    params.get('stockStatus') || defaultStockStatus
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
    null
  );

  const [
    isSetProductStockStatusDialogOpen,
    setIsSetProductStockStatusDialogOpen,
  ] = useState(false);

  const [
    isSetProductStockRemainingDialogOpen,
    setIsSetProductStockRemainingDialogOpen,
  ] = useState(false);

  const [
    isSetProductLabelsPrintedDialogOpen,
    setIsSetProductLabelsPrintedDialogOpen,
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

  const openSetProductStockStatusDialog = (product: ProductEntity) => {
    setSelectedProduct(product);
    setIsSetProductStockStatusDialogOpen(true);
  };

  const openSetProductStockRemainingDialog = (product: ProductEntity) => {
    setSelectedProduct(product);
    setIsSetProductStockRemainingDialogOpen(true);
  };

  const openSetProductLabelsPrintedDialog = (product: ProductEntity) => {
    setSelectedProduct(product);
    setIsSetProductLabelsPrintedDialogOpen(true);
  };

  const onCloseSetProductStockStatusDialog = () => {
    setSelectedProduct(null);
    setIsSetProductStockStatusDialogOpen(false);
  };

  const onCloseSetProductStockRenamingDialog = () => {
    setSelectedProduct(null);
    setIsSetProductStockRemainingDialogOpen(false);
  };

  const onCloseSetProductLabelsPrintedDialog = () => {
    setSelectedProduct(null);
    setIsSetProductLabelsPrintedDialogOpen(false);
  };

  const hasAllRequiredFields = (product: ProductEntity): boolean => {
    return !!(
      product.coffee_country &&
      product.name &&
      product.coffee_beanType &&
      product.coffee_processType &&
      product.coffee_cuppingScore &&
      product.description
    );
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

      <Typography variant="h1">Products</Typography>

      <Box sx={{ m: 1, p: 2 }}>
        <Button href="/products/admin/new" variant="contained">
          Create a new product
        </Button>
      </Box>

      <Form method="get">
        <FormControl sx={{ m: 1 }}>
          <InputLabel id={`product-status`}>Webshop status</InputLabel>
          <Select
            labelId={`product-status`}
            name={`status`}
            defaultValue={status}
            onChange={handleSelectStatus}
            sx={{ minWidth: 250 }}
            size="small"
          >
            <MenuItem value={'_in_webshop'}>All</MenuItem>
            <MenuItem value={ProductStatus.PUBLISHED}>Published</MenuItem>
            <MenuItem value={'_not_published'}>Not published</MenuItem>
            <MenuItem value={ProductStatus.DELETED}>
              <em>Deleted</em>
            </MenuItem>
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
            <MenuItem value={'_backorder_in_stock'}>
              On backorder & In stock
            </MenuItem>
            <MenuItem value={ProductStockStatus.ON_BACKORDER}>
              On backorder
            </MenuItem>
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
              <TableCell>Id</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>In webshop</TableCell>
              <TableCell>Stock status</TableCell>
              <TableCell>Current stock</TableCell>
              <TableCell>Labels printed</TableCell>
              <TableCell>Info link</TableCell>
              <TableCell>Woo id</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product: ProductEntity) => (
              <TableRow
                key={product.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Link to={`admin/${product.id}`}>{product.id}</Link>
                </TableCell>
                <TableCell>{product.coffee_country || ''}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {product.productCode ? (
                    <span>{product.productCode} </span>
                  ) : (
                    <small style={{ fontStyle: 'italic' }}>n/a</small>
                  )}
                </TableCell>

                <TableCell>
                  <div>
                    {product.status === ProductStatus.PUBLISHED ? (
                      <span
                        style={{
                          backgroundColor: '#2e7d32',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontSize: 10,
                          display: 'inline-block',
                        }}
                      >
                        YES
                      </span>
                    ) : product.status === ProductStatus.PRIVATE ||
                      product.status === ProductStatus.DRAFT ? (
                      <div>
                        <small>Not published</small>
                        <Tooltip
                          title={
                            hasAllRequiredFields(product)
                              ? 'Valid for publication'
                              : 'Missing fields, product is not ready to be published. Country, name, bean type, process type, cupping score and description are required.'
                          }
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'baseline',
                              verticalAlign: 'middle',
                            }}
                          >
                            {hasAllRequiredFields(product) ? (
                              <CheckCircleIcon
                                color="success"
                                fontSize="small"
                                sx={{ marginLeft: 0.5, marginBottom: 0.5 }}
                              />
                            ) : (
                              <WarningIcon
                                color="warning"
                                fontSize="small"
                                sx={{ marginLeft: 0.5, marginBottom: 0.5 }}
                              />
                            )}
                          </span>
                        </Tooltip>
                      </div>
                    ) : (
                      <small>{product.status}</small>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    sx={{
                      textTransform: 'none',
                      color: 'black',
                    }}
                    onClick={() => openSetProductStockStatusDialog(product)}
                    variant="text"
                  >
                    <StockStatusDisplay stockStatus={product.stockStatus} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    sx={{
                      textTransform: 'none',
                    }}
                    onClick={() => openSetProductStockRemainingDialog(product)}
                    variant="text"
                  >
                    <StockDisplay
                      stockRemaining={product.stockRemaining || 0}
                    />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    sx={{
                      textTransform: 'none',
                      color: 'black',
                    }}
                    onClick={() => openSetProductLabelsPrintedDialog(product)}
                    variant="text"
                  >
                    {product.coffee_labelsPrinted ? 'Yes' : 'No'}
                  </Button>
                </TableCell>
                <TableCell>
                  {product.infoLink ? (
                    <a href={product.infoLink} target="_blank" rel="noreferrer">
                      {'link'}
                    </a>
                  ) : (
                    'n/a'
                  )}
                </TableCell>
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

      <SetProductStockRemainingDialog
        product={selectedProduct}
        open={isSetProductStockRemainingDialogOpen}
        onClose={onCloseSetProductStockRenamingDialog}
      />

      <SetProductLabelsPrintedDialog
        product={selectedProduct}
        open={isSetProductLabelsPrintedDialogOpen}
        onClose={onCloseSetProductLabelsPrintedDialog}
      />
    </main>
  );
}
