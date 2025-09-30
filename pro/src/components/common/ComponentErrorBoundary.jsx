import React from 'react';
import { FaExclamationCircle, FaRedo, FaBug } from 'react-icons/fa';

class ComponentErrorBoundary extends React.Component {
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
    return { 
      hasError: true,
      errorId: `comp_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.componentName || 'Component'}:`, error, errorInfo);
    this.setState({ 
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { componentName = 'Component', className = '', showDetails = false } = this.props;
      
      return (
        <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
          <div className="flex items-center text-orange-600 mb-3">
            <FaExclamationCircle className="mr-2 text-xl" />
            <span className="font-medium">{componentName} Error</span>
          </div>
          
          <p className="text-orange-700 mb-3">
            This component encountered an error and couldn't render properly.
          </p>
          
          {this.state.errorId && (
            <div className="bg-white rounded p-2 mb-3 text-xs text-gray-600">
              <strong>Error ID:</strong> {this.state.errorId}
            </div>
          )}
          
          <button
            onClick={this.handleRetry}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200"
          >
            <FaRedo className="mr-2" />
            Retry Component
          </button>
          
          {showDetails && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 flex items-center">
                <FaBug className="mr-2" />
                Technical Details
              </summary>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono overflow-auto max-h-40">
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
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
