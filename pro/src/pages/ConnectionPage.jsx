import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaDatabase, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaServer, FaUser, FaLock, FaShieldAlt, FaCog, FaHistory,
  FaInfoCircle, FaLink, FaStar, FaCheckCircle, FaTimesCircle,
  FaQuestion, FaArrowRight, FaArrowLeft, FaSave, FaCopy,
  FaCodeBranch, FaChartLine, FaNetworkWired
} from 'react-icons/fa';
import { RiTestTubeFill } from "react-icons/ri";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import { BsDiagram3Fill } from "react-icons/bs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiHelpers } from '../services/apiClient';
import useErrorHandler from '../hooks/useErrorHandler';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import ComponentErrorBoundary from '../components/common/ComponentErrorBoundary';
import useClipboardAndDownload from '../components/custom-hooks/useClipboardAndDownload';
import Sidebar from '../components/layout/Sidebar';
import { useConnection } from '../contexts/ConnectionContext';

const ConnectionPage = () => {
  // State management
  const [connections, setConnections] = useState([]);
  const [newConnectionString, setNewConnectionString] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('component'); // 'full' or 'component'
  const [server, setServer] = useState('');
  const [database, setDatabase] = useState('');
  const [useIntegratedSecurity, setUseIntegratedSecurity] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [trustServerCertificate, setTrustServerCertificate] = useState(true);
  const [additionalParams, setAdditionalParams] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recentConnections, setRecentConnections] = useState([]);
  const [connectionResult, setConnectionResult] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpSection, setHelpSection] = useState('general');
  const [showRecentPanel, setShowRecentPanel] = useState(true);
  const [showSavedPanel, setShowSavedPanel] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [connectionStringPreview, setConnectionStringPreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [connectionStats, setConnectionStats] = useState({ total: 0, recent: 0, successful: 0 });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [connectionTips, setConnectionTips] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  // References
  const serverInputRef = useRef(null);
  const connectionNameInputRef = useRef(null);
  const formRef = useRef(null);

  // Hooks
  const navigate = useNavigate();
  const { handleAsync, error, isLoading, clearError } = useErrorHandler();
  const { copyToClipboard } = useClipboardAndDownload();
  const { setConnection } = useConnection();

  // Tooltip helper function
  const renderTooltip = (id, text) => (
    <span 
      className="ml-1 text-gray-400 hover:text-teal-500 cursor-help transition-colors"
      onMouseEnter={() => setActiveTooltip(id)}
      onMouseLeave={() => setActiveTooltip(null)}
    >
      <FaInfoCircle size={14} />
      {activeTooltip === id && (
        <div className="absolute z-50 w-64 bg-gray-800 text-white text-xs rounded p-2 shadow-lg mt-1">
          {text}
        </div>
      )}
    </span>
  );

  // Load saved connections from localStorage on component mount
  useEffect(() => {
    const savedConnections = localStorage.getItem('dbConnections');
    if (savedConnections) {
      try {
        setConnections(JSON.parse(savedConnections));
      } catch (error) {
        console.error("Failed to parse saved connections:", error);
        // Reset to empty array if parsing fails
        setConnections([]);
        toast.error("Failed to load saved connections");
      }
    }

    // Load recent connections
    const recentConns = localStorage.getItem('recentConnections');
    if (recentConns) {
      try {
        setRecentConnections(JSON.parse(recentConns));
      } catch (error) {
        console.error("Failed to parse recent connections:", error);
        setRecentConnections([]);
        toast.error("Failed to load recent connections");
      }
    }

    // Focus on server input if it's the active tab
    setTimeout(() => {
      try {
        if (activeTab === 'component' && serverInputRef.current) {
          serverInputRef.current.focus();
        } else if (connectionNameInputRef.current) {
          connectionNameInputRef.current.focus();
        }
      } catch (e) {
        console.log('Focus error handled:', e.message);
      }
    }, 100);
  }, []);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dbConnections', JSON.stringify(connections));
  }, [connections]);

  // Save recent connections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recentConnections', JSON.stringify(recentConnections));
  }, [recentConnections]);

  // Filter connections based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = connections.filter(conn => 
        conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.connectionString.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [connections, searchQuery]);

  // Update connection statistics
  useEffect(() => {
    setConnectionStats({
      total: connections.length,
      recent: recentConnections.length,
      successful: connections.filter(conn => conn.lastTestResult === 'success').length
    });
  }, [connections, recentConnections]);

  // Update connection string preview whenever form fields change
  useEffect(() => {
    if (activeTab === 'component') {
      setConnectionStringPreview(buildConnectionString());
    }
  }, [server, database, useIntegratedSecurity, userId, password, trustServerCertificate, additionalParams, activeTab]);

  // Reset the form when editIndex changes to -1
  useEffect(() => {
    if (editIndex === -1) {
      // Only reset if we were editing and now we're not
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [editIndex]);

  // Build connection string from components
  const buildConnectionString = () => {
    if (!server && !database) return '';

    let connStr = `Data Source=${server || '[server]'};Initial Catalog=${database || '[database]'};`;

    if (useIntegratedSecurity) {
      connStr += "Integrated Security=true;";
    } else if (userId) {
      connStr += `User Id=${userId};Password=${password || '[password]'};`;
    } else {
      connStr += `User Id=[userId];Password=[password];`;
    }

    connStr += `TrustServerCertificate=${trustServerCertificate};`;

    if (additionalParams && additionalParams.trim() !== '') {
      // Make sure there's a semicolon before additional params if they don't start with one
      if (!additionalParams.trim().startsWith(';') && !connStr.endsWith(';')) {
        connStr += ';';
      }
      connStr += additionalParams;
    }

    // Ensure the string ends with a semicolon
    if (!connStr.endsWith(';')) {
      connStr += ';';
    }

    return connStr;
  };

  // Handle add/update connection
  const handleAddConnection = () => {
    if (!validateConnectionForm()) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    let finalConnectionString = newConnectionString;

    if (activeTab === 'component') {
      finalConnectionString = buildConnectionString();
    }

    const newConnection = {
      name: connectionName,
      connectionString: finalConnectionString,
      createdAt: new Date().toISOString(),
    };

    if (editIndex >= 0) {
      // Update existing connection
      const updatedConnections = [...connections];
      updatedConnections[editIndex] = {
        ...newConnection,
        updatedAt: new Date().toISOString()
      };
      setConnections(updatedConnections);
      setEditIndex(-1);
      toast.success('Connection updated successfully!');
    } else {
      // Add new connection
      setConnections([...connections, newConnection]);
      toast.success('Connection added successfully!');
    }

    // Reset form
    resetForm();
  };

  // Reset the form fields
  const resetForm = () => {
    setNewConnectionString('');
    setConnectionName('');
    setServer('');
    setDatabase('');
    setUseIntegratedSecurity(false);
    setUserId('');
    setPassword('');
    setAdditionalParams('');
    setConnectionResult(null);
    setEditIndex(-1);
  };

  // Handle edit connection
  const handleEditConnection = (index) => {
    const connection = connections[index];
    setConnectionName(connection.name);
    setNewConnectionString(connection.connectionString);
    setEditIndex(index);

    // Try to parse the connection string for component view
    if (connection.connectionString) {
      try {
        const connStr = connection.connectionString;

        // Extract server/data source
        const serverMatch = connStr.match(/Data Source=([^;]+)/i);
        if (serverMatch && serverMatch[1]) {
          setServer(serverMatch[1]);
        }

        // Extract database/initial catalog
        const dbMatch = connStr.match(/Initial Catalog=([^;]+)/i);
        if (dbMatch && dbMatch[1]) {
          setDatabase(dbMatch[1]);
        }

        // Check for integrated security
        const integratedSecurityMatch = connStr.match(/Integrated Security=(true|SSPI)/i);
        setUseIntegratedSecurity(!!integratedSecurityMatch);

        // Extract user id and password if not using integrated security
        if (!integratedSecurityMatch) {
          const userIdMatch = connStr.match(/User Id=([^;]+)/i);
          if (userIdMatch && userIdMatch[1]) {
            setUserId(userIdMatch[1]);
          }

          const passwordMatch = connStr.match(/Password=([^;]+)/i);
          if (passwordMatch && passwordMatch[1]) {
            setPassword(passwordMatch[1]);
          }
        }

        // Extract trust server certificate
        const trustCertMatch = connStr.match(/TrustServerCertificate=(true|false)/i);
        if (trustCertMatch && trustCertMatch[1]) {
          setTrustServerCertificate(trustCertMatch[1].toLowerCase() === 'true');
        }

        // Everything else goes to additional params
        let additionalParamsStr = '';
        const otherParams = connStr.replace(/Data Source=[^;]+/i, '')
          .replace(/Initial Catalog=[^;]+/i, '')
          .replace(/Integrated Security=(true|SSPI)/i, '')
          .replace(/User Id=[^;]+/i, '')
          .replace(/Password=[^;]+/i, '')
          .replace(/TrustServerCertificate=(true|false)/i, '')
          .replace(/;;/g, ';')
          .replace(/^;/, '')
          .replace(/;$/, '');

        if (otherParams) {
          setAdditionalParams(otherParams);
        }
      } catch (error) {
        console.error("Failed to parse connection string:", error);
        toast.error("Failed to parse connection string");
      }
    }

    // Focus on the connection name input
    if (connectionNameInputRef.current) {
      setTimeout(() => {
        connectionNameInputRef.current.focus();
      }, 100);
    }
  };

  // Handle delete connection
  const handleDeleteConnection = (index) => {
    const confirmed = window.confirm('Are you sure you want to delete this connection?');
    if (confirmed) {
      const newConnections = [...connections];
      newConnections.splice(index, 1);
      setConnections(newConnections);

      // Reset form if we were editing this connection
      if (editIndex === index) {
        resetForm();
      }

      toast.success('Connection deleted successfully!');
    }
  };

  // Handle test connection
  const handleTestConnection = async (connectionStr = null) => {
    let connString = connectionStr;

    if (!connString) {
      if (activeTab === 'component') {
        if (!server || !database) {
          toast.error('Server and Database are required for testing!');
          return;
        }
        connString = buildConnectionString();
      } else {
        connString = newConnectionString;
      }

      if (!connString) {
        toast.error('Connection string is required for testing!');
        return;
      }
    }

    setIsConnecting(true);
    setConnectionResult(null);

    try {
      const result = await handleAsync(async () => {
        // Make sure we're testing a string, not an object
        const connectionValue = typeof connString === 'object' ? 
          (connString.connectionString || JSON.stringify(connString)) : connString;
          
        const result = await apiHelpers.testConnection(connectionValue);

        // For successful connection, navigate to query page
        if (result && result.success) {
          setConnection(connectionValue);
          toast.success('Connection test successful!');
          // Navigate to query page after a short delay to allow toast to show
          setTimeout(() => {
            navigate('/database');
          }, 500);
        } else {
          toast.error('Connection test failed. Please check your settings.');
        }

        return result;
      });

      setConnectionResult(result);
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error("Connection test error. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Add a help section toggle and copy functionality for better UI/UX
  const handleHelpToggle = (section) => {
    setHelpSection(section);
  };

  const handleCopy = (text) => {
    copyToClipboard(text);
    toast.success('Copied to clipboard!');
  };

  // Enhanced validation function
  const validateConnectionForm = () => {
    const errors = {};
    
    if (activeTab === 'component') {
      if (!server) errors.server = 'Server address is required';
      if (!database) errors.database = 'Database name is required';
      if (!useIntegratedSecurity && !userId) errors.userId = 'User ID is required when not using integrated security';
    } else {
      if (!newConnectionString) errors.connectionString = 'Connection string is required';
    }
    
    if (!connectionName) errors.connectionName = 'Connection name is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get connection string examples
  const getConnectionStringExamples = () => {
    return [
      {
        type: 'SQL Server Authentication',
        example: 'Data Source=myServerAddress;Initial Catalog=myDataBase;User Id=myUsername;Password=myPassword;TrustServerCertificate=true;'
      },
      {
        type: 'Windows Authentication',
        example: 'Data Source=myServerAddress;Initial Catalog=myDataBase;Integrated Security=true;TrustServerCertificate=true;'
      },
      {
        type: 'Named Instance',
        example: 'Data Source=myServerAddress\\myInstanceName;Initial Catalog=myDataBase;Integrated Security=true;'
      }
    ];
  };

  // Analytical query suggestions
  const getAnalyticalQueries = () => {
    return [
      {
        category: 'Database Overview',
        queries: [
          { name: 'Table Count', sql: 'SELECT COUNT(*) as TableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'' },
          { name: 'Database Size', sql: 'SELECT DB_NAME() as DatabaseName, SUM(size * 8.0 / 1024) as SizeMB FROM sys.database_files' }
        ]
      },
      {
        category: 'Performance Analysis',
        queries: [
          { name: 'Top Tables by Size', sql: 'SELECT TOP 10 t.name, s.row_count, s.total_space_kb FROM sys.tables t INNER JOIN sys.dm_db_partition_stats s ON t.object_id = s.object_id ORDER BY s.total_space_kb DESC' },
          { name: 'Index Usage', sql: 'SELECT OBJECT_NAME(s.object_id) as TableName, i.name as IndexName, s.user_seeks, s.user_scans FROM sys.dm_db_index_usage_stats s INNER JOIN sys.indexes i ON s.object_id = i.object_id' }
        ]
      }
    ];
  };

  // Define the handleConnect function to resolve the ESLint error
  const handleConnect = (connectionString, connectionName) => {
    if (!connectionString || !connectionName) {
      toast.error('Connection string and name are required!');
      return;
    }

    // Simulate a connection attempt
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionResult({ success: true, message: 'Connection successful!' });
      toast.success('Connected successfully!');
    }, 2000);
  };

  // Render
  return (
    <ComponentErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar removed - required props not available in this context */}

        {/* Help Panel */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Connection Help & Examples</h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimesCircle size={24} />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Connection String Examples */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Connection String Examples</h3>
                    <div className="space-y-3">
                      {getConnectionStringExamples().map((example, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm text-gray-600 mb-2">{example.type}</h4>
                          <div className="relative">
                            <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">{example.example}</code>
                            <button
                              onClick={() => handleCopy(example.example)}
                              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
                            >
                              <FaCopy size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Analytical Queries */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Analytical Query Examples</h3>
                    <div className="space-y-3">
                      {getAnalyticalQueries().map((category, catIndex) => (
                        <div key={catIndex} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm text-gray-600 mb-2">{category.category}</h4>
                          <div className="space-y-2">
                            {category.queries.map((query, queryIndex) => (
                              <div key={queryIndex} className="bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-medium text-gray-700">{query.name}</span>
                                  <button
                                    onClick={() => handleCopy(query.sql)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <FaCopy size={10} />
                                  </button>
                                </div>
                                <code className="text-xs text-gray-600">{query.sql}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tips Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use component mode for easier form-based connection setup</li>
                    <li>• Test connections before saving to ensure they work</li>
                    <li>• Enable "Trust Server Certificate" for development environments</li>
                    <li>• Use integrated security when possible for better security</li>
                    <li>• Save frequently used connections for quick access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
            <div className="max-w-7xl mx-auto py-5 px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <FaDatabase className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Connection Manager</h1>
                    <p className="text-teal-100 text-sm mt-1">Connect to your SQL Server databases with advanced analytics</p>
                  </div>
                </div>
                
                {/* Statistics Dashboard */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{connectionStats.total}</div>
                      <div className="text-xs text-teal-100">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{connectionStats.recent}</div>
                      <div className="text-xs text-teal-100">Recent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{connectionStats.successful}</div>
                      <div className="text-xs text-teal-100">Active</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setConnectionTips(!connectionTips)}
                      className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-400 transition-colors shadow-sm"
                      aria-label="Toggle tips"
                    >
                      <FaInfoCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-400 transition-colors shadow-sm"
                      aria-label="Toggle help"
                    >
                      {showHelp ? <FaTimesCircle className="h-5 w-5" /> : <FaQuestion className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search connections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border-0 bg-white/10 text-white placeholder-teal-100 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <FaDatabase className="absolute left-3 top-3 h-4 w-4 text-teal-100" />
                </div>
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-auto">
            {/* Connection Tips Banner */}
            {connectionTips && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Quick Start:</strong> Use the Component tab for guided setup, or paste a full connection string in the Full tab. 
                        Test your connection before saving, and don't forget to give it a memorable name!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConnectionTips(false)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <FaTimesCircle size={16} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:space-x-4">
                {/* Connection form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-4 lg:mb-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {editIndex === -1 ? 'Add New Connection' : 'Edit Connection'}
                  </h2>

                  {/* Tabs */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setActiveTab('component')}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ease-in-out flex items-center justify-center space-x-2
                      ${activeTab === 'component' ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                    >
                      <FaCog className="h-5 w-5" />
                      <span>Component</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('full')}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ease-in-out flex items-center justify-center space-x-2
                      ${activeTab === 'full' ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                    >
                      <FaCodeBranch className="h-5 w-5" />
                      <span>Full Connection String</span>
                    </button>
                  </div>

                  <form ref={formRef} onSubmit={e => { e.preventDefault(); handleAddConnection(); }}>
                    {/* Component view fields */}
                    {activeTab === 'component' && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="server" className="block text-sm font-medium text-gray-700">
                            Server <span className="text-red-500">*</span>
                            {renderTooltip('server', 'Enter your SQL Server instance name or IP address. Examples: localhost, 127.0.0.1, myserver.domain.com, or myserver\\SQLEXPRESS for named instances.')}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              <FaServer />
                            </span>
                            <input
                              type="text"
                              name="server"
                              id="server"
                              value={server}
                              onChange={e => setServer(e.target.value)}
                              ref={serverInputRef}
                              className={`flex-1 block w-full rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm ${
                                validationErrors.server ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="e.g., localhost, 192.168.1.100, or myserver\\SQLEXPRESS"
                              required
                            />
                          </div>
                          {validationErrors.server && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.server}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="database" className="block text-sm font-medium text-gray-700">
                            Database <span className="text-red-500">*</span>
                            {renderTooltip('database', 'Enter the name of the database you want to connect to. This should be the exact database name as it appears on your SQL Server.')}
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              <FaDatabase />
                            </span>
                            <input
                              type="text"
                              name="database"
                              id="database"
                              value={database}
                              onChange={e => setDatabase(e.target.value)}
                              className={`flex-1 block w-full rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm ${
                                validationErrors.database ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="e.g., MyDatabase, Northwind, or AdventureWorks"
                              required
                            />
                          </div>
                          {validationErrors.database && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.database}</p>
                          )}
                        </div>

                        <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <input
                            type="checkbox"
                            id="integratedSecurity"
                            checked={useIntegratedSecurity}
                            onChange={e => setUseIntegratedSecurity(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="integratedSecurity" className="ml-2 block text-sm text-gray-700 font-medium">
                            Use Integrated Security (Windows Authentication)
                            {renderTooltip('integratedSecurity', 'Use your Windows credentials to authenticate. This is more secure and doesn\'t require storing passwords. Only works when running on Windows with proper domain setup.')}
                          </label>
                        </div>

                        {!useIntegratedSecurity && (
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center mb-3">
                              <FaShieldAlt className="text-yellow-600 mr-2" />
                              <span className="text-sm font-medium text-yellow-800">SQL Server Authentication</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                                  User ID <span className="text-red-500">*</span>
                                  {renderTooltip('userId', 'Enter your SQL Server username. This is the login name created in SQL Server Management Studio.')}
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                    <FaUser />
                                  </span>
                                  <input
                                    type="text"
                                    name="userId"
                                    id="userId"
                                    value={userId}
                                    onChange={e => setUserId(e.target.value)}
                                    className={`flex-1 block w-full rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm ${
                                      validationErrors.userId ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., sa, dbuser, myusername"
                                  />
                                </div>
                                {validationErrors.userId && (
                                  <p className="mt-1 text-sm text-red-600">{validationErrors.userId}</p>
                                )}
                              </div>

                              <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                  Password
                                  {renderTooltip('password', 'Enter the password for your SQL Server user. Click the eye icon to toggle visibility.')}
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                    <FaLock />
                                  </span>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="flex-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm"
                                    placeholder="Enter password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 transition-colors"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                  >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}



                        <div>
                          <label htmlFor="additionalParams" className="block text-sm font-medium text-gray-700">
                            Additional Parameters (Optional)
                            {renderTooltip('additionalParams', 'Add custom connection string parameters. Each parameter should end with a semicolon. Example: Encrypt=true;Connection Timeout=60;Application Name=MyApp;')}
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="additionalParams"
                              value={additionalParams}
                              onChange={e => setAdditionalParams(e.target.value)}
                              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm"
                              rows="3"
                              placeholder="Encrypt=true;Connection Timeout=60;Application Name=MyApp;"
                            />
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Common parameters: Encrypt=true, Connection Timeout=30, Application Name=MyApp, MultipleActiveResultSets=true
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full connection string view */}
                    {activeTab === 'full' && (
                      <div>
                        <div>
                          <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700">
                            Connection String <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              <RiTestTubeFill />
                            </span>
                            <input
                              type="text"
                              name="connectionString"
                              id="connectionString"
                              value={newConnectionString}
                              onChange={e => setNewConnectionString(e.target.value)}
                              className="flex-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm"
                              placeholder="Enter or paste your connection string here"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Connection String Preview
                          </label>
                          <div className="mt-1 p-4 rounded-md bg-gray-50 border border-gray-300 text-sm text-gray-800">
                            {connectionStringPreview}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Connection Name Field */}
                    <div className="mt-6">
                      <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700">
                        Connection Name <span className="text-red-500">*</span>
                        {renderTooltip('connectionName', 'Give your connection a memorable name to easily identify it later. Use descriptive names like "Production DB" or "Local Development".')}
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          <FaStar />
                        </span>
                        <input
                          type="text"
                          name="connectionName"
                          id="connectionName"
                          value={connectionName}
                          onChange={e => setConnectionName(e.target.value)}
                          ref={connectionNameInputRef}
                          className={`flex-1 block w-full rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm ${
                            validationErrors.connectionName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Production Server, Local Development"
                          required
                        />
                      </div>
                      {validationErrors.connectionName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.connectionName}</p>
                      )}
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center text-sm text-teal-600 hover:text-teal-800 font-medium"
                      >
                        {showAdvancedOptions ? <MdOutlineArrowDropUp className="mr-1" /> : <MdOutlineArrowDropDown className="mr-1" />}
                        Advanced Options
                      </button>
                    </div>

                    {/* Advanced Options Panel */}
                    {showAdvancedOptions && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="trustServerCertificate"
                              checked={trustServerCertificate}
                              onChange={e => setTrustServerCertificate(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="trustServerCertificate" className="ml-2 block text-sm text-gray-700">
                              Trust Server Certificate
                              {renderTooltip('trustCert', 'Enable this for development environments or when using self-signed certificates. Disable for production with proper SSL certificates.')}
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="multipleActiveResultSets"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="multipleActiveResultSets" className="ml-2 block text-sm text-gray-700">
                              Multiple Active Result Sets (MARS)
                              {renderTooltip('mars', 'Allows multiple commands to be executed on the same connection simultaneously.')}
                            </label>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label htmlFor="connectionTimeout" className="block text-sm font-medium text-gray-700">
                            Connection Timeout (seconds)
                            {renderTooltip('timeout', 'How long to wait when attempting to establish a connection before timing out. Default is 30 seconds.')}
                          </label>
                          <input
                            type="number"
                            id="connectionTimeout"
                            min="5"
                            max="300"
                            defaultValue="30"
                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Connection String Preview */}
                    {activeTab === 'component' && connectionStringPreview && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Connection String Preview
                          <button
                            onClick={() => handleCopy(connectionStringPreview)}
                            className="ml-2 text-teal-600 hover:text-teal-800"
                          >
                            <FaCopy size={12} />
                          </button>
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono text-gray-800 overflow-x-auto">
                          {connectionStringPreview}
                        </div>
                      </div>
                    )}

                    {/* Connection Name Field */}
                    <div className="mt-6">
                      <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700">
                        Connection Name <span className="text-red-500">*</span>
                        {renderTooltip('connectionName', 'Give your connection a memorable name to easily identify it later. Use descriptive names like "Production DB" or "Local Development".')}
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          <FaStar />
                        </span>
                        <input
                          type="text"
                          name="connectionName"
                          id="connectionName"
                          value={connectionName}
                          onChange={e => setConnectionName(e.target.value)}
                          ref={connectionNameInputRef}
                          className={`flex-1 block w-full rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm ${
                            validationErrors.connectionName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Production Server, Local Development"
                          required
                        />
                      </div>
                      {validationErrors.connectionName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.connectionName}</p>
                      )}
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center text-sm text-teal-600 hover:text-teal-800 font-medium"
                      >
                        {showAdvancedOptions ? <MdOutlineArrowDropUp className="mr-1" /> : <MdOutlineArrowDropDown className="mr-1" />}
                        Advanced Options
                      </button>
                    </div>

                    {/* Advanced Options Panel */}
                    {showAdvancedOptions && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="trustServerCertificate"
                              checked={trustServerCertificate}
                              onChange={e => setTrustServerCertificate(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="trustServerCertificate" className="ml-2 block text-sm text-gray-700">
                              Trust Server Certificate
                              {renderTooltip('trustCert', 'Enable this for development environments or when using self-signed certificates. Disable for production with proper SSL certificates.')}
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="multipleActiveResultSets"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="multipleActiveResultSets" className="ml-2 block text-sm text-gray-700">
                              Multiple Active Result Sets (MARS)
                              {renderTooltip('mars', 'Allows multiple commands to be executed on the same connection simultaneously.')}
                            </label>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label htmlFor="connectionTimeout" className="block text-sm font-medium text-gray-700">
                            Connection Timeout (seconds)
                            {renderTooltip('timeout', 'How long to wait when attempting to establish a connection before timing out. Default is 30 seconds.')}
                          </label>
                          <input
                            type="number"
                            id="connectionTimeout"
                            min="5"
                            max="300"
                            defaultValue="30"
                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none sm:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Connection String Preview */}
                    {activeTab === 'component' && connectionStringPreview && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Connection String Preview
                          <button
                            onClick={() => handleCopy(connectionStringPreview)}
                            className="ml-2 text-teal-600 hover:text-teal-800"
                          >
                            <FaCopy size={12} />
                          </button>
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono text-gray-800 overflow-x-auto">
                          {connectionStringPreview}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center px-5 py-2.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-sm hover:shadow"
                      >
                        <FaTimesCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestConnection()}
                        disabled={isConnecting}
                        className="inline-flex items-center px-5 py-2.5 rounded-md font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-sm hover:shadow bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isConnecting ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Testing...
                          </>
                        ) : (
                          <>
                            <RiTestTubeFill className="h-4 w-4 mr-2" />
                            Test Connection
                          </>
                        )}
                      </button>
                      <button
                        type="submit"
                        disabled={isConnecting}
                        className="inline-flex items-center px-5 py-2.5 rounded-md font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-sm hover:shadow bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-500 hover:to-teal-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <FaSave className="h-4 w-4 mr-2" />
                        {editIndex === -1 ? 'Save Connection' : 'Update Connection'}
                      </button>
                    </div>
                    
                    {/* Connection Result Display */}
                    {connectionResult && (
                      <div 
                        className={`mt-6 p-4 rounded-lg border shadow-md animate-fadeIn ${connectionResult.success ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div 
                            className={`p-2 rounded-full ${connectionResult.success ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}
                          >
                            {connectionResult.success ? 
                              <FaCheckCircle size={18} className="animate-pulse" /> : 
                              <FaTimesCircle size={18} className="animate-pulse" />
                            }
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-base ${connectionResult.success ? 'text-green-700' : 'text-red-700'}`}>
                              {connectionResult.success ? 'Connection Successful!' : 'Connection Failed'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{connectionResult.message}</p>
                            {connectionResult.success && (
                              <button
                                onClick={() => handleConnect(activeTab === 'component' ? buildConnectionString() : newConnectionString, connectionName)}
                                className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 shadow-sm transition-colors"
                              >
                                <FaArrowRight className="mr-1" size={10} />
                                Connect & Explore
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Recent and saved connections */}
                <div className="space-y-4 w-full lg:w-1/3">
                  {/* Recent connections panel */}
                  {showRecentPanel && (
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                          <FaHistory className="mr-2 text-teal-500" /> 
                          Recent Connections
                        </h2>
                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">{recentConnections.length} connection{recentConnections.length !== 1 && 's'}</span>
                      </div>

                      {recentConnections.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No recent connections found.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {recentConnections.map((conn, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{conn.name}</p>
                                <p className="text-xs text-gray-500 truncate">{conn.connectionString}</p>
                              </div>
                              <div className="mt-2 sm:mt-0 sm:ml-4 sm:flex sm:items-center">
                                <button
                                  onClick={() => handleTestConnection(conn.connectionString)}
                                  className="inline-flex items-center px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 focus:outline-none"
                                >
                                  <RiTestTubeFill className="h-4 w-4 mr-1" />
                                  Test
                                </button>
                                <button
                                  onClick={() => handleEditConnection(index)}
                                  className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 focus:outline-none"
                                >
                                  <FaEdit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteConnection(index)}
                                  className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 focus:outline-none"
                                >
                                  <FaTrash className="h-4 w-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Saved connections panel */}
                  {showSavedPanel && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                          <FaSave className="mr-2 text-teal-500" /> 
                          Saved Connections
                          {searchQuery && (
                            <span className="ml-2 text-sm text-gray-500">({filteredConnections.length} of {connections.length})</span>
                          )}
                        </h2>
                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                          {searchQuery ? filteredConnections.length : connections.length} connection{(searchQuery ? filteredConnections.length : connections.length) !== 1 && 's'}
                        </span>
                      </div>

                      {searchQuery && filteredConnections.length === 0 && connections.length > 0 ? (
                        <div className="text-center py-8">
                          <FaDatabase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-sm">No connections match your search "<strong>{searchQuery}</strong>"</p>
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-teal-600 hover:text-teal-800 text-sm"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : connections.length === 0 ? (
                        <div className="text-center py-8">
                          <FaDatabase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-sm mb-2">No saved connections found.</p>
                          <p className="text-gray-400 text-xs">Create your first connection using the form above.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(searchQuery ? filteredConnections : connections).map((conn, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{conn.name}</p>
                                <p className="text-xs text-gray-500 truncate">{conn.connectionString}</p>
                              </div>
                              <div className="mt-2 sm:mt-0 sm:ml-4 sm:flex sm:items-center">
                                <button
                                  onClick={() => handleTestConnection(conn.connectionString)}
                                  className="inline-flex items-center px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 focus:outline-none"
                                >
                                  <RiTestTubeFill className="h-4 w-4 mr-1" />
                                  Test
                                </button>
                                <button
                                  onClick={() => handleEditConnection(index)}
                                  className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 focus:outline-none"
                                >
                                  <FaEdit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteConnection(index)}
                                  className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 focus:outline-none"
                                >
                                  <FaTrash className="h-4 w-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analytical Insights Panel */}
                  <div className="bg-white rounded-lg shadow-md p-6 mt-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaChartLine className="mr-2 text-teal-500" /> 
                      Quick Analytics
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <FaDatabase className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-blue-700">{connectionStats.total}</div>
                        <div className="text-xs text-blue-600">Total Connections</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <FaCheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-green-700">{connectionStats.successful}</div>
                        <div className="text-xs text-green-600">Active</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <FaHistory className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                        <div className="text-2xl font-bold text-purple-700">{connectionStats.recent}</div>
                        <div className="text-xs text-purple-600">Recent</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                        <BsDiagram3Fill className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                        <div className="text-2xl font-bold text-yellow-700">
                          {Math.round((connectionStats.successful / Math.max(connectionStats.total, 1)) * 100)}%
                        </div>
                        <div className="text-xs text-yellow-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowHelp(true)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <FaQuestion className="mr-2" />
                        View Query Examples & Tips
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ComponentErrorBoundary>
  );
};

export default ConnectionPage;
