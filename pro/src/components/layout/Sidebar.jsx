import React from 'react';
import { FaTable, FaChevronDown, FaChevronRight, FaSearch, FaDownload } from 'react-icons/fa';

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

export default Sidebar;