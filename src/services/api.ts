import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';

// Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  status?: number;
  message: string;
  data?: any;
  isAxiosError: boolean;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
  skipErrorHandling?: boolean;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Creates a configured Axios instance with interceptors for authentication and error handling
 */
export const createApiClient = (baseURL: string = API_BASE_URL): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for authentication
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // Get token from storage
      const token = localStorage.getItem('auth_token');
      
      // Add token to headers if it exists
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  apiClient.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    async (error: AxiosError): Promise<any> => {
      const originalRequest = error.config as ApiRequestConfig;
      
      // Don't retry if we've already retried or if the request is configured to skip auth refresh
      if (!originalRequest || originalRequest.skipAuthRefresh) {
        return handleApiError(error);
      }

      // Handle 401 Unauthorized - Token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Attempt to refresh the token
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (!refreshToken) {
            // No refresh token available, redirect to login
            handleAuthError();
            return Promise.reject(error);
          }
          
          // Call the refresh token endpoint
          const response = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          
          // Update tokens in storage
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('auth_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Update the authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          handleAuthError();
          return Promise.reject(refreshError);
        }
      }
      
      return handleApiError(error);
    }
  );
  
  return apiClient;
};

/**
 * Handle authentication errors by clearing tokens and redirecting to login
 */
const handleAuthError = (): void => {
  // Clear tokens
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  // Dispatch event for auth error handling
  window.dispatchEvent(new CustomEvent('auth:error'));
  
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Transform Axios error into a consistent API error format
 */
const handleApiError = (error: AxiosError): Promise<ApiError> => {
  const { response, request, message } = error;
  
  // Response error (server responded with an error status)
  if (response) {
    const apiError: ApiError = {
      status: response.status,
      message: (response.data as any)?.message || response.statusText,
      data: response.data,
      isAxiosError: true
    };
    
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', apiError);
    }
    
    return Promise.reject(apiError);
  }
  
  // Request error (request was made but no response received)
  if (request) {
    return Promise.reject({
      status: 0,
      message: 'No response received from server. Please check your connection.',
      isAxiosError: true
    });
  }
  
  // Setup error (request was not made)
  return Promise.reject({
    message: message || 'Unknown error occurred',
    isAxiosError: true
  });
};

// Create default API client
export const apiClient = createApiClient();

/**
 * Generic API request handler with type safety
 */
export const apiRequest = async <T>(config: ApiRequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  } catch (error) {
    throw error;
  }
};

/**
 * API helper methods with type safety
 */
export const api = {
  get: <T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'get', url });
  },
  
  post: <T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'post', url, data });
  },
  
  put: <T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'put', url, data });
  },
  
  patch: <T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'patch', url, data });
  },
  
  delete: <T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'delete', url });
  }
};

/**
 * Retry API request with exponential backoff
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let retries = 0;
  
  const executeRequest = async (): Promise<T> => {
    try {
      return await requestFn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, retries);
      
      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increment retry counter
      retries++;
      
      // Retry the request
      return executeRequest();
    }
  };
  
  return executeRequest();
};