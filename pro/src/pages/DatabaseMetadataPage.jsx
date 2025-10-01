import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaDatabase, FaSearch, FaKey, FaTable, FaExclamationTriangle, FaSync, 
  FaColumns, FaCode, FaEye, FaEyeSlash, FaInfoCircle, FaChevronDown, 
  FaChevronUp, FaChevronRight, FaChevronLeft, FaFilter, FaLink, FaDownload, FaFileCode, FaCog,
  FaPlus, FaMinus, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown,
  FaClipboard, FaListAlt, FaRedo, FaAngleRight, FaEllipsisV, FaSpinner
} from 'react-icons/fa';
import { apiHelpers } from '../services/apiClient';
import useErrorHandler from '../hooks/useErrorHandler';
import useClipboardAndDownload from '../components/custom-hooks/useClipboardAndDownload';
import { useConnection } from '../contexts/ConnectionContext';
import { stringify } from 'flatted';

// Common components
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import ComponentErrorBoundary from "../components/common/ComponentErrorBoundary";
import ConnectionStringModal from "../components/common/ConnectionStringModal";
import ActiveConnectionBanner from "../components/common/ActiveConnectionBanner";

// New Layout Components
import NewHeader from "../components/layout/NewHeader";
import NewLayout from "../components/layout/NewLayout";

// New Page Components - Import statements for these should already exist
import Overview from "../components/pages/Overview";
import DatabaseExplorer from "../components/pages/DatabaseExplorer";
import StoredProcedureGenerator from "../components/pages/StoredProcedureGenerator";
import MvcGeneratorPage from "../components/pages/MvcGeneratorPage";
import AnalyticsPage from "../components/pages/AnalyticsPage";
import DiagramPage from "../components/pages/DiagramPage";
import TableDetailsPanel from "../components/database/TableDetailsPanel";

const DatabaseMetadataPage = () => {
  // State management
  const [metadata, setMetadata] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [isTableSearchVisible, setIsTableSearchVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTable, setActiveTable] = useState(null);
  const [expandedColumns, setExpandedColumns] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTableInfo, setShowTableInfo] = useState(true);
  const [columnSort, setColumnSort] = useState({ field: 'Name', direction: 'asc' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [showConnectionBanner, setShowConnectionBanner] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    showPrimaryKeys: true,
    showNonPrimaryKeys: true,
    showForeignKeys: true,
    showNonForeignKeys: true,
    showNullableOnly: false,
    showNonNullableOnly: false,
    dataType: 'all'
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activePage, setActivePage] = useState('overview');
  
  // References
  const searchInputRef = useRef(null);
  
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isLoading, handleAsync, clearError } = useErrorHandler();
  const { downloadAsFile } = useClipboardAndDownload();
  const { activeConnection, setConnection, connectionHistory, savedConnections } = useConnection();
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const slideInUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const slideInLeft = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
  };

  // Load database metadata
  const fetchMetadata = async () => {
    setIsRefreshing(true);
    clearError();
    
    if (!activeConnection) {
      toast.warn("No active connection. Please connect to a database first.");
      setIsRefreshing(false);
      setInitialLoading(false);
      return;
    }
    
    await handleAsync(
      async () => {
        // Ensure we're connected before fetching metadata
        try {
          // Test the connection first
          await apiHelpers.testConnection(activeConnection);
          
          // Then fetch metadata
          const data = await apiHelpers.fetchDatabaseMetadata();
          
          // Ensure data is properly parsed
          let processedData = data;
          if (typeof data === 'string') {
            try {
              processedData = JSON.parse(data);
            } catch (parseError) {
              console.error('Error parsing metadata JSON:', parseError);
              processedData = {};
            }
          }
          
          setMetadata(processedData);
          
          // Reset expanded tables when refreshing metadata
          setExpandedTables({});
          toast.success("Database metadata refreshed successfully");
        } catch (innerError) {
          console.error("Error in connection/fetching:", innerError);
          throw innerError; // Re-throw to be caught by handleAsync
        }
      },
      (error) => {
        toast.error(`Failed to load database metadata: ${error.message || 'Unknown error'}`);
        // If error is about no active connection, open the connection modal
        if (error.message && error.message.includes("No active database connection")) {
          setIsModalOpen(true);
        }
      }
    );
    
    setIsRefreshing(false);
    setInitialLoading(false);
  };
  
  // Load metadata on initial render
  useEffect(() => {
    // Only try to fetch metadata if we have an active connection
    if (activeConnection) {
      fetchMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  // Focus search input when search component becomes visible
  useEffect(() => {
    if (isTableSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isTableSearchVisible]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Ensure metadata is an object
  const safeMetadata = metadata && typeof metadata === 'object' ? metadata : {};
  
  // Filter tables based on search term
  const filteredTables = searchTerm.trim() === "" 
    ? Object.keys(safeMetadata).sort() 
    : Object.keys(safeMetadata)
        .filter(tableName => tableName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort();
        
  // Open connection modal
  const openConnectionModal = () => {
    setIsModalOpen(true);
  };
  
  // Close connection modal
  const closeConnectionModal = () => {
    setIsModalOpen(false);
  };
  
  // Export metadata as JSON
  const exportMetadata = () => {
    // Use flatted to handle circular references
    const metadataString = stringify(metadata, null, 2);
    downloadAsFile(metadataString, "database_metadata.json", "application/json");
    toast.success("Database metadata exported successfully");
  };
  
  // Fetch table columns when expanding a table
  const fetchTableColumns = async (tableName) => {
    // If we already have columns for this table or it doesn't exist, don't fetch again
    if (!tableName || !metadata[tableName]) {
      setIsTableLoading(false);
      return;
    }
    
    try {
      // Simulate API call or processing delay - in a real app, this would be an actual API call
      // to get detailed column information for the specific table
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, you would make an API call here to get detailed column info
      // For now, we're just simulating that the columns are loaded
      toast.info(`Loaded details for table: ${tableName}`);
    } catch (error) {
      console.error(`Failed to load details for table ${tableName}:`, error);
      toast.error(`Failed to load table details: ${error.message || 'Unknown error'}`);
    } finally {
      setIsTableLoading(false);
    }
  };

  // Handle table expansion
  const toggleTableExpand = (tableName) => {
    // Don't do anything if this table is already loading
    if (isTableLoading === tableName) return;
    
    // Start loading indicator for this table
    setIsTableLoading(tableName);
    
    if (activeTable !== tableName) {
      setActiveTable(tableName);
      
      // Restore last active page from localStorage if available
      const lastActivePage = localStorage.getItem('lastActivePage');
      if (lastActivePage) {
        setActivePage(lastActivePage);
      } else {
        // Default to table-details if no stored preference
        setActivePage('table-details');
      }
    }
    
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
    
    // Fetch table columns if needed
    fetchTableColumns(tableName);
  };
  
  // Handle column expansion
  const toggleColumnExpand = (columnName) => {
    setExpandedColumns({
      ...expandedColumns,
      [columnName]: !expandedColumns[columnName]
    });
  };

  // Create wrapper function for setActivePage to handle navigation
  const navigateToPage = (page) => {
    setActivePage(page);
    // Save to localStorage
    localStorage.setItem('lastActivePage', page);
  };

  // Handle connection submission
  const handleConnectionSubmit = async (connectionString) => {
    setIsRefreshing(true);
    try {
      // Test connection first
      await apiHelpers.testConnection(connectionString);
      
      // Update connection context
      setConnection(connectionString);
      
      // Fetch metadata for new connection
      await fetchMetadata();
      
      // Close modal after successful connection
      setIsModalOpen(false);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle column sorting
  const handleSortChange = (field) => {
    setColumnSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilterOptions({
      showPrimaryKeys: true,
      showNonPrimaryKeys: true,
      showForeignKeys: true,
      showNonForeignKeys: true,
      showNullableOnly: false,
      showNonNullableOnly: false,
      dataType: 'all'
    });
    toast.info('Filters reset to default');
  };

  // Custom empty state component when no database is connected
  const DatabaseEmptyState = () => (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-teal-100 p-4"
    >
      <motion.div 
        className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full border border-teal-100"
        variants={slideInUp}
      >
        <motion.div 
          className="text-teal-500 text-6xl mb-4 flex justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        >
          <FaDatabase />
        </motion.div>
        <motion.h2 
          className="text-2xl font-bold mb-2 text-teal-800"
          variants={slideInUp}
        >
          No Database Selected
        </motion.h2>
        <motion.p 
          className="text-gray-700 mb-6"
          variants={slideInUp}
        >
          Please connect to a database to explore its structure and metadata.
        </motion.p>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200 font-medium flex items-center justify-center mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={slideInUp}
        >
          <FaLink className="mr-2" /> Connect to Database
        </motion.button>
      </motion.div>
    </motion.div>
  );

  if (isLoading || initialLoading) {
    return <LoadingState 
      message="Loading database metadata..." 
      description="Please wait while we fetch your database structure..."
      type="database"
    />;
  }

  if (error && !isRefreshing) {
    return (
      <ErrorState 
        message={error} 
        onRetry={fetchMetadata} 
        onGoBack={() => navigate('/')}
      />
    );
  }
  
  // Show empty state if no metadata or tables
  if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) {
    return <DatabaseEmptyState />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Active Connection Banner */}
      {showConnectionBanner && (
        <ActiveConnectionBanner onClose={() => setShowConnectionBanner(false)} />
      )}
      
      {/* Fixed Header */}
      <div className="sticky top-0 left-0 right-0 z-50 shadow-md">
        <NewHeader 
          onRefresh={fetchMetadata} 
          onChangeConnection={openConnectionModal}
          onExport={exportMetadata}
          activePage={activePage}
          setActivePage={navigateToPage}
        />
      </div>
      
      {/* Main Layout */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <motion.div
          initial={{ width: '240px' }}
          animate={{ width: isTableSearchVisible ? '240px' : '60px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white border-r border-gray-200 shadow-sm h-full flex-shrink-0 z-10"
        >
          {/* Sidebar toggle button */}
          <button 
            onClick={() => setIsTableSearchVisible(!isTableSearchVisible)}
            className="absolute -right-3 top-4 bg-white w-6 h-6 rounded-full shadow-md flex items-center justify-center z-20 border border-gray-200"
          >
            <motion.div
              animate={{ rotate: isTableSearchVisible ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronLeft size={12} className="text-gray-500" />
            </motion.div>
          </button>

          <ComponentErrorBoundary componentName="Database Tables Sidebar">
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-3 flex-shrink-0">
                {/* Search input - only visible when sidebar expanded */}
                <AnimatePresence>
                  {isTableSearchVisible && (
                    <motion.div 
                      className="relative mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="text"
                        placeholder="Search tables..."
                        className="w-full bg-gray-50 text-gray-800 px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 shadow-sm"
                        value={searchTerm}
                        onChange={handleSearch}
                        ref={searchInputRef}
                      />
                      <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {isTableSearchVisible && (
                    <motion.h2 
                      className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <FaDatabase className="mr-2 text-teal-500" /> Database Tables
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Tables list with scroll */}
              <div className="overflow-y-auto overflow-x-hidden flex-1 px-3 pb-3 custom-scrollbar">
                <AnimatePresence>
                  {filteredTables.map((tableName, index) => (
                    <motion.div 
                      key={tableName} 
                      className="mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <button
                        onClick={() => toggleTableExpand(tableName)}
                        className={`flex items-center w-full text-left py-2 transition-all duration-200 overflow-hidden rounded-md ${
                          activeTable === tableName 
                            ? 'bg-teal-50 text-teal-700 font-medium shadow-sm border-l-4 border-teal-500' 
                            : 'text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200'
                        } ${isTableSearchVisible ? 'px-3' : 'px-2 justify-center'}`}
                        disabled={isTableLoading === tableName}
                        title={!isTableSearchVisible ? tableName : ''}
                      >
                        {isTableSearchVisible ? (
                          <>
                            <span className="mr-2 w-4 flex-shrink-0">
                              {isTableLoading === tableName ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="text-xs"
                                >
                                  <FaSpinner />
                                </motion.div>
                              ) : expandedTables[tableName] ? (
                                <FaChevronDown className="text-xs" />
                              ) : (
                                <FaChevronRight className="text-xs" />
                              )}
                            </span>
                            <FaTable className="mr-2 text-xs flex-shrink-0" />
                            <span className="truncate text-sm">{tableName}</span>
                          </>
                        ) : (
                          <FaTable className="text-xs" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                  
                  {filteredTables.length === 0 && (
                    <div className="text-gray-500 text-sm italic p-2 text-center">
                      {isTableSearchVisible ? `No tables found matching "${searchTerm}"` : ""}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ComponentErrorBoundary>
        </motion.div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 h-full custom-scrollbar p-6">
          {activePage === 'overview' && (
            <ComponentErrorBoundary componentName="Overview" className="h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Overview 
                  metadata={metadata && typeof metadata === 'object' ? metadata : {}} 
                  setActivePage={navigateToPage} 
                  setActiveTable={setActiveTable}
                />
              </motion.div>
            </ComponentErrorBoundary>
          )}
          
          {activePage === 'database-explorer' && (
            <ComponentErrorBoundary componentName="Database Explorer" className="h-full">
              <DatabaseExplorer 
                metadata={metadata && typeof metadata === 'object' ? metadata : {}} 
                activeTable={activeTable}
                setActiveTable={setActiveTable}
                setActivePage={navigateToPage}
                columnSort={columnSort}
                handleColumnSort={handleSortChange}
                filterOptions={filterOptions}
                updateFilterOption={(option, value) => {
                  setFilterOptions(prev => ({
                    ...prev,
                    [option]: value
                  }));
                }}
                resetFilters={resetFilters}
              />
            </ComponentErrorBoundary>
          )}
          
          {activePage === 'table-details' && activeTable && (
            <ComponentErrorBoundary componentName="Table Details" className="h-full">
              <TableDetailsPanel
                activeTable={activeTable}
                metadata={metadata && typeof metadata === 'object' ? metadata : {}}
                expandedColumns={expandedColumns}
                toggleColumnExpand={toggleColumnExpand}
                setActivePage={navigateToPage}
              />
            </ComponentErrorBoundary>
          )}
          
          {activePage === 'stored-procedures' && (
            <ComponentErrorBoundary componentName="Stored Procedure Generator" className="h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <StoredProcedureGenerator 
                  metadata={metadata && typeof metadata === 'object' ? metadata : {}} 
                  activeTable={activeTable}
                  setActiveTable={setActiveTable}
                  setActivePage={navigateToPage}
                />
              </motion.div>
            </ComponentErrorBoundary>
          )}
          
          {activePage === 'mvc-generator' && (
            <ComponentErrorBoundary componentName="MVC Generator" className="h-full">
              <MvcGeneratorPage 
                metadata={metadata && typeof metadata === 'object' ? metadata : {}} 
                activeTable={activeTable}
                setActiveTable={setActiveTable}
              />
            </ComponentErrorBoundary>
          )}
          
          {activePage === 'analytics' && (
            <ComponentErrorBoundary componentName="Analytics" className="h-full">
              <AnalyticsPage 
                metadata={metadata && typeof metadata === 'object' ? metadata : {}} 
                activeTable={activeTable}
                setActiveTable={setActiveTable}
              />
            </ComponentErrorBoundary>
          )}
          
          {activePage === 'diagram' && (
            <ComponentErrorBoundary componentName="Diagram" className="h-full">
              <DiagramPage 
                metadata={metadata && typeof metadata === 'object' ? metadata : {}} 
                activeTable={activeTable}
                setActiveTable={setActiveTable}
              />
            </ComponentErrorBoundary>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isModalOpen && (
          <ConnectionStringModal 
            onClose={closeConnectionModal} 
            onSubmit={handleConnectionSubmit} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};


export default DatabaseMetadataPage;