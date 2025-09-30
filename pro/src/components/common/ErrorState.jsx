import React, { useState } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome, FaWifi, FaServer, FaClock, FaInfoCircle } from 'react-icons/fa';

const ErrorState = ({ error, onRetry, onGoHome, className = "" }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Determine error type and icon
  const getErrorIcon = () => {
    if (typeof error === 'string') return <FaExclamationTriangle />;

    if (error?.isNetworkError) return <FaWifi />;
    if (error?.isTimeout) return <FaClock />;
    if (error?.status >= 500) return <FaServer />;

    return <FaExclamationTriangle />;
  };

  const getErrorTitle = () => {
    if (typeof error === 'string') return 'Error';

    if (error?.isNetworkError) return 'Connection Error';
    if (error?.isTimeout) return 'Timeout Error';
    if (error?.status >= 500) return 'Server Error';
    if (error?.status === 404) return 'Not Found';
    if (error?.status === 401) return 'Unauthorized';
    if (error?.status === 403) return 'Access Denied';

    return 'Error';
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    return error?.message || 'An unexpected error occurred';
  };

  const getErrorSuggestion = () => {
    if (typeof error === 'string') return 'Please try again or contact support if the problem persists.';

    if (error?.isNetworkError) {
      return 'Please check your internet connection and try again.';
    }
    if (error?.isTimeout) {
      return 'The request took too long to complete. Please try again.';
    }
    if (error?.status >= 500) {
      return 'There seems to be a server issue. Please try again in a few moments.';
    }
    if (error?.status === 404) {
      return 'The requested resource could not be found.';
    }
    if (error?.status === 401) {
      return 'Please check your credentials and try again.';
    }
    if (error?.status === 403) {
      return 'You don\'t have permission to access this resource.';
    }

    return 'Please try again or contact support if the problem persists.';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-orange-50 p-4 ${className}`}>
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="text-red-500 text-6xl mb-4 flex justify-center">
          {getErrorIcon()}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-orange-800">
          {getErrorTitle()}
        </h2>

        <p className="text-gray-700 mb-4 leading-relaxed">
          {getErrorMessage()}
        </p>

        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {getErrorSuggestion()}
        </p>

        {/* Error details */}
        {error && typeof error === 'object' && (error.status || error.timestamp) && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center mx-auto text-sm text-gray-500 hover:text-gray-700 transition duration-200"
            >
              <FaInfoCircle className="mr-2" />
              {showDetails ? 'Hide' : 'Show'} Details
            </button>

            {showDetails && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-left text-sm">
                {error.status && (
                  <div className="mb-2">
                    <strong>Status:</strong> {error.status} {error.statusText}
                  </div>
                )}
                {error.timestamp && (
                  <div className="mb-2">
                    <strong>Time:</strong> {new Date(error.timestamp).toLocaleString()}
                  </div>
                )}
                {error.data && (
                  <div>
                    <strong>Details:</strong> {JSON.stringify(error.data, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
            >
              <FaRedo className="mr-2" />
              Try Again
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200 font-medium"
            >
              <FaHome className="mr-2" />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;