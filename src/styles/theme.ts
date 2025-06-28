import { PaletteMode } from '@mui/material';
import { blue, grey } from '@mui/material/colors';

/**
 * @deprecated This file only exports theme constants and utilities.
 * For theme state management, use ThemeContextProvider from '../context/ThemeContextProvider'
 */

/**
 * Creates theme design tokens based on the current mode
 * @param mode The current theme mode ('light' or 'dark')
 * @returns Design tokens for Material UI theme
 */
export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: blue[700],
            light: blue[500],
            dark: blue[900],
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: grey[900],
            secondary: grey[700],
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: blue[500],
            light: blue[300],
            dark: blue[700],
          },
          secondary: {
            main: '#ff4081',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: grey[400],
          },
        }),
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
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
  },
});

// Re-export types for convenience
export type { PaletteMode };

/**
 * @deprecated Use useThemeMode from ThemeContextProvider instead
 * import { useThemeMode } from '../context/ThemeContextProvider';
 */
export { useThemeMode } from '../context/ThemeContextProvider';

// Create a backward-compatible alias for any code still using the old imports
export const useTheme = () => {
  console.warn(
    'useTheme from src/styles/theme.ts is deprecated. ' +
    'Please use ThemeContextProvider from ../context/ThemeContextProvider instead.'
  );
  return { colorMode: { mode: 'light', toggleColorMode: () => {} } };
};