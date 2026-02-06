import { createTheme } from '@mui/material/styles';

/**
 * MUI theme configuration with RTL support.
 * 
 * Features:
 * - Hebrew language support
 * - RTL direction
 * - Custom color palette
 * - Typography settings for Hebrew fonts
 */
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default theme;
