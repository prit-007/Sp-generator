import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaColumns, FaKey, FaSearch, FaFilter, FaSortAlphaDown, FaSortAlphaUp, FaDatabase } from 'react-icons/fa';

const DatabaseExplorer = ({ metadata, activeTable, expandedColumns, toggleColumnExpand }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    showPrimaryKeys: true,
    showNonPrimaryKeys: true,
    showForeignKeys: true,
    showNonForeignKeys: true,
    showNullable: true,
    showNonNullable: true,
    dataType: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  if (!activeTable || !metadata[activeTable]) {
    return (
      <div className="h-full flex flex-col">
        <motion.div 
          className="relative bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-6 rounded-b-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <motion.div 
              className="absolute top-10 right-10 w-40 h-40 bg-blue-400 rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.2, 1], 
                x: [0, 10, 0], 
                y: [0, -10, 0] 
              }} 
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.1, 1],
                x: [0, -15, 0],
                y: [0, 10, 0]
              }} 
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
          </div>

          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-5">
              {/* Logo */}
              <motion.div 
                className="flex items-center justify-center w-14 h-14 bg-indigo-600/50 backdrop-blur-sm rounded-2xl border border-indigo-400/30 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <FaDatabase className="text-3xl text-yellow-100" />
                  <motion.div 
                    className="absolute -right-2 -top-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Title Section */}
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="text-3xl font-extrabold tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                      Database Explorer
                    </span>
                  </h3>
                  <div className="relative ml-3">
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                    <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                  </div>
                </div>
                <p className="text-blue-100 font-light">
                  Choose a table from the sidebar to view its columns, keys, and other details
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <FaDatabase className="mx-auto text-5xl text-teal-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Select a Table</h2>
            <p className="text-gray-500">
              Choose a table from the sidebar to view its columns, keys, and other details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tableData = metadata[activeTable];
  const primaryKeys = tableData.PrimaryKeys || [];
  const foreignKeys = tableData.ForeignKeys || [];
  const foreignKeyColumns = foreignKeys.map(fk => fk.ColumnName);

  // Apply search and filters
  const filteredColumns = tableData.Columns.filter(column => {
    // Search filter
    if (searchTerm && !column.Name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Primary key filter
    const isPrimaryKey = primaryKeys.includes(column.Name);
    if ((isPrimaryKey && !filters.showPrimaryKeys) || (!isPrimaryKey && !filters.showNonPrimaryKeys)) {
      return false;
    }
    
    // Foreign key filter
    const isForeignKey = foreignKeyColumns.includes(column.Name);
    if ((isForeignKey && !filters.showForeignKeys) || (!isForeignKey && !filters.showNonForeignKeys)) {
      return false;
    }
    
    // Nullable filter
    if ((column.IsNullable && !filters.showNullable) || (!column.IsNullable && !filters.showNonNullable)) {
      return false;
    }
    
    // Data type filter
    if (filters.dataType !== 'all' && !column.Type.toLowerCase().includes(filters.dataType.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort columns
  const sortedColumns = [...filteredColumns].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'Name') {
      comparison = a.Name.localeCompare(b.Name);
    } else if (sortField === 'Type') {
      comparison = a.Type.localeCompare(b.Type);
    } else if (sortField === 'IsNullable') {
      comparison = (a.IsNullable === b.IsNullable) ? 0 : a.IsNullable ? 1 : -1;
    } else if (sortField === 'MaxLength') {
      const aLength = a.MaxLength === null ? Infinity : a.MaxLength;
      const bLength = b.MaxLength === null ? Infinity : b.MaxLength;
      comparison = aLength - bLength;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Get unique data types for filter dropdown
  const dataTypes = [...new Set(tableData.Columns.map(col => col.Type))];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div 
        className="relative bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-6 rounded-b-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div 
            className="absolute top-10 right-10 w-40 h-40 bg-blue-400 rounded-full opacity-10"
            animate={{ 
              scale: [1, 1.2, 1], 
              x: [0, 10, 0], 
              y: [0, -10, 0] 
            }} 
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-10"
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, -15, 0],
              y: [0, 10, 0]
            }} 
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-5">
            {/* Logo */}
            <motion.div 
              className="flex items-center justify-center w-14 h-14 bg-indigo-600/50 backdrop-blur-sm rounded-2xl border border-indigo-400/30 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <FaDatabase className="text-3xl text-yellow-100" />
                <motion.div 
                  className="absolute -right-2 -top-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Title Section */}
            <div>
              <div className="flex items-center mb-1">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                    {activeTable}
                  </span>
                </h3>
                <div className="relative ml-3">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                  <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                </div>
              </div>
              <p className="text-blue-100 font-light">
                Exploring the structure and columns of the {activeTable} table
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search columns..."
                  className="w-full py-2 pl-9 pr-4 rounded-lg bg-indigo-600/40 backdrop-blur-sm border border-indigo-400/30 text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-blue-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-blue-300" />
              </div>
              
              <motion.button
                className={`flex items-center justify-center w-9 h-9 ${showFilters ? 'bg-blue-500/60' : 'bg-indigo-600/40'} backdrop-blur-sm rounded-xl border border-indigo-400/30 text-white hover:bg-indigo-500/50 transition-all duration-200`}
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFilter className="text-yellow-100" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Key Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-teal-600 focus:ring-teal-500"
                    checked={filters.showPrimaryKeys}
                    onChange={() => setFilters({...filters, showPrimaryKeys: !filters.showPrimaryKeys})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Primary Keys</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-teal-600 focus:ring-teal-500"
                    checked={filters.showNonPrimaryKeys}
                    onChange={() => setFilters({...filters, showNonPrimaryKeys: !filters.showNonPrimaryKeys})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Non-Primary Keys</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-teal-600 focus:ring-teal-500"
                    checked={filters.showForeignKeys}
                    onChange={() => setFilters({...filters, showForeignKeys: !filters.showForeignKeys})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Foreign Keys</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-teal-600 focus:ring-teal-500"
                    checked={filters.showNonForeignKeys}
                    onChange={() => setFilters({...filters, showNonForeignKeys: !filters.showNonForeignKeys})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Non-Foreign Keys</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Nullable Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-teal-600 focus:ring-teal-500"
                    checked={filters.showNullable}
                    onChange={() => setFilters({...filters, showNullable: !filters.showNullable})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Nullable Columns</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-teal-600 focus:ring-teal-500"
                    checked={filters.showNonNullable}
                    onChange={() => setFilters({...filters, showNonNullable: !filters.showNonNullable})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Non-Nullable Columns</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Data Type Filter</h3>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                value={filters.dataType}
                onChange={(e) => setFilters({...filters, dataType: e.target.value})}
              >
                <option value="all">All Types</option>
                {dataTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Table content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Name')}
                >
                  <div className="flex items-center">
                    Column Name
                    {sortField === 'Name' && (
                      sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Type')}
                >
                  <div className="flex items-center">
                    Data Type
                    {sortField === 'Type' && (
                      sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('IsNullable')}
                >
                  <div className="flex items-center">
                    Nullable
                    {sortField === 'IsNullable' && (
                      sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('MaxLength')}
                >
                  <div className="flex items-center">
                    Max Length
                    {sortField === 'MaxLength' && (
                      sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keys
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedColumns.map((column, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {column.Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.Type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.IsNullable ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.MaxLength === -1 ? 'MAX' : column.MaxLength || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {primaryKeys.includes(column.Name) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FaKey className="mr-1 text-yellow-600" /> Primary
                        </span>
                      )}
                      {foreignKeyColumns.includes(column.Name) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FaKey className="mr-1 text-purple-600" /> Foreign
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Display foreign keys */}
        {foreignKeys.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Foreign Key Relationships</h2>
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Column
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    References Table
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    References Column
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Constraint
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {foreignKeys.map((fk, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fk.ColumnName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 font-medium">
                      {fk.ReferencedTable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fk.ReferencedColumn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fk.ConstraintName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseExplorer;