import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { showErrorNotification } from '../services/apiClient';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  AUTHENTICATION: 'AUTHENTICATION',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Initial state
const initialState = {
  errors: [],
  globalError: null,
  isOnline: navigator.onLine
};

// Action types
const ACTION_TYPES = {
  ADD_ERROR: 'ADD_ERROR',
  REMOVE_ERROR: 'REMOVE_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_GLOBAL_ERROR: 'SET_GLOBAL_ERROR',
  CLEAR_GLOBAL_ERROR: 'CLEAR_GLOBAL_ERROR',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS'
};

// Reducer
const errorReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, { ...action.payload, id: Date.now() }]
      };
    
    case ACTION_TYPES.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };
    
    case ACTION_TYPES.CLEAR_ERRORS:
      return {
        ...state,
        errors: []
      };
    
    case ACTION_TYPES.SET_GLOBAL_ERROR:
      return {
        ...state,
        globalError: action.payload
      };
    
    case ACTION_TYPES.CLEAR_GLOBAL_ERROR:
      return {
        ...state,
        globalError: null
      };
    
    case ACTION_TYPES.SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const ErrorContext = createContext();

// Error provider component
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Add error
  const addError = useCallback((error, options = {}) => {
    const {
      type = ERROR_TYPES.UNKNOWN,
      severity = ERROR_SEVERITY.MEDIUM,
      component = null,
      showNotification = true,
      autoRemove = true,
      autoRemoveDelay = 5000
    } = options;

    const errorObj = {
      message: error.message || error,
      type,
      severity,
      component,
      timestamp: new Date().toISOString(),
      details: error.details || null,
      status: error.status || null
    };

    dispatch({
      type: ACTION_TYPES.ADD_ERROR,
      payload: errorObj
    });

    // Show notification if requested
    if (showNotification && severity !== ERROR_SEVERITY.LOW) {
      showErrorNotification(errorObj, {
        title: getErrorTitle(type, severity),
        position: severity === ERROR_SEVERITY.CRITICAL ? 'center' : 'top-end'
      });
    }

    // Auto remove error after delay
    if (autoRemove) {
      setTimeout(() => {
        removeError(errorObj.id);
      }, autoRemoveDelay);
    }

    return errorObj.id;
  }, []);

  // Remove error
  const removeError = useCallback((errorId) => {
    dispatch({
      type: ACTION_TYPES.REMOVE_ERROR,
      payload: errorId
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERRORS });
  }, []);

  // Set global error
  const setGlobalError = useCallback((error) => {
    dispatch({
      type: ACTION_TYPES.SET_GLOBAL_ERROR,
      payload: error
    });
  }, []);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_GLOBAL_ERROR });
  }, []);

  // Handle network status
  const setOnlineStatus = useCallback((isOnline) => {
    dispatch({
      type: ACTION_TYPES.SET_ONLINE_STATUS,
      payload: isOnline
    });
  }, []);

  // Helper function to get error title based on type and severity
  const getErrorTitle = (type, severity) => {
    const severityPrefix = severity === ERROR_SEVERITY.CRITICAL ? 'Critical ' : '';
    
    switch (type) {
      case ERROR_TYPES.NETWORK:
        return `${severityPrefix}Network Error`;
      case ERROR_TYPES.VALIDATION:
        return `${severityPrefix}Validation Error`;
      case ERROR_TYPES.SERVER:
        return `${severityPrefix}Server Error`;
      case ERROR_TYPES.AUTHENTICATION:
        return `${severityPrefix}Authentication Error`;
      case ERROR_TYPES.PERMISSION:
        return `${severityPrefix}Permission Error`;
      case ERROR_TYPES.NOT_FOUND:
        return `${severityPrefix}Not Found`;
      case ERROR_TYPES.TIMEOUT:
        return `${severityPrefix}Timeout Error`;
      default:
        return `${severityPrefix}Error`;
    }
  };

  // Context value
  const value = {
    ...state,
    addError,
    removeError,
    clearErrors,
    setGlobalError,
    clearGlobalError,
    setOnlineStatus
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Custom hook to use error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;
