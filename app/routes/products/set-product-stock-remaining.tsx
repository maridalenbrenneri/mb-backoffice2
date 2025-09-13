import {
  Box,
  Button,
  Dialog,
  FormControl,
  Grid,
  TextField,
} from '@mui/material';
import { useEffect, useRef } from 'react';

import type { ProductEntity } from '~/services/entities';
import { Form } from '@remix-run/react';

import { modalStyle } from '~/style/theme';

export default function SetProductCodeDialog(props: {
  product: ProductEntity | null;
  open: boolean;
  onClose: () => void;
}) {
  const { product, open, onClose } = props;
  const textFieldRef = useRef<HTMLInputElement>(null);

  const handleDialogEntered = () => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
      textFieldRef.current.select();
    }
  };

  return (
    <Dialog
      open={open}
      TransitionProps={{
        onEntered: handleDialogEntered,
      }}
    >
      <Box sx={{ ...modalStyle }}>
        <h3>{product?.name}</h3>
        <Form method="post">
          <input type="hidden" name="id" value={product?.id} />

          <Grid container>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              <FormControl>
                <TextField
                  name="stockRemaining"
                  label="Stock remaining (kg)"
                  variant="outlined"
                  size="small"
                  type="number"
                  inputProps={{
                    step: '1',
                    min: '0',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  defaultValue={product?.stockRemaining || 0}
                  inputRef={textFieldRef}
                  autoFocus
                />
              </FormControl>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'left' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ m: 2, marginTop: 4 }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{ m: 2, marginTop: 4 }}
                type="submit"
                name="_action"
                value="set-product-stock-remaining"
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
