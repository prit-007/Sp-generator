import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTable, FaColumns, FaKey, FaLink, FaCode, FaFileCode, FaChartLine } from 'react-icons/fa';

const TableDetailsPanel = ({ metadata, activeTable, expandedColumns, toggleColumnExpand, setActivePage }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!activeTable || !metadata[activeTable]) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <FaTable className="mx-auto text-5xl text-teal-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Table Selected</h2>
          <p className="text-gray-500">Select a table from the sidebar to view its details</p>
        </div>
      </div>
    );
  }

  const tableData = metadata[activeTable];
  const primaryKeys = tableData.PrimaryKeys || [];
  const foreignKeys = tableData.ForeignKeys || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Table Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-teal-700 mb-4">Table Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Table Name:</span>
                    <span className="font-medium text-gray-800">{activeTable}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Column Count:</span>
                    <span className="font-medium text-gray-800">{tableData.Columns.length}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Primary Keys:</span>
                    <span className="font-medium text-gray-800">
                      {primaryKeys.length > 0 ? primaryKeys.join(', ') : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Foreign Keys:</span>
                    <span className="font-medium text-gray-800">{foreignKeys.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-teal-700 mb-4">Key Columns</h3>
                {primaryKeys.length > 0 ? (
                  <div className="space-y-2">
                    {primaryKeys.map((key) => {
                      const column = tableData.Columns.find(c => c.Name === key);
                      return (
                        <div key={key} className="p-2 bg-teal-50 rounded flex items-center">
                          <FaKey className="text-teal-600 mr-2" />
                          <div>
                            <div className="font-medium text-gray-800">{key}</div>
                            <div className="text-xs text-gray-500">
                              {column ? `${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No primary keys defined</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-medium text-teal-700 mb-4">Available Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActivePage('stored-procedures')}
                  className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <FaCode className="text-2xl text-teal-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Generate Stored Procedures</span>
                </button>
                
                <button 
                  onClick={() => setActivePage('mvc-generator')}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaFileCode className="text-2xl text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Generate MVC Code</span>
                </button>
                
                <button 
                  onClick={() => setActivePage('analytics')}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FaChartLine className="text-2xl text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Analyze Data</span>
                </button>
                
                <button 
                  onClick={() => setActivePage('database-explorer')}
                  className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <FaColumns className="text-2xl text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">View All Columns</span>
                </button>
              </div>
            </div>

            {foreignKeys.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-teal-700 mb-4">Relationships</h3>
                <div className="space-y-4">
                  {foreignKeys.map((fk, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaLink className="text-purple-600 mr-2" />
                        <span className="font-medium text-gray-800">
                          {fk.ColumnName} → {fk.ReferencedTable}.{fk.ReferencedColumn}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Constraint: {fk.ConstraintName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'columns':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Columns</h2>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nullable</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.Columns.map((column) => {
                    const isPrimaryKey = primaryKeys.includes(column.Name);
                    const isForeignKey = foreignKeys.some(fk => fk.ColumnName === column.Name);
                    
                    return (
                      <tr key={column.Name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {column.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.Type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.MaxLength !== null ? column.MaxLength : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.IsNullable ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isPrimaryKey && <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800 mr-1">Primary</span>}
                          {isForeignKey && <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Foreign</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'relationships':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Relationships</h2>
            
            {foreignKeys.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foreign Key</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">References Table</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">References Column</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constraint Name</th>
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
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <FaLink className="mx-auto text-4xl text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Relationships Found</h3>
                <p className="text-gray-500">This table does not have any foreign key relationships.</p>
              </div>
            )}
            
            {/* Tables Referencing This Table */}
            <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4">Tables Referencing {activeTable}</h3>
            
            {Object.entries(metadata).some(([tableName, tableData]) => 
              tableData.ForeignKeys && tableData.ForeignKeys.some(fk => fk.ReferencedTable === activeTable)
            ) ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foreign Key</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">References Column</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constraint Name</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(metadata)
                      .filter(([tableName, tableData]) => 
                        tableData.ForeignKeys && tableData.ForeignKeys.some(fk => fk.ReferencedTable === activeTable)
                      )
                      .flatMap(([tableName, tableData]) => 
                        tableData.ForeignKeys
                          .filter(fk => fk.ReferencedTable === activeTable)
                          .map((fk, index) => (
                            <tr key={`${tableName}-${index}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 font-medium">
                                {tableName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {fk.ColumnName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fk.ReferencedColumn}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fk.ConstraintName}
                              </td>
                            </tr>
                          ))
                      )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <FaLink className="mx-auto text-4xl text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No References Found</h3>
                <p className="text-gray-500">No other tables reference this table.</p>
              </div>
            )}
          </div>
        );
      
      default:
        return <div>No content available</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 bg-white border-b border-gray-200 flex items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-teal-800 flex items-center">
            <FaTable className="mr-2 text-teal-600" />
            {activeTable}
          </h1>
        </div>
        
        <div className="flex">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`ml-2 px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'overview' 
                ? 'bg-teal-100 text-teal-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('columns')}
            className={`ml-2 px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'columns' 
                ? 'bg-teal-100 text-teal-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Columns
          </button>
          <button 
            onClick={() => setActiveTab('relationships')}
            className={`ml-2 px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'relationships' 
                ? 'bg-teal-100 text-teal-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Relationships
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-50">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TableDetailsPanel;
