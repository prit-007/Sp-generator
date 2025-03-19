import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// Layout
import Layout from "../components/layout/Layout";

// Common components
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import ConnectionStringModal from "../components/common/ConnectionStringModal";
const API_URL = process.env.REACT_APP_API_URL;

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
      let url = `${API_URL}/Database/metadata`;
      let options = {};
      
      if (connectionString) {
        options = {
        connectionString
        };
      }
      
      const response = await axios.get(url);
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
  const location = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const connectionParam = queryParams.get('connection');
    
    if (connectionParam) {
      fetchMetadata(connectionParam);
    } else {
      fetchMetadata();
    }
  }, [location.search]);
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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchMetadata()} />;
  }

  return (
    <>
      <Layout
        metadata={metadata}
        onRefresh={() => fetchMetadata()}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filteredTables={filteredTables}
        expandedTables={expandedTables}
        toggleTableExpand={toggleTableExpand}
        activeTable={activeTable}
        exportMetadata={exportMetadata}
        expandedColumns={expandedColumns}
        toggleColumnExpand={toggleColumnExpand}
      />
      
      {/* Connection String Modal */}
      <ConnectionStringModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  );
};

export default DatabaseMetadataPage;