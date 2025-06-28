import React, { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens } from '../styles/theme';

// Context for theme mode
type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Custom hook for theme context
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
};

// Props for the ThemeContextProvider
interface ThemeContextProviderProps {
  children: ReactNode;
}

// Theme context provider component
export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  // Initialize from localStorage if available
  const savedMode = localStorage.getItem('theme-mode');
  const initialMode: PaletteMode = savedMode === 'dark' ? 'dark' : 'light';
  
  const [mode, setMode] = useState<PaletteMode>(initialMode);

  // Memo-ize the theme context value to prevent unnecessary renders
  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        // Save to localStorage
        localStorage.setItem('theme-mode', newMode);
      },
    }),
    [mode]
  );

  // Create the theme based on the current mode
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;