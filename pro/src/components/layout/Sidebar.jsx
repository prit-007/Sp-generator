import React from 'react';
import { FaTable, FaChevronDown, FaChevronRight, FaSearch, FaDownload, FaDatabase } from 'react-icons/fa';

const Sidebar = ({ 
  metadata, 
  searchTerm, 
  handleSearch, 
  filteredTables, 
  expandedTables, 
  toggleTableExpand, 
  activeTable, 
  exportMetadata 
}) => {
  return (
    <div className="w-1/4 bg-gradient-to-b from-teal-600 to-teal-700 text-white flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-teal-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaDatabase className="text-teal-200 text-xl mr-2" />
            <h1 className="text-xl font-bold text-white">Database Explorer</h1>
          </div>
          <button 
            onClick={exportMetadata}
            className="p-2 bg-teal-500 rounded-full text-teal-100 hover:text-white hover:bg-teal-400 transition duration-200" 
            title="Export metadata"
          >
            <FaDownload className="text-sm" />
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search tables..."
            className="w-full bg-teal-500 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-teal-200"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="absolute left-3 top-4 text-teal-200" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filteredTables.length > 0 ? (
          <div className="space-y-1 py-2">
            {filteredTables.map(tableName => (
              <div key={tableName} className="cursor-pointer">
                <div 
                  className={`flex items-center py-3 px-4 rounded-lg transition duration-200 ${
                    activeTable === tableName 
                      ? 'bg-teal-500 shadow-md' 
                      : 'hover:bg-teal-600'
                  }`}
                  onClick={() => toggleTableExpand(tableName)}
                >
                  <span className="w-4 mr-2 flex-shrink-0">
                    {expandedTables[tableName] ? 
                      <FaChevronDown className="text-yellow-300 w-3" /> : 
                      <FaChevronRight className="text-yellow-300 w-3" />
                    }
                  </span>
                  <FaTable className="mr-2 text-cyan-200 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{tableName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-teal-200 p-4">
            <span className="text-sm text-center">No tables match your search</span>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-teal-500 bg-teal-600 text-xs text-teal-200 text-center">
        {Object.keys(metadata).length} tables found
      </div>
    </div>
  );
};

export default Sidebar;