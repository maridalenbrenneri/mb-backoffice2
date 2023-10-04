import type { TextFieldProps } from '@mui/material';
import { TextField, styled } from '@mui/material';

export const QuantityTextField = styled(TextField)<TextFieldProps>(
  ({ theme }) => ({
    '& input': {
      textAlign: 'right',
    },
    '.MuiTextField-root': {
      width: 100,
    },
  })
);
