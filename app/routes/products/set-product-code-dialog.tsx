import {
  Box,
  Button,
  Dialog,
  FormControl,
  Grid,
  TextField,
} from '@mui/material';

import type { Product } from '@prisma/client';
import { Form } from '@remix-run/react';

import { modalStyle } from '~/style/theme';

export default function SetProductCodeDialog(props: {
  product: Product | null;
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
                <TextField
                  name="productCode"
                  label="Product code"
                  variant="outlined"
                  size="small"
                  defaultValue={product?.productCode}
                />
              </FormControl>
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
                onClick={(e) => {
                  // submit(e.currentTarget, { replace: true });
                  onClose();
                }}
                sx={{ m: 2, marginTop: 4 }}
                type="submit"
                name="_action"
                value="set-product-code"
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
