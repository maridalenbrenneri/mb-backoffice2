import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ProductEntity, ProductStockStatus } from '~/services/entities';
import { Link } from '@remix-run/react';
import StockDisplay from './StockDisplay';
import ProductWebshopStatus from './ProductWebshopStatus';

interface PublishedProductsBoxProps {
  products: ProductEntity[];
}

const getStockStatusColor = (status: ProductStockStatus) => {
  switch (status) {
    case ProductStockStatus.IN_STOCK:
      return 'success';
    case ProductStockStatus.ON_BACKORDER:
      return 'warning';
    case ProductStockStatus.OUT_OF_STOCK:
      return 'error';
    default:
      return 'default';
  }
};

const getStockStatusLabel = (status: ProductStockStatus) => {
  switch (status) {
    case ProductStockStatus.IN_STOCK:
      return 'In Stock';
    case ProductStockStatus.ON_BACKORDER:
      return 'Backorder';
    case ProductStockStatus.OUT_OF_STOCK:
      return 'Out of Stock';
    default:
      return status;
  }
};

export default function PublishedProductsBox({
  products,
}: PublishedProductsBoxProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>In webshop</TableCell>
              <TableCell>Stock Status</TableCell>
              <TableCell>Current stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.coffee_country || '-'}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.productCode || '-'}</TableCell>
                <TableCell>
                  <ProductWebshopStatus product={product} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStockStatusLabel(product.stockStatus)}
                    color={getStockStatusColor(product.stockStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <StockDisplay stockRemaining={product.stockRemaining || 0} />
                </TableCell>
              </TableRow>
            ))}
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell colSpan={6} align="right">
                <small>
                  <Link to="/products" style={{ marginRight: 10 }}>
                    Edit coffees
                  </Link>
                </small>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
