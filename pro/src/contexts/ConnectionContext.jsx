import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Create a context
const ConnectionContext = createContext();

// Provider component
export const ConnectionProvider = ({ children }) => {
  const [activeConnection, setActiveConnection] = useState(null);
  const [connectionHistory, setConnectionHistory] = useState([]);
  const [savedConnections, setSavedConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load connections from localStorage on mount
  useEffect(() => {
    try {
      const active = localStorage.getItem('activeConnection');
      const history = localStorage.getItem('recentConnections');
      const saved = localStorage.getItem('dbConnections');
      
      if (active) {
        try {
          // Try to parse it in case it's a stringified object
          const parsedActive = JSON.parse(active);
          
          if (typeof parsedActive === 'object' && parsedActive !== null) {
            // If it has connectionString property, extract it
            if (parsedActive.connectionString) {
              setActiveConnection(parsedActive.connectionString);
              console.log("Connection extracted from object:", parsedActive.connectionString);
            } else {
              // Otherwise stringify the whole object
              setActiveConnection(JSON.stringify(parsedActive));
              console.log("Connection parsed as object and stringified");
            }
          } else {
            // It's already a string representation
            setActiveConnection(active);
            console.log("Connection already in string form");
          }
        } catch (e) {
          // If it's not valid JSON, it's already a string
          setActiveConnection(active);
          console.log("Connection parsed as string:", active);
        }
      } else {
        console.log("No active connection found in localStorage");
      }
      
      if (history) {
        const parsedHistory = JSON.parse(history);
        // Ensure all connection strings are actually strings
        const normalizedHistory = parsedHistory.map(item => ({
          ...item,
          connectionString: typeof item.connectionString === 'object' ? 
            JSON.stringify(item.connectionString) : item.connectionString
        }));
        setConnectionHistory(normalizedHistory);
      }
      
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        // Ensure all connection strings are actually strings
        const normalizedSaved = parsedSaved.map(item => ({
          ...item,
          connectionString: typeof item.connectionString === 'object' ? 
            JSON.stringify(item.connectionString) : item.connectionString
        }));
        setSavedConnections(normalizedSaved);
      }
    } catch (error) {
      console.error('Error loading connection data from localStorage:', error);
      toast.error('Failed to load saved connection data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      if (activeConnection) {
        localStorage.setItem('activeConnection', activeConnection);
      }
      
      localStorage.setItem('recentConnections', JSON.stringify(connectionHistory));
      localStorage.setItem('dbConnections', JSON.stringify(savedConnections));
    }
  }, [activeConnection, connectionHistory, savedConnections, isLoading]);

  // Set active connection and update history
  const setConnection = (connectionString, connectionContext = null) => {
    if (!connectionString) {
      return;
    }
    
    let connectionValue;
    let connectionName = 'Unnamed Connection';
    let metadata = {};
    
    // Handle different input formats
    if (typeof connectionString === 'object' && connectionString !== null) {
      // If it's an object with a connectionString property
      if (connectionString.connectionString) {
        connectionValue = connectionString.connectionString;
        
        // Extract metadata from context if available
        if (connectionString.connectionContext) {
          connectionName = connectionString.connectionContext.name || 'Unnamed Connection';
          metadata = connectionString.connectionContext;
        }
      } else {
        // Otherwise stringify the whole object
        connectionValue = JSON.stringify(connectionString);
      }
    } else {
      // It's already a string
      connectionValue = connectionString;
    }
    
    // If connectionContext is explicitly provided, use it
    if (connectionContext) {
      connectionName = connectionContext.name || connectionName;
      metadata = connectionContext;
    }
    
    // Set active connection
    setActiveConnection(connectionValue);
    
    // Update history
    const connectionEntry = {
      connectionString: connectionValue,
      name: connectionName,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    // Add to beginning of history, remove duplicates, limit to 5 entries
    setConnectionHistory(prev => [
      connectionEntry,
      ...prev.filter(conn => conn.connectionString !== connectionValue)
    ].slice(0, 5));
  };

  // Save a connection
  const saveConnection = (connectionString, connectionName) => {
    if (!connectionString || !connectionName) {
      toast.error('Connection string and name are required');
      return false;
    }
    
    // Check if connection already exists
    const existingIndex = savedConnections.findIndex(
      conn => conn.connectionString === connectionString
    );
    
    if (existingIndex >= 0) {
      // Update existing connection
      const updated = [...savedConnections];
      updated[existingIndex] = {
        ...updated[existingIndex],
        name: connectionName,
        updatedAt: new Date().toISOString()
      };
      
      setSavedConnections(updated);
      toast.success('Connection updated successfully');
    } else {
      // Add new connection
      setSavedConnections([
        ...savedConnections,
        {
          connectionString,
          name: connectionName,
          createdAt: new Date().toISOString()
        }
      ]);
      toast.success('Connection saved successfully');
    }
    
    return true;
  };

  // Delete a saved connection
  const deleteConnection = (connectionString) => {
    setSavedConnections(prev => 
      prev.filter(conn => conn.connectionString !== connectionString)
    );
    toast.success('Connection deleted successfully');
  };

  // Clear active connection
  const clearActiveConnection = () => {
    setActiveConnection(null);
    localStorage.removeItem('activeConnection');
  };

  // Value to be provided
  const contextValue = {
    activeConnection,
    connectionHistory,
    savedConnections,
    isLoading,
    setConnection,
    saveConnection,
    deleteConnection,
    clearActiveConnection
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

// Custom hook to use the context
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export default ConnectionContext;