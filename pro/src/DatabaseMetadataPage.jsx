import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTable, FaKey, FaLink, FaChevronDown, FaChevronRight, FaSearch, 
         FaDownload, FaAngleDown, FaSync, FaDatabase, FaCog } from "react-icons/fa";
import ConnectionStringModal from "./components/common/ConnectionStringModal";
import {useNavigate} from 'react-router-dom';

// Sidebar Component
const Sidebar = ({ metadata, searchTerm, handleSearch, filteredTables, 
                  expandedTables, toggleTableExpand, activeTable, exportMetadata }) => {
  return (
    <div className="w-1/4 bg-gradient-to-b from-teal-600 to-teal-700 text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Database Explorer</h1>
        <div className="flex space-x-2">
          <button 
            onClick={exportMetadata}
            className="p-2 text-teal-100 hover:text-white transition duration-200" 
            title="Export metadata"
          >
            <FaDownload className="text-lg" />
          </button>
        </div>
      </div>
      
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search tables..."
          className="w-full bg-teal-500 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={searchTerm}
          onChange={handleSearch}
        />
        <FaSearch className="absolute left-3 top-4 text-teal-200" />
      </div>
      
      <div className="space-y-1">
        {filteredTables.map(tableName => (
          <div key={tableName} className="cursor-pointer">
            <div 
              className={`flex items-center py-3 px-4 rounded-lg transition duration-200 
                ${activeTable === tableName ? 'bg-teal-500 shadow-md' : 'hover:bg-teal-600'}`}
              onClick={() => toggleTableExpand(tableName)}
            >
              {expandedTables[tableName] ? 
                <FaChevronDown className="mr-2 text-yellow-300 w-3" /> : 
                <FaChevronRight className="mr-2 text-yellow-300 w-3" />
              }
              <FaTable className="mr-2 text-cyan-200" />
              <span className="text-sm font-medium">{tableName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Details Component  
// Foreign Keys Component

// Main Component
const DatabaseMetadataPage = () => {
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTables, setExpandedTables] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTable, setActiveTable] = useState(null);
  const [expandedColumns, setExpandedColumns] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
const navigate = useNavigate();
  
  // Parse the complex metadata format from the document
  const parseMetadata = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.error("Failed to parse metadata:", e);
      return {};
    }
  };

  // Fetch metadata from the API
  const fetchMetadata = async (connectionString = null) => {
    setLoading(true);
    try {
      let url = "http://localhost:61205/api/Database/metadata";
      let options = {};
      
      if (connectionString) {
        options = {
          params: { connectionString }
        };
      }
      
      const response = await axios.get(url, options);
      const parsedData = parseMetadata(response.data);
      setMetadata(parsedData);
      
      // Initialize expanded state for all tables
      const initialExpandedState = {};
      Object.keys(parsedData).forEach(table => {
        initialExpandedState[table] = false;
      });
      setExpandedTables(initialExpandedState);
      
      setLoading(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch database metadata.");
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMetadata();
  }, []);

  const toggleTableExpand = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
    setActiveTable(tableName);
    
    // Initialize expanded state for columns if this table is being selected
    if (!expandedColumns[tableName] && metadata[tableName]) {
      const initialColumnState = {};
      metadata[tableName].Columns.forEach((column, index) => {
        initialColumnState[index] = false;
      });
      setExpandedColumns(prev => ({
        ...prev,
        [tableName]: initialColumnState
      }));
    }
  };

  const toggleColumnExpand = (tableIndex, columnIndex) => {
    setExpandedColumns(prev => ({
      ...prev,
      [tableIndex]: {
        ...prev[tableIndex],
        [columnIndex]: !prev[tableIndex][columnIndex]
      }
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredTables = Object.keys(metadata).filter(tableName => 
    tableName.toLowerCase().includes(searchTerm)
  );

  const exportMetadata = () => {
    const dataStr = JSON.stringify(metadata, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'database-metadata.json';
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleConnect = (connectionString) => {
    fetchMetadata(connectionString);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-xl font-semibold text-teal-800">Loading database metadata...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-orange-800">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => fetchMetadata()}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50">
      {/* Header with actions */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <FaDatabase className="text-teal-600 text-xl mr-2" />
            <h1 className="text-xl font-semibold text-teal-800">Database Metadata Explorer</h1>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => fetchMetadata()} 
              className="flex items-center px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition duration-200"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition duration-200"
            >
              <FaCog className="mr-2" />
              Connection
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-h-[calc(100vh-64px)]">
        {/* Sidebar Component */}
        <Sidebar 
          metadata={metadata}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          filteredTables={filteredTables}
          expandedTables={expandedTables}
          toggleTableExpand={toggleTableExpand}
          activeTable={activeTable}
          exportMetadata={exportMetadata}
        />
        
        {/* Main content area */}
        <div className="w-3/4 p-8 overflow-y-auto">
          {activeTable ? (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-3 flex items-center text-teal-800">
                  <FaTable className="mr-3 text-teal-600" />
                  {activeTable}
                </h2>
                <div className="text-sm bg-white p-4 rounded-lg shadow-sm inline-block">
                  <span className="font-medium text-teal-800">Primary Keys:</span>{' '}
                  <span className="text-teal-600">{metadata[activeTable].PrimaryKeys.join(', ') || 'None'}</span>
                </div>
              </div>
              
              {/* Table Details Component */}
              <TableDetails 
                activeTable={activeTable}
                metadata={metadata}
                expandedColumns={expandedColumns}
                toggleColumnExpand={toggleColumnExpand}
              />
              
              {/* Foreign Keys Component */}
              <ForeignKeysTable 
                activeTable={activeTable}
                metadata={metadata}
              />
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      
      {/* Connection String Modal */}
      <ConnectionStringModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default DatabaseMetadataPage;