import { useState, useEffect, useCallback } from 'react';
import { api, ApiError, retryRequest } from '../services/api';

/**
 * Hook options for data fetching
 */
export interface UseDataOptions<T> {
  /** Initial data value before fetching */
  initialData?: T;
  /** Whether to fetch data immediately on mount */
  fetchOnMount?: boolean;
  /** Auto retry on failure */
  retry?: boolean;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Custom fetch function instead of default API */
  customFetch?: () => Promise<T>;
  /** Key for caching (using React Query or similar) */
  cacheKey?: string;
  /** Error transform function */
  errorTransform?: (error: ApiError) => string;
  /** Data transform function */
  dataTransform?: (data: any) => T;
  /** Callback function on success */
  onSuccess?: (data: T) => void;
  /** Callback function on error */
  onError?: (error: ApiError) => void;
  /** Polling interval in ms (0 = no polling) */
  pollingInterval?: number;
  /** Dependencies for refetching (similar to useEffect dependencies) */
  dependencies?: any[];
}

/**
 * Hook return value for data fetching
 */
export interface UseDataResult<T> {
  /** The fetched data */
  data: T | undefined;
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to fetch data manually */
  fetch: () => Promise<T | undefined>;
  /** Function to refresh data */
  refresh: () => Promise<T | undefined>;
  /** Function to clear error state */
  clearError: () => void;
  /** Function to clear data */
  clearData: () => void;
  /** Timestamp of last successful fetch */
  lastFetchedAt: Date | null;
}

/**
 * A generic hook for data fetching with loading and error states.
 * 
 * @param url The API endpoint URL
 * @param options Configuration options for the hook
 * @returns Object containing data, loading state, error state, and utility functions
 * 
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useData('/api/sales');
 * 
 * @example
 * // With options
 * const { data, isLoading, error, refresh } = useData('/api/sales', {
 *   initialData: [],
 *   fetchOnMount: true,
 *   retry: true,
 *   pollingInterval: 60000, // 1 minute
 * });
 */
export function useData<T = any>(
  url: string,
  options: UseDataOptions<T> = {}
): UseDataResult<T> {
  // Default options
  const {
    initialData,
    fetchOnMount = true,
    retry = false,
    maxRetries = 3,
    customFetch,
    cacheKey,
    errorTransform = (error: ApiError) => error.message,
    dataTransform = (data: any) => data as T,
    onSuccess,
    onError,
    pollingInterval = 0,
    dependencies = []
  } = options;

  // State
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [pollingTimeout, setPollingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Fetch data function
  const fetchData = useCallback(async (): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: T;
      
      if (customFetch) {
        result = await customFetch();
      } else {
        // Use retry wrapper if retry is enabled
        const fetchFunction = async () => {
          const response = await api.get<T>(url);
          return response.data;
        };
        
        if (retry) {
          result = await retryRequest(fetchFunction, maxRetries);
        } else {
          result = await fetchFunction();
        }
      }
      
      // Transform data if a transform function is provided
      const transformedData = dataTransform(result);
      
      setData(transformedData);
      setLastFetchedAt(new Date());
      
      if (onSuccess) {
        onSuccess(transformedData);
      }
      
      return transformedData;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = errorTransform(apiError);
      
      setError(errorMessage);
      
      if (onError) {
        onError(apiError);
      }
      
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [url, customFetch, retry, maxRetries, dataTransform, errorTransform, onSuccess, onError]);

  // Set up polling
  const startPolling = useCallback(() => {
    if (pollingInterval <= 0) return;
    
    const timeout = setTimeout(() => {
      fetchData().finally(() => {
        startPolling();
      });
    }, pollingInterval);
    
    setPollingTimeout(timeout);
  }, [fetchData, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      setPollingTimeout(null);
    }
  }, [pollingTimeout]);

  // Fetch on mount or when dependencies change
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
    
    // Start polling if enabled
    if (pollingInterval > 0) {
      startPolling();
    }
    
    // Clean up
    return () => {
      stopPolling();
    };
  }, [fetchOnMount, fetchData, pollingInterval, startPolling, stopPolling, ...dependencies]);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    fetch: fetchData,
    refresh: fetchData,
    clearError,
    clearData,
    lastFetchedAt,
  };
}

export default useData;