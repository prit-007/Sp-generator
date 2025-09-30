import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDatabase, FaChevronRight, FaSearch, FaTable, FaKey, FaColumns, FaChartLine, FaCode } from 'react-icons/fa';
import Overview from '../pages/Overview';
import DatabaseExplorer from '../pages/DatabaseExplorer';
import StoredProcedureGenerator from '../pages/StoredProcedureGenerator';
import MvcGeneratorPage from '../pages/MvcGeneratorPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import DiagramPage from '../pages/DiagramPage';
import TableDetailsPanel from '../database/TableDetailsPanel';

const NewLayout = ({
  metadata,
  searchTerm,
  handleSearch,
  filteredTables,
  expandedTables,
  toggleTableExpand,
  activeTable,
  exportMetadata,
  expandedColumns,
  toggleColumnExpand,
  activePage,
  setActivePage
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Save active page to localStorage whenever it changes
  useEffect(() => {
    if (activePage) {
      localStorage.setItem('lastActivePage', activePage);
    }
  }, [activePage]);
  
  // Load the active page from localStorage when the component mounts or activeTable changes
  useEffect(() => {
    if (activeTable) {
      const lastActivePage = localStorage.getItem('lastActivePage');
      if (lastActivePage) {
        setActivePage(lastActivePage);
      } else {
        // If no saved page but a table is selected, default to table details
        setActivePage('table-details');
      }
    }
  }, [activeTable, setActivePage]);
  
  const renderMainContent = () => {
    switch(activePage) {
      case 'overview':
        return <Overview metadata={metadata} setActivePage={setActivePage} />;
      case 'database-explorer':
        return <DatabaseExplorer 
                 metadata={metadata} 
                 activeTable={activeTable} 
                 expandedColumns={expandedColumns}
                 toggleColumnExpand={toggleColumnExpand}
               />;
      case 'stored-procedures':
        return <StoredProcedureGenerator 
                 metadata={metadata} 
                 activeTable={activeTable} 
                 setActivePage={setActivePage}
               />;
      case 'mvc-generator':
        return <MvcGeneratorPage 
                 metadata={metadata} 
                 activeTable={activeTable}
                 setActivePage={setActivePage}
               />;
      case 'analytics':
        return <AnalyticsPage 
                 metadata={metadata} 
                 activeTable={activeTable}
               />;
      case 'diagram':
        return <DiagramPage metadata={metadata} />;
      case 'table-details':
        return <TableDetailsPanel 
                 metadata={metadata} 
                 activeTable={activeTable}
                 expandedColumns={expandedColumns}
                 toggleColumnExpand={toggleColumnExpand}
                 setActivePage={setActivePage}
               />;
      default:
        return <Overview metadata={metadata} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Collapsible Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-teal-700 to-teal-800 text-white h-full overflow-hidden"
          >
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <FaDatabase className="mr-2 text-teal-300" />
                  Database Tables
                </h2>
                <span className="text-xs bg-teal-600 px-2 py-1 rounded-full">
                  {Object.keys(metadata).length}
                </span>
              </div>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search tables..."
                  className="w-full bg-teal-600/50 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-teal-300"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className="absolute left-3 top-2.5 text-teal-300" />
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredTables.length > 0 ? (
                  <div className="space-y-1">
                    {filteredTables.map(tableName => (
                      <motion.div 
                        key={tableName}
                        whileHover={{ x: 4 }}
                        className={`cursor-pointer rounded-md overflow-hidden ${
                          activeTable === tableName ? 'bg-teal-500' : 'hover:bg-teal-600/60'
                        }`}
                      >
                        <div 
                          className="flex items-center py-2 px-3"
                          onClick={() => {
                            toggleTableExpand(tableName);
                          }}
                        >
                          <FaChevronRight className={`text-xs mr-2 transition-transform duration-200 ${
                            expandedTables[tableName] ? 'rotate-90' : ''
                          }`} />
                          <FaTable className="mr-2 text-teal-300" />
                          <span className="text-sm font-medium truncate">{tableName}</span>
                        </div>
                        
                        <AnimatePresence>
                          {expandedTables[tableName] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-6 pl-2 border-l border-teal-500"
                            >
                              <div 
                                className="py-1 px-3 text-xs flex items-center hover:bg-teal-600 rounded-md my-1"
                                onClick={() => {
                                  setActivePage('table-details');
                                }}
                              >
                                <FaColumns className="mr-2 text-teal-300" />
                                Columns
                              </div>
                              <div 
                                className="py-1 px-3 text-xs flex items-center hover:bg-teal-600 rounded-md my-1"
                                onClick={() => {
                                  setActivePage('stored-procedures');
                                }}
                              >
                                <FaCode className="mr-2 text-teal-300" />
                                Generate SP
                              </div>
                              <div 
                                className="py-1 px-3 text-xs flex items-center hover:bg-teal-600 rounded-md my-1"
                                onClick={() => {
                                  setActivePage('analytics');
                                }}
                              >
                                <FaChartLine className="mr-2 text-teal-300" />
                                Analytics
                              </div>
                              <div 
                                className="py-1 px-3 text-xs flex items-center hover:bg-teal-600 rounded-md my-1"
                                onClick={() => {
                                  setActivePage('mvc-generator');
                                }}
                              >
                                <FaKey className="mr-2 text-teal-300" />
                                MVC Generator
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-teal-300 p-4">
                    <span className="text-sm text-center">No tables match your search</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle sidebar button */}
      <motion.button
        className={`absolute z-10 top-[76px] ${sidebarOpen ? 'left-[290px]' : 'left-4'} p-1 bg-teal-600 rounded-full shadow-md`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaChevronRight className={`text-white text-xs transition-transform duration-300 ${
          sidebarOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default NewLayout;
