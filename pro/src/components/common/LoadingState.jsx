import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-xl font-semibold text-teal-800">Loading database metadata...</p>
      </div>
    </div>
  );
};

export default LoadingState;