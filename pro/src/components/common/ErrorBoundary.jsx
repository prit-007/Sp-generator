import React from 'react';
import ErrorState from './ErrorState';
import { FaBug } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In a real application, you would send this to your error tracking service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // For now, just log to console
    console.error('Error logged:', errorData);
    
    // Example: Send to error tracking service
    // errorTrackingService.logError(errorData);
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showDetails = false } = this.props;
      
      // If a custom fallback is provided, use it
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Convert error to format expected by ErrorState
      const errorObject = {
        message: this.state.error?.message || 'An unexpected error occurred',
        status: 500,
        statusText: 'Internal Application Error',
        timestamp: new Date().toISOString(),
        data: {
          errorId: this.state.errorId,
          componentStack: this.state.errorInfo?.componentStack
        }
      };

      // Return ErrorState with additional technical details if needed
      return (
        <>
          <ErrorState 
            error={errorObject}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
            className="flex-grow"
          />
          
          {showDetails && this.state.error && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 p-4">
              <details className="text-left max-w-4xl mx-auto">
                <summary className="cursor-pointer text-sm text-gray-700 hover:text-gray-900 flex items-center">
                  <FaBug className="mr-2" />
                  Technical Details
                </summary>
                <div className="mt-3 p-3 bg-white rounded text-xs font-mono overflow-auto max-h-60">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
