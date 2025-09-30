import React from 'react';
import { FaSpinner, FaDatabase, FaServer } from 'react-icons/fa';

const LoadingState = ({ message = 'Loading...', description = null, type = 'default', className = '' }) => {
  // Handle different loading types
  const getLoadingIcon = () => {
    switch (type) {
      case 'database':
        return <FaDatabase className="animate-pulse text-4xl text-teal-500" />;
      case 'server':
        return <FaServer className="animate-pulse text-4xl text-orange-500" />;
      default:
        return (
          <div className="relative h-12 w-12 mx-auto">
            <FaSpinner className="animate-spin text-4xl text-teal-600 absolute inset-0" />
            <div className="h-12 w-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin absolute inset-0"></div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-teal-50 ${className}`}>
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        {getLoadingIcon()}
        
        <p className="text-xl font-semibold text-teal-800 mt-4 mb-2">{message}</p>
        
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
        
        <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-teal-600 h-1.5 rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;