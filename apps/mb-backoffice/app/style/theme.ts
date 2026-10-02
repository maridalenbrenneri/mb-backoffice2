import { createTheme } from '@mui/material';

import font_dtl_nobel from '../../public/fonts/dtl-nobel.woff';
import font_dtl_nobel_bold from '../../public/fonts/dtl-nobel-bold.woff';
import { colors } from './colors';

export const modalStyle = {
  // position: 'absolute' as 'absolute',
  // top: '25%',
  // left: '50%',
  // transform: 'translate(-50%, -50%)',
  // width: '90%',
  // bgcolor: 'background.paper',
  // border: '1px solid #000',
  // boxShadow: 24,
  p: 4,
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.COLOR_MB_GREEN,
    },
    background: {
      default: colors.COLOR_GREY4,
    },
  },
  typography: {
    fontSize: 12,
    allVariants: {
      fontFamily: 'dtl-nobel',
    },
    body1: {
      fontFamily: 'dtl-nobel',
      color: colors.COLOR_BLACK,
      fontSize: 12,
      lineHeight: 1.4,
    },
    body2: {
      fontFamily: 'dtl-nobel',
      fontSize: 12,
      color: colors.COLOR_BLACK,
    },
    h1: {
      fontFamily: 'dtl-nobel-bold',
      fontSize: 32,
    },
    h2: {
      margin: '0 0 0.75em 0',
      fontFamily: 'dtl-nobel-bold',
      fontSize: 26,
    },
    h3: {
      margin: '0 0 0.75em 0',
      fontFamily: 'dtl-nobel-bold',
      fontSize: 20,
    },
    h4: {
      margin: '0 0 0.75em 0',
      fontFamily: 'dtl-nobel-bold',
      fontSize: 16,
    },
    h5: {
      fontFamily: 'dtl-nobel',
      fontSize: 14,
      margin: '1em 0 0.5em',
      maxWidth: '820px',
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: 'dtl-nobel-bold',
      fontSize: '1rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'dtl-nobel';
          src: url(${font_dtl_nobel}) format('woff');
        }
        @font-face {
          font-family: 'dtl-nobel-bold';
          src: url(${font_dtl_nobel_bold}) format('woff');
        }
        `,
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '&.MuiTableCell-head': {
            fontSize: 11,
            color: colors.COLOR_GREY2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.COLOR_GREY2,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          border: '1px solid lightgray',
          borderRadius: '5px',
        },
      },
    },
  },
});
