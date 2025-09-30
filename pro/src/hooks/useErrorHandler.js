import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsync = useCallback(async (asyncFunction, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      showLoading = true,
      retryCount = 0,
      retryDelay = 1000 
    } = options;

    if (showLoading) setIsLoading(true);
    setError(null);

    let attempt = 0;
    
    while (attempt <= retryCount) {
      try {
        const result = await asyncFunction();
        
        if (showLoading) setIsLoading(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        attempt++;
        
        if (attempt <= retryCount) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // All retries exhausted
        console.error('Error in handleAsync:', err);
        
        // Format the error to ensure it's an object with message
        let errorInfo;
        if (typeof err === 'string') {
          errorInfo = {
            message: err,
            timestamp: new Date().toISOString(),
            attempts: attempt
          };
        } else {
          errorInfo = {
            message: err.message || err.toString() || 'An unexpected error occurred',
            status: err.status || err.response?.status,
            statusText: err.statusText || err.response?.statusText,
            data: err.data || err.response?.data,
            timestamp: new Date().toISOString(),
            attempts: attempt
          };
        }
        
        setError(errorInfo);
        if (showLoading) setIsLoading(false);
        
        if (onError) {
          onError(errorInfo);
        }
        
        return errorInfo; // Return instead of throw to prevent unhandled rejections
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback((asyncFunction, options = {}) => {
    return handleAsync(asyncFunction, options);
  }, [handleAsync]);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    retry
  };
};

export default useErrorHandler;
