import React from "react";
import { FaAngleDown, FaKey, FaLink, FaInfoCircle, FaDatabase, FaExclamationTriangle, FaFilter } from "react-icons/fa";
import { BsFillShieldLockFill, BsCalendar3, BsTextareaT, BsHash } from "react-icons/bs";

const TableDetails = ({ activeTable, metadata, expandedColumns, toggleColumnExpand }) => {
  const getDataTypeIcon = (dataType) => {
    const type = dataType.toLowerCase();
    if (type.includes('int') || type.includes('decimal') || type.includes('numeric') || type.includes('float')) {
      return <BsHash className="text-blue-500" />;
    } else if (type.includes('varchar') || type.includes('char') || type.includes('text')) {
      return <BsTextareaT className="text-green-500" />;
    } else if (type.includes('date') || type.includes('time')) {
      return <BsCalendar3 className="text-orange-500" />;
    } else if (type.includes('binary') || type.includes('image')) {
      return <FaDatabase className="text-purple-500" />;
    } else {
      return <FaInfoCircle className="text-gray-500" />;
    }
  };

  // Count column types for summary
  const columnStats = {
    total: metadata[activeTable].Columns.length,
    keys: metadata[activeTable].PrimaryKeys.length,
    foreignKeys: metadata[activeTable].ForeignKeys.length,
    nullable: metadata[activeTable].Columns.filter(c => c.IsNullable).length,
    numeric: metadata[activeTable].Columns.filter(c => 
      c.Type.toLowerCase().includes('int') || 
      c.Type.toLowerCase().includes('decimal') || 
      c.Type.toLowerCase().includes('numeric')
    ).length,
    text: metadata[activeTable].Columns.filter(c => 
      c.Type.toLowerCase().includes('varchar') || 
      c.Type.toLowerCase().includes('char') || 
      c.Type.toLowerCase().includes('text')
    ).length,
    date: metadata[activeTable].Columns.filter(c => 
      c.Type.toLowerCase().includes('date') || 
      c.Type.toLowerCase().includes('time')
    ).length
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-teal-100">
      <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4 flex justify-between items-center">
        <h3 className="font-semibold text-teal-800 text-lg flex items-center">
          <FaDatabase className="mr-2 text-teal-600" />
          <span>Table Structure: <span className="text-teal-700 font-bold">{activeTable}</span></span>
        </h3>
        
        <div className="text-sm text-teal-700 flex items-center">
          <div className="flex items-center mr-3">
            <div className="h-2 w-2 rounded-full bg-teal-500 mr-1"></div>
            <span>{columnStats.total} Columns</span>
          </div>
          <div className="flex items-center mr-3">
            <FaKey className="text-amber-500 mr-1" />
            <span>{columnStats.keys} Keys</span>
          </div>
          <div className="flex items-center">
            <FaLink className="text-blue-500 mr-1" />
            <span>{columnStats.foreignKeys} Relations</span>
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-b from-teal-50 to-white">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <BsHash className="text-blue-500 text-lg" />
          </div>
          <div>
            <div className="text-xs text-blue-600 font-medium">Numeric Fields</div>
            <div className="text-xl font-bold text-blue-800">{columnStats.numeric}</div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <BsTextareaT className="text-green-500 text-lg" />
          </div>
          <div>
            <div className="text-xs text-green-600 font-medium">Text Fields</div>
            <div className="text-xl font-bold text-green-800">{columnStats.text}</div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
            <BsCalendar3 className="text-orange-500 text-lg" />
          </div>
          <div>
            <div className="text-xs text-orange-600 font-medium">Date Fields</div>
            <div className="text-xl font-bold text-orange-800">{columnStats.date}</div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-teal-100 flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <FaExclamationTriangle className="text-purple-500 text-lg" />
          </div>
          <div>
            <div className="text-xs text-purple-600 font-medium">Nullable Fields</div>
            <div className="text-xl font-bold text-purple-800">{columnStats.nullable}</div>
          </div>
        </div>
      </div>
      
      {/* Search and filter area */}
      <div className="px-4 py-3 border-t border-b border-teal-100 bg-teal-50 flex justify-between items-center">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaFilter className="w-4 h-4 text-teal-500" />
          </div>
          <input 
            type="text"
            className="border border-teal-200 text-teal-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 p-2" 
            placeholder="Filter columns..."
          />
        </div>
        
        <div className="flex items-center">
          <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 px-4 rounded-md transition duration-200 ease-in-out flex items-center mr-2">
            <span>Expand All</span>
          </button>
          <button className="bg-white hover:bg-teal-50 text-teal-700 text-sm py-2 px-4 rounded-md border border-teal-200 transition duration-200 ease-in-out flex items-center">
            <span>Collapse All</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-teal-100">
          <thead className="bg-teal-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Data Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Length</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Nullable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-teal-100">
            {metadata[activeTable].Columns.map((column, index) => (
              <React.Fragment key={index}>
                <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-teal-50'} hover:bg-teal-100 transition-colors duration-150 ease-in-out`}>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-teal-800">
                    <div className="flex items-center">
                      {getDataTypeIcon(column.Type)}
                      <span className="ml-2">{column.Name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-teal-600">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{column.Type}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-teal-600">
                    {column.MaxLength ? 
                      <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">{column.MaxLength}</span> :
                      <span className="text-gray-400">-</span>
                    }
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-teal-600">
                    {column.IsNullable ? 
                      <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">Yes</span> : 
                      <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">No</span>
                    }
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-teal-600">
                    {metadata[activeTable].PrimaryKeys.includes(column.Name) ? (
                      <div className="flex items-center">
                        <div className="bg-amber-100 rounded-full w-7 h-7 flex items-center justify-center">
                          <FaKey className="text-amber-500" title="Primary Key" />
                        </div>
                      </div>
                    ) : metadata[activeTable].ForeignKeys.some(fk => fk.Column === column.Name) ? (
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center">
                          <FaLink className="text-blue-500" title="Foreign Key" />
                        </div>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-teal-600">
                    <button 
                      onClick={() => toggleColumnExpand(activeTable, index)}
                      className="flex items-center text-teal-600 bg-teal-50 hover:bg-teal-200 px-3 py-1 rounded-md transition duration-200"
                    >
                      <span className="mr-1">{expandedColumns[activeTable] && expandedColumns[activeTable][index] ? 'Hide' : 'Details'}</span>
                      <FaAngleDown className={`transition-transform duration-200 ${
                        expandedColumns[activeTable] && expandedColumns[activeTable][index] ? 'transform rotate-180' : ''
                      }`} />
                    </button>
                  </td>
                </tr>
                {expandedColumns[activeTable] && expandedColumns[activeTable][index] && (
                  <tr className="expanded-row">
                    <td colSpan="6" className="px-6 py-4 animate-fadeIn">
                      <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg text-sm shadow-inner border border-teal-200">
                        <h4 className="font-medium text-teal-800 mb-3 flex items-center">
                          <FaInfoCircle className="mr-2 text-teal-600" />
                          Column Details: <span className="ml-1 font-bold">{column.Name}</span>
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div className="bg-white p-3 rounded-md shadow-sm border border-teal-100">
                            <h5 className="text-xs uppercase text-teal-600 font-semibold mb-2 border-b pb-1 border-teal-100">Basic Information</h5>
                            <div className="space-y-2">
                              <p className="text-teal-700 flex justify-between">
                                <span className="font-medium">Name:</span> 
                                <span className="text-teal-900">{column.Name}</span>
                              </p>
                              <p className="text-teal-700 flex justify-between">
                                <span className="font-medium">Type:</span> 
                                <span className="text-teal-900">{column.Type}</span>
                              </p>
                              <p className="text-teal-700 flex justify-between">
                                <span className="font-medium">Max Length:</span> 
                                <span className="text-teal-900">{column.MaxLength || 'N/A'}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-md shadow-sm border border-teal-100">
                            <h5 className="text-xs uppercase text-teal-600 font-semibold mb-2 border-b pb-1 border-teal-100">Constraints</h5>
                            <div className="space-y-2">
                              <p className="text-teal-700 flex justify-between">
                                <span className="font-medium">Nullable:</span>
                                <span className={`${column.IsNullable ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                  {column.IsNullable ? 'Yes' : 'No'}
                                </span>
                              </p>
                              <p className="text-teal-700 flex justify-between">
                                <span className="font-medium">Primary Key:</span>
                                <span className={`${metadata[activeTable].PrimaryKeys.includes(column.Name) ? 'text-amber-600' : 'text-slate-600'} font-medium`}>
                                  {metadata[activeTable].PrimaryKeys.includes(column.Name) ? 'Yes' : 'No'}
                                </span>
                              </p>
                              <p className="text-teal-700 flex justify-between">
                                <span className="font-medium">Identity:</span>
                                <span className="text-slate-600 font-medium">
                                  {metadata[activeTable].PrimaryKeys.includes(column.Name) && column.Type.toLowerCase() === 'int' ? 'Yes' : 'No'}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-md shadow-sm border border-teal-100">
                            <h5 className="text-xs uppercase text-teal-600 font-semibold mb-2 border-b pb-1 border-teal-100">Relationships</h5>
                            <div className="space-y-2">
                              {metadata[activeTable].ForeignKeys.some(fk => fk.Column === column.Name) ? (
                                <>
                                  <p className="text-teal-700 flex justify-between">
                                    <span className="font-medium">Foreign Key:</span>
                                    <span className="text-blue-600 font-medium">Yes</span>
                                  </p>
                                  <p className="text-teal-700 flex justify-between">
                                    <span className="font-medium">References:</span>
                                    <span className="text-blue-600 font-medium">
                                      {metadata[activeTable].ForeignKeys.find(fk => fk.Column === column.Name).ReferenceTable}
                                    </span>
                                  </p>
                                  <p className="text-teal-700 flex justify-between">
                                    <span className="font-medium">Ref Column:</span>
                                    <span className="text-blue-600 font-medium">
                                      {metadata[activeTable].ForeignKeys.find(fk => fk.Column === column.Name).ReferenceColumn}
                                    </span>
                                  </p>
                                </>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 italic">
                                  No relationships defined
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs py-1 px-3 rounded transition duration-200"
                            onClick={() => toggleColumnExpand(activeTable, index)}
                          >
                            Close Details
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {metadata[activeTable].Columns.length === 0 && (
        <div className="py-8 px-6 text-center">
          <div className="text-teal-500 flex justify-center mb-3">
            <FaExclamationTriangle size={24} />
          </div>
          <h3 className="text-lg font-medium text-teal-800 mb-1">No Columns Found</h3>
          <p className="text-teal-600">This table doesn't have any columns defined in the metadata.</p>
        </div>
      )}
      
      <div className="border-t border-teal-100 bg-teal-50 px-6 py-3 text-xs text-teal-600 font-medium flex justify-between">
        <div>Total: {metadata[activeTable].Columns.length} columns</div>
        <div>Primary Keys: {metadata[activeTable].PrimaryKeys.join(', ') || 'None'}</div>
      </div>
    </div>
  );
};

export default TableDetails;