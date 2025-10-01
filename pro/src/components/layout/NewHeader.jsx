import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaDatabase, FaTable, FaCode, FaFileCode, FaChartBar, 
  FaCog, FaServer, FaSignOutAlt, FaHistory, FaDownload, FaFileExport 
} from 'react-icons/fa';
import { BsDiagram3Fill } from 'react-icons/bs';
import { useConnection } from '../../contexts/ConnectionContext';

const NewHeader = ({ onRefresh, onChangeConnection, onExport, activePage, setActivePage }) => {
  const { activeConnection, connections, clearConnections, setConnection, clearActiveConnection } = useConnection();
  const [showConnectionHistory, setShowConnectionHistory] = useState(false);
  
  // Helper to truncate connection string for display
  const truncateConnection = (conn) => {
    if (!conn) return 'No Connection';
    
    // Extract database name if possible
    const dbMatch = conn.match(/Initial Catalog=([^;]+)/i);
    const serverMatch = conn.match(/Data Source=([^;]+)/i);
    
    if (dbMatch && serverMatch) {
      return `${serverMatch[1]} / ${dbMatch[1]}`;
    }
    
    // Fallback to just truncating
    return conn.length > 40 ? `${conn.substring(0, 37)}...` : conn;
  };
  
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <FaHome className="mr-2" /> },
    { id: 'database-explorer', label: 'Database Explorer', icon: <FaDatabase className="mr-2" /> },
    { id: 'stored-procedures', label: 'Stored Procedures', icon: <FaCode className="mr-2" /> },
    { id: 'mvc-generator', label: 'MVC Generator', icon: <FaFileCode className="mr-2" /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar className="mr-2" /> },
    { id: 'diagram', label: 'ER Diagram', icon: <BsDiagram3Fill className="mr-2" /> },
  ];

  const handleSelectConnection = (conn) => {
    setConnection(conn);
    onRefresh();
    setShowConnectionHistory(false);
  };

  return (
    <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/">
              <motion.div 
                className="font-title text-4xl font-bold mr-2 tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' 
                }}
              >
                <span className="text-white">SP</span>
                <span className="text-yellow-300 italic">Generator</span>
                <span className="text-teal-200 text-sm ml-1 align-top font-light">®</span>
              </motion.div>
            </Link>
            <span className="hidden md:inline-block text-teal-200 text-sm font-accent italic ml-2">
              Professional Database Toolkit
            </span>
          </div>

          <nav className="hidden md:flex">
            {navItems.map(item => (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-4 py-2 mx-1 rounded-md flex items-center text-sm font-medium transition-colors duration-200 ${
                  activePage === item.id
                    ? 'bg-teal-500 text-white'
                    : 'text-teal-100 hover:bg-teal-500 hover:text-white'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item.icon}
                {item.label}
              </motion.button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {activeConnection && (
              <div className="hidden md:flex items-center bg-teal-800 px-3 py-1 rounded text-sm">
                <FaServer className="mr-2 text-teal-300" />
                <span className="font-mono truncate max-w-[200px]" title={activeConnection}>
                  {truncateConnection(activeConnection)}
                </span>
              </div>
            )}
            
            {connections && connections.length > 0 && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowConnectionHistory(!showConnectionHistory)}
                  className="p-2 rounded-full bg-teal-500 hover:bg-teal-400 text-white relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Connection history"
                >
                  <FaHistory className="text-lg" />
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {connections.length}
                  </span>
                </motion.button>
                
                {showConnectionHistory && (
                  <div className="absolute right-0 mt-2 bg-teal-800 border border-teal-700 rounded-lg shadow-xl p-2 w-72 z-50">
                    <h3 className="text-teal-200 font-semibold px-3 py-2 border-b border-teal-700">Recent Connections</h3>
                    <div className="max-h-60 overflow-y-auto">
                      {connections.map((conn, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectConnection(conn)}
                          className="w-full text-left px-3 py-2 hover:bg-teal-700 text-sm truncate border-b border-teal-700 last:border-b-0"
                          title={conn}
                        >
                          {truncateConnection(conn)}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-teal-700">
                      <button 
                        onClick={() => {
                          clearConnections();
                          setShowConnectionHistory(false);
                        }}
                        className="text-xs text-red-300 hover:text-red-200 w-full text-center py-1"
                      >
                        <FaSignOutAlt className="inline mr-1" /> Clear All Connections
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <motion.button
              onClick={onRefresh}
              className="p-2 rounded-full bg-teal-500 hover:bg-teal-400 text-white"
              whileHover={{ rotate: 180, transition: { duration: 0.5 } }}
              title="Refresh database metadata"
            >
              <FaDatabase className="text-lg" />
            </motion.button>
            
            {onExport && (
              <motion.button
                onClick={onExport}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Export database metadata"
              >
                <FaFileExport className="text-lg" />
              </motion.button>
            )}
            
            <motion.button
              onClick={() => {
                clearActiveConnection();
                window.location.href = '/connect';
              }}
              className="p-2 rounded-full bg-red-500 hover:bg-red-400 text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Disconnect and go to connection page"
            >
              <FaSignOutAlt className="text-lg" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewHeader;
