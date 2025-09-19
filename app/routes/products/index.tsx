import type { ActionFunction } from '@remix-run/node';
import {
  Link,
  useActionData,
  useFetcher,
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
import Typography from '@mui/material/Typography';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Snackbar,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { type ProductEntity } from '~/services/entities';
import { toPrettyDateTime } from '~/utils/dates';
import { productActionHandler } from './actions';
import { defaultStockStatus, productLoader, type LoaderData } from './loader';
import SetProductStockStatusDialog from './set-product-stock-status-dialog';
import SetProductStockRemainingDialog from './set-product-stock-remaining';
import StockDisplay from '~/components/StockDisplay';
import StockStatusDisplay from '~/components/StockStatusDisplay';
import SetProductLabelsPrintedDialog from './set-product-labels-printed';
import ExternalLink from '~/components/ExternalLink';
import Seperator from '~/components/Seperator';
import ProductWebshopStatus from '~/components/ProductWebshopStatus';

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

  const { publishedProducts, notYetPublishedProducts } =
    useLoaderData() as unknown as LoaderData;

  const submit = useSubmit();
  const fetcherSync = useFetcher();
  const fetcherCleanup = useFetcher();
  const [params] = useSearchParams();

  const [openSnack, setOpenSnack] = useState<boolean>(false);
  const [openErrorSnack, setOpenErrorSnack] = useState<boolean>(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
    null
  );

  const [stockStatus, setStockStatus] = useState(
    params.get('stockStatus') || defaultStockStatus
  );
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  const doSubmit = (data: any) => {
    submit(data, { replace: true });
  };

  const handleSelectStockStatus = (e: any) => {
    setStockStatus(e.target.value);
    doSubmit({
      stockStatus: e.target.value,
    });
  };

  const handleShowOutOfStockChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowOutOfStock(e.target.checked);
    doSubmit({
      stockStatus: e.target.checked ? '_all' : '_exclude_out_of_stock',
    });
  };

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

  const isRunningSyncFromWoo =
    fetcherSync.state === 'submitting' &&
    fetcherSync.formData?.get('_action') === 'woo-product-sync';

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
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
      setItems(coffees);
    }, [coffees]);

    const handleDragStart = (index: number) => {
      if (!sortable) return;
      dragIndexRef.current = index;
      setDraggingIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
      if (!sortable) return;
      e.preventDefault();
    };

    const handleDragEnter = (index: number) => {
      if (!sortable) return;
      if (draggingIndex !== null && index !== dragOverIndex) {
        setDragOverIndex(index);
      }
    };

    const handleDrop = (
      e: React.DragEvent<HTMLTableRowElement>,
      dropIndex: number
    ) => {
      if (!sortable) return;
      e.preventDefault();
      const fromIndex = dragIndexRef.current;
      dragIndexRef.current = null;
      if (fromIndex === null || fromIndex === dropIndex) return;

      const next = items.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(dropIndex, 0, moved);
      setItems(next);
      setDraggingIndex(null);
      setDragOverIndex(null);
      if (onSorted) onSorted(next);
    };

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              {sortable && <TableCell width={28} />}
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
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(index)}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  ...(sortable && draggingIndex === index
                    ? { opacity: 0.5 }
                    : {}),
                  ...(sortable && dragOverIndex === index
                    ? {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        outline: '2px solid #1976d2',
                        outlineOffset: '-2px',
                      }
                    : {}),
                  transition: 'opacity 120ms ease',
                }}
              >
                {sortable && (
                  <TableCell width={28} sx={{ p: 0.5 }}>
                    <span
                      aria-label="drag handle"
                      title="Drag to reorder"
                      draggable={true}
                      onDragStart={() => handleDragStart(index)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'grab',
                        color: 'rgba(0,0,0,0.45)',
                      }}
                    >
                      <DragIndicatorIcon fontSize="small" />
                    </span>
                    {/* {product.sortOrder} */}
                  </TableCell>
                )}
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
                  <ProductWebshopStatus product={product} />
                </TableCell>
                <TableCell>
                  <Button
                    sx={{
                      textTransform: 'none',
                      color: 'black',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                      },
                      borderRadius: 1,
                      padding: '4px 8px',
                      minWidth: 'auto',
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
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                      },
                      borderRadius: 1,
                      padding: '4px 8px',
                      minWidth: 'auto',
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
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                      },
                      borderRadius: 1,
                      padding: '4px 8px',
                      minWidth: 'auto',
                    }}
                    onClick={() => openSetProductLabelsPrintedDialog(product)}
                    variant="text"
                  >
                    {product.coffee_labelsPrinted ? 'Yes' : 'No'}
                  </Button>
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

      <Box sx={{ marginTop: 2 }}>
        <Box
          sx={{
            m: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Button href="/products/admin/new" variant="contained">
            Add new coffee
          </Button>

          <fetcherSync.Form
            method="post"
            action="/api/woo-product-sync-status"
            onSubmit={() => {
              const formData = new FormData();
              formData.append('_action', 'woo-product-cleanup');
              fetcherCleanup.submit(formData, {
                method: 'post',
                action: '/api/woo-product-cleanup',
              });
            }}
          >
            <FormControl sx={{ m: 0 }}>
              <Tooltip
                title={`
                  Sync status, stock status, images and any deleted products if changes have been made in Woo admin.
                  (This happens automatically on a regular basis.)
                `}
              >
                <Button
                  type="submit"
                  name="_action"
                  value="woo-product-sync"
                  disabled={isRunningSyncFromWoo}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {isRunningSyncFromWoo ? 'Running sync...' : 'Sync from Woo'}
                </Button>
              </Tooltip>
            </FormControl>
          </fetcherSync.Form>
        </Box>

        <Seperator />

        <Typography variant="h6" color="text.secondary" sx={{ m: 1 }}>
          Published coffees
        </Typography>
        <Box sx={{}}>
          <RenderTable coffees={publishedProducts} sortable={false} />
        </Box>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ ml: 1, mb: 1, mt: 3 }}
        >
          Not yet published coffees
        </Typography>
        <Box>
          <RenderTable
            coffees={notYetPublishedProducts}
            sortable={true}
            onSorted={(sortedItems) => {
              const ids = sortedItems.map((p) => p.id);
              const formData = new FormData();
              formData.append('_action', 'set-sort-order');
              formData.append('ids', JSON.stringify(ids));
              fetcherSync.submit(formData, { method: 'post' });
            }}
          />
        </Box>
        <Box sx={{ m: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOutOfStock}
                onChange={handleShowOutOfStockChange}
                size="small"
              />
            }
            label="Include Out of stock"
          />
        </Box>
      </Box>

      <Seperator />

      <Link to="/products/all-coffees?status=_in_webshop&stockStatus=_all">
        View list of all coffees
      </Link>

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
