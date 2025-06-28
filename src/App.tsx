import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useThemeMode } from './context/ThemeContextProvider';
import { useGlobalState } from './context/GlobalStateContext';

// Layout components
import MainLayout from './components/layouts/MainLayout';

// Lazy load pages for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SalesAnalytics = React.lazy(() => import('./pages/SalesAnalytics'));
const GeographicData = React.lazy(() => import('./pages/GeographicData'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Predictions = React.lazy(() => import('./pages/Predictions'));
const Settings = React.lazy(() => import('./pages/Settings'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    width="100vw"
  >
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  const { mode } = useThemeMode(); // Only use theme mode, don't toggle it here
  const { state, dispatch } = useGlobalState();
  const [initialized, setInitialized] = useState(false);

  // Initialize app state (except theme which is handled by ThemeContextProvider)
  useEffect(() => {
    try {
      // Load other app state from localStorage if needed
      // Theme mode is now fully handled by ThemeContextProvider
      
      // Other initializations can go here...
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setInitialized(true);
    }
  }, [dispatch]);

  if (!initialized) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales" element={<SalesAnalytics />} />
          <Route path="geography" element={<GeographicData />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;