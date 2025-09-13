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

import { ProductEntity } from '~/services/entities';
import { Form } from '@remix-run/react';

import { modalStyle } from '~/style/theme';

export default function SetProductLabelsPrintedDialog(props: {
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
                <InputLabel id={`product-set-labels-printed`}>
                  Labels printed
                </InputLabel>
                <Select
                  labelId={`product-set-labels-printed`}
                  name={`labelsPrinted`}
                  defaultValue={product?.coffee_labelsPrinted}
                  sx={{ minWidth: 200, marginBottom: 2 }}
                  size="small"
                >
                  <MenuItem value={'true'}>Yes</MenuItem>
                  <MenuItem value={'false'}>No</MenuItem>
                </Select>
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
                onClick={() => {
                  onClose();
                }}
                sx={{ m: 2, marginTop: 4 }}
                type="submit"
                name="_action"
                value="set-product-labels-printed"
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
