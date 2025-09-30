import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
// Pages
import DatabaseMetadataPage from './pages/DatabaseMetadataPage';
import ConnectionPage from './pages/ConnectionPage';
import NotFoundPage from './pages/NotFoundPage';
import WelcomePage from './pages/WelcomePage';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';
// Context Providers
import { ErrorProvider } from './contexts/ErrorContext';
import { ConnectionProvider, useConnection } from './contexts/ConnectionContext';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  
  useEffect(() => {
    // Check if the user has already visited the app
    const hasVisited = localStorage.getItem('sp-generator-visited');
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);
  
  const handleStartApp = () => {
    // Mark as visited in localStorage
    localStorage.setItem('sp-generator-visited', 'true');
    setShowWelcome(false);
  };

  // If showing welcome page, render it instead of the router
  if (showWelcome) {
    return <WelcomePage onStart={handleStartApp} />;
  }

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ErrorProvider>
        <ConnectionProvider>
          <AppRoutes />
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
  
  // If there's already an active connection, redirect to database page
  if (activeConnection) {
    return <Navigate to="/database" replace />;
  }
  
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
    <Router>
      <Routes>
        {/* Landing page - redirect to connect page if needed */}
        <Route path="/" element={
          <ConnectionRedirect>
            <Navigate to="/connect" replace />
          </ConnectionRedirect>
        } />
        
        {/* Landing page content */}
        <Route path="/welcome" element={<LandingPage />} />

        {/* Connection page - redirect to database if already connected */}
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
        <Route path="/explorer" element={<Navigate to="/database" replace />} />
        <Route path="/sp-generator" element={<Navigate to="/database" replace />} />

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
