import React from "react";
import { FaAngleDown, FaKey } from "react-icons/fa";

const TableDetails = ({ activeTable, metadata, expandedColumns, toggleColumnExpand }) => {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-teal-100">
        <div className="border-b border-teal-100 bg-teal-50 px-6 py-4">
          <h3 className="font-semibold text-teal-800 text-lg">Columns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-teal-100">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Data Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Length</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Nullable</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Key</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-teal-100">
              {metadata[activeTable].Columns.map((column, index) => (
                <React.Fragment key={index}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-teal-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-800">{column.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">{column.Type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">{column.MaxLength || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">
                      {column.IsNullable ? 
                        <span className="text-green-600">Yes</span> : 
                        <span className="text-red-600">No</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">
                      {metadata[activeTable].PrimaryKeys.includes(column.Name) && (
                        <FaKey className="text-amber-500" title="Primary Key" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">
                      <button 
                        onClick={() => toggleColumnExpand(activeTable, index)}
                        className="flex items-center text-teal-600 hover:text-orange-600 transition duration-200"
                      >
                        <span className="mr-1">Details</span>
                        <FaAngleDown className={`transition-transform duration-200 ${
                          expandedColumns[activeTable] && expandedColumns[activeTable][index] ? 'transform rotate-180' : ''
                        }`} />
                      </button>
                    </td>
                  </tr>
                  {expandedColumns[activeTable] && expandedColumns[activeTable][index] && (
                    <tr className={index % 2 === 0 ? 'bg-teal-50' : 'bg-white'}>
                      <td colSpan="6" className="px-6 py-4">
                        <div className="bg-teal-100 p-4 rounded-lg text-sm">
                          <h4 className="font-medium text-teal-800 mb-2">Column Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-teal-700"><span className="font-medium">Name:</span> {column.Name}</p>
                              <p className="text-teal-700"><span className="font-medium">Type:</span> {column.Type}</p>
                              <p className="text-teal-700"><span className="font-medium">Max Length:</span> {column.MaxLength || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-teal-700">
                                <span className="font-medium">Nullable:</span> {column.IsNullable ? 'Yes' : 'No'}
                              </p>
                              <p className="text-teal-700">
                                <span className="font-medium">Primary Key:</span> {metadata[activeTable].PrimaryKeys.includes(column.Name) ? 'Yes' : 'No'}
                              </p>
                              {metadata[activeTable].ForeignKeys.some(fk => fk.Column === column.Name) && (
                                <p className="text-teal-700">
                                  <span className="font-medium">Foreign Key:</span> Yes
                                </p>
                              )}
                            </div>
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
      </div>
    );
  };

export default TableDetails;
  