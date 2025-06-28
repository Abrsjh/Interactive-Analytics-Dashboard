import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import { ThemeContextProvider } from './context/ThemeContextProvider';
import { GlobalStateProvider } from './context/GlobalStateContext';
import reportWebVitals from './reportWebVitals';
import './styles/index.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeContextProvider>
          <GlobalStateProvider>
            <App />
          </GlobalStateProvider>
        </ThemeContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// Report web vitals for performance monitoring
reportWebVitals();