import type { ActionFunction } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import {
  ProductStatus,
  ProductStockStatus,
  type ProductEntity,
} from '~/services/entities';
import { toPrettyDateTime } from '~/utils/dates';
import { productActionHandler } from './actions';
import type { LoaderDataAll } from './loader';
import { productLoaderAllCoffees } from './loader';
import StockDisplay from '~/components/StockDisplay';
import StockStatusDisplay from '~/components/StockStatusDisplay';
import { defaultStatus, defaultStockStatus } from './loader';
import ExternalLink from '~/components/ExternalLink';
import Seperator from '~/components/Seperator';

export const loader = async ({ request }: { request: Request }) => {
  return await productLoaderAllCoffees(request);
};

export const action: ActionFunction = async ({ request }) => {
  return await productActionHandler(request);
};

export default function Products() {
  const data = useActionData() as
    | { didUpdate?: boolean; updateMessage?: string }
    | undefined;

  const { products } = useLoaderData() as unknown as LoaderDataAll;
  const [params] = useSearchParams();
  const submit = useSubmit();
  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);
  const [status, setStatus] = useState(params.get('status') || defaultStatus);
  const [stockStatus, setStockStatus] = useState(
    params.get('stockStatus') || defaultStockStatus
  );

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

  const RenderTable = ({
    coffees,
    sortable = false,
    onSorted,
  }: {
    coffees: ProductEntity[];
    sortable?: boolean;
    onSorted?: (items: ProductEntity[]) => void;
  }) => {
    const [items, setItems] = useState<ProductEntity[]>(coffees);
    const dragIndexRef = useRef<number | null>(null);

    useEffect(() => {
      setItems(coffees);
    }, [coffees]);

    return (
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
            {items.map((product: ProductEntity, index: number) => (
              <TableRow
                key={product.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                style={{ cursor: sortable ? 'move' : undefined }}
              >
                <TableCell>
                  <Tooltip title="Edit coffee">
                    <Link
                      to={`admin/${product.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#0000EE',
                      }}
                    >
                      {product.id}
                      <EditIcon fontSize="small" sx={{ opacity: 0.6 }} />
                    </Link>
                  </Tooltip>
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
                        <small>No</small>
                      </div>
                    ) : (
                      <small>{product.status}</small>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StockStatusDisplay stockStatus={product.stockStatus} />
                </TableCell>
                <TableCell>
                  <StockDisplay stockRemaining={product.stockRemaining || 0} />
                </TableCell>
                <TableCell>
                  {product.coffee_labelsPrinted ? 'Yes' : 'No'}
                </TableCell>
                <TableCell>
                  {product.infoLink ? (
                    <ExternalLink href={product.infoLink} text={'link'} />
                  ) : (
                    <i>not set</i>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="View product in Woo">
                    <ExternalLink
                      href={product.wooProductUrl || ''}
                      text={product.wooProductId}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <small>{toPrettyDateTime(product.updatedAt, false)}</small>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

      <Box>
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

        <RenderTable coffees={products} sortable={false} />

        <Seperator />

        <Link to="/products">Back to coffees</Link>
      </Box>
    </main>
  );
}
