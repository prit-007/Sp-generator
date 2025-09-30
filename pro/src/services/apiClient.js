import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_API_URL || "https://localhost:7197/api";

console.log("API URL:", API_URL); // Debugging line

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    const errorInfo = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
      timestamp: new Date().toISOString()
    };

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorInfo.message = data?.message || data?.error || 'Bad request. Please check your input.';
          break;
        case 401:
          errorInfo.message = 'Unauthorized. Please check your credentials.';
          break;
        case 403:
          errorInfo.message = 'Access forbidden. You don\'t have permission to perform this action.';
          break;
        case 404:
          errorInfo.message = 'Resource not found. The requested item doesn\'t exist.';
          break;
        case 408:
          errorInfo.message = 'Request timeout. Please try again.';
          break;
        case 429:
          errorInfo.message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorInfo.message = data?.message || 'Internal server error. Please try again later.';
          break;
        case 502:
          errorInfo.message = 'Bad gateway. The server is temporarily unavailable.';
          break;
        case 503:
          errorInfo.message = 'Service unavailable. Please try again later.';
          break;
        default:
          errorInfo.message = data?.message || data?.error || `Server error (${status})`;
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        errorInfo.message = 'Request timeout. Please check your connection and try again.';
      } else {
        errorInfo.message = 'Network error. Please check your internet connection.';
      }
    } else {
      // Something else happened
      errorInfo.message = error.message || 'An unexpected error occurred.';
    }

    // Log error
    console.error('API Error:', errorInfo);

    // Attach error info to the error object
    error.errorInfo = errorInfo;
    
    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  // GET request with error handling
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error.errorInfo || error;
    }
  },

  // Fetch database metadata
  fetchDatabaseMetadata: async () => {
    try {
      console.log('Fetching database metadata from:', API_URL + '/Database/metadata');
      const response = await apiClient.get('/Database/metadata');
      console.log('Database metadata response:', response);
      
      if (response.data && response.data.data) {
        // Check if the data is a JSON string that needs to be parsed
        if (typeof response.data.data === 'string') {
          try {
            return JSON.parse(response.data.data);
          } catch (parseError) {
            console.error('Failed to parse metadata JSON:', parseError);
            return {};
          }
        }
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        console.warn('Database metadata response was empty or improperly formatted', response);
        return {};
      }
    } catch (error) {
      console.error('Error fetching database metadata:', error);
      throw error.errorInfo || error;
    }
  },

  // POST request with error handling
  post: async (url, data, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error.errorInfo || error;
    }
  },

  // PUT request with error handling
  put: async (url, data, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error.errorInfo || error;
    }
  },

  // DELETE request with error handling
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error.errorInfo || error;
    }
  },

  // Test connection with retry
  testConnection: async (connectionString, retries = 1) => {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await apiClient.post('/Database/connect', { connectionString });
        
        // Ensure we have a properly formatted response
        return {
          success: response.data && response.data.success !== undefined ? response.data.success : true,
          message: response.data && response.data.message ? response.data.message : 'Connection successful',
          data: response.data && response.data.data ? response.data.data : {
            isConnected: true,
            serverVersion: response.data && response.data.serverVersion ? response.data.serverVersion : 'Unknown',
            databaseName: response.data && response.data.databaseName ? response.data.databaseName : 'Unknown'
          }
        };
      } catch (error) {
        console.error('Connection error:', error);
        lastError = error;
        
        if (i < retries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    // Format the error properly to avoid [object Object] errors
    const errorMessage = lastError?.message || 'Connection failed';
    const formattedError = {
      message: errorMessage,
      status: lastError?.response?.status,
      statusText: lastError?.response?.statusText,
      data: lastError?.response?.data,
      isNetworkError: !lastError?.response,
      isTimeout: lastError?.code === 'ECONNABORTED',
      timestamp: new Date().toISOString()
    };
    
    throw formattedError;
  }
};

// Error notification helper
export const showErrorNotification = (error, options = {}) => {
  const {
    title = 'Error',
    showRetry = false,
    onRetry = null,
    position = 'center'
  } = options;

  const swalOptions = {
    title,
    text: error.message || 'An unexpected error occurred',
    icon: 'error',
    position,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626'
  };

  if (showRetry && onRetry) {
    swalOptions.showCancelButton = true;
    swalOptions.cancelButtonText = 'Retry';
    swalOptions.cancelButtonColor = '#059669';
  }

  return Swal.fire(swalOptions).then((result) => {
    if (result.dismiss === Swal.DismissReason.cancel && onRetry) {
      onRetry();
    }
  });
};

export default apiClient;
