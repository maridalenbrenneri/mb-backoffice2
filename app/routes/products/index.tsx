import { json } from '@remix-run/node';
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import type { Product } from '~/_libs/core/repositories/product';
import { getProducts } from '~/_libs/core/repositories/product';
import { ProductStatus, ProductStockStatus } from '@prisma/client';
import { useState } from 'react';

const defaultStatus = ProductStatus.PUBLISHED;
const defaultStockStatus = ProductStockStatus.IN_STOCK;

type LoaderData = {
  products: Awaited<ReturnType<typeof getProducts>>;
};

function buildFilter(search: URLSearchParams) {
  const filter: any = { where: {} };

  const getStatusFilter = search.get('status') || defaultStatus;
  const getStockStatusFilter = search.get('stockStatus') || defaultStockStatus;

  // TODO: Filter fuckup when both are used

  if (getStatusFilter !== '_all') filter.where.status = getStatusFilter;
  if (getStockStatusFilter !== '_all')
    filter.where.stockStatus = getStockStatusFilter;

  return filter;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);

  const filter = buildFilter(search);

  console.log(filter);

  const products = await getProducts(filter);
  return json<LoaderData>({
    products,
  });
};

export default function Products() {
  const { products } = useLoaderData() as unknown as LoaderData;
  const [params] = useSearchParams();
  const submit = useSubmit();
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
    });
  };

  const handleSelectStockStatus = (e: any) => {
    setStockStatus(e.target.value);
    doSubmit({
      stockStatus: e.target.value,
    });
  };

  return (
    <main>
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
              <TableCell>Country</TableCell>
              <TableCell>Woo Product ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product: Product) => (
              <TableRow
                key={product.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  {/* <Link to={`admin/${product.id}`}>{product.id}</Link> */}
                  {product.id}
                </TableCell>
                <TableCell>
                  <small>{product.status}</small>
                </TableCell>
                <TableCell>
                  <small>{product.stockStatus}</small>
                </TableCell>
                <TableCell>{product.productCode}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.country}</TableCell>
                <TableCell>{product.wooProductId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
