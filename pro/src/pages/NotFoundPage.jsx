import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <FaExclamationTriangle className="text-orange-500 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-teal-800 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-teal-700 mb-6">Page Not Found</h2>
        <p className="text-teal-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <FaHome className="mr-2" />
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;