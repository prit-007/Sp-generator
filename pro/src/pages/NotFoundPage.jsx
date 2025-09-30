import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorState from '../components/common/ErrorState';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const notFoundError = {
    status: 404,
    message: 'The page you are looking for doesn\'t exist or has been moved.',
    timestamp: new Date().toISOString()
  };

  return (
    <ErrorState 
      error={notFoundError}
      onGoHome={() => navigate('/')}
    />
  );
};

export default NotFoundPage;