import React from 'react';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2 text-orange-800">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorState;