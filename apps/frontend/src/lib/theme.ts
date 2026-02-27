import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/x-data-grid/locales';

/**
 * MUI theme configuration with RTL support.
 *
 * Features:
 * - Hebrew language support
 * - RTL direction
 * - Custom color palette
 * - Typography settings for Hebrew fonts
 * - DataGrid Hebrew locale (Rows per page, etc.)
 */
const theme = createTheme(
  {
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
        'Rubik',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  },
  heIL,
);

export default theme;
