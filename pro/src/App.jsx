import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
// Pages
import DatabaseMetadataPage from './pages/DatabaseMetadataPage';
import ConnectionPage from './pages/ConnectionPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';
// Context Providers
import { ErrorProvider } from './contexts/ErrorContext';
import { ConnectionProvider, useConnection } from './contexts/ConnectionContext';

function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ErrorProvider>
        <ConnectionProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ConnectionProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

// Create a protected route component that redirects based on connection state
const ProtectedRoute = ({ children }) => {
  const { activeConnection, isLoading } = useConnection();
  
  // If loading, show a loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Verifying connection details...</p>
      </div>
    </div>;
  }
  
  // If no active connection, redirect to the connection page
  if (!activeConnection) {
    return <Navigate to="/connect" replace />;
  }
  
  return children;
};

// Create a connection redirect component to handle redirection when connection exists
// We're not forcing redirection anymore to allow for connection changes
const ConnectionRedirect = ({ children }) => {
  const { activeConnection, isLoading } = useConnection();
  
  // If loading, show a loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading connection details...</p>
      </div>
    </div>;
  }
  
  // We removed the redirect to allow users to change connections
  // if they want to, even with an active connection
  
  return children;
};

// Separate component for routes to use the connection context
const AppRoutes = () => {
  // Check if we need to trigger a connection
  useEffect(() => {
    // Clear any API errors that might be cached
    console.log('App routes mounted, checking connection status');
  }, []);

  return (
    <Routes>
      {/* Landing page - Enhanced landing page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Connection page */}
      <Route path="/connect" element={
        <ConnectionRedirect>
          <ConnectionPage />
        </ConnectionRedirect>
      } />

      {/* Database explorer with all functionality - protected route */}
      <Route path="/database/*" element={
        <ProtectedRoute>
          <DatabaseMetadataPage />
        </ProtectedRoute>
      } />
      
      {/* Settings page */}
      <Route path="/settings" element={<Settings />} />

      {/* Redirect legacy routes if any */}
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/explorer" element={<Navigate to="/database" replace />} />
      <Route path="/sp-generator" element={<Navigate to="/database" replace />} />

      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
