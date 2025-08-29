import {
  Alert,
  Box,
  Button,
  Dialog,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import { ProductStockStatus, ProductEntity } from '~/services/entities';
import { Form } from '@remix-run/react';

import { modalStyle } from '~/style/theme';

export default function SetProductStockStatusDialog(props: {
  product: ProductEntity | null;
  open: boolean;
  onClose: () => void;
}) {
  const { product, open, onClose } = props;

  return (
    <Dialog open={open}>
      <Box sx={{ ...modalStyle }}>
        <h3>{product?.name}</h3>
        <Form method="post">
          <input type="hidden" name="id" value={product?.id} />
          <Grid container>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <FormControl>
                <InputLabel id={`product-stock-status`}>
                  Stock status
                </InputLabel>
                <Select
                  labelId={`product-stock-status`}
                  name={`stockStatus`}
                  defaultValue={product?.stockStatus}
                  // onChange={handleSelectStockStatus}
                  sx={{ minWidth: 200, marginBottom: 2 }}
                  size="small"
                >
                  <MenuItem value={ProductStockStatus.ON_BACKORDER}>
                    On backorder
                  </MenuItem>
                  <MenuItem value={ProductStockStatus.IN_STOCK}>
                    In stock
                  </MenuItem>
                  <MenuItem value={ProductStockStatus.OUT_OF_STOCK}>
                    {' '}
                    Out of stock
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <Alert severity="info">
                This will update the stock status in Woo webshop
              </Alert>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'left' }}>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{ m: 2, marginTop: 4 }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                onClick={() => {
                  onClose();
                }}
                sx={{ m: 2, marginTop: 4 }}
                type="submit"
                name="_action"
                value="set-product-stock-status"
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </Form>
      </Box>
    </Dialog>
  );
}
