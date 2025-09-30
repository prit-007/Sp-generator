import React, { useState, useEffect } from 'react';
import { FaTable, FaCode, FaKey, FaColumns, FaInfoCircle, FaFileCode } from 'react-icons/fa';
import TableDetails from '../database/TableDetails';
import ForeignKeysTable from '../database/ForeignKeysTable';
import EmptyState from '../database/EmptyState';
import SPGenerator from '../database/SPGenerator';
import MvcGenerator from '../database/MvcGenerator'; // Import the new component

const MainContent = ({
  activeTable,
  metadata,
  expandedColumns,
  toggleColumnExpand
}) => {
  // Persist activeTab in localStorage to maintain it across table changes
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab || 'columns';
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleBackToEditor = () => {
    setActiveTab('columns');
  };

  if (!activeTable) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-teal-50">
      {/* Header with table info */}
      <div className="bg-white shadow-sm p-6 border-b border-teal-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center text-teal-800">
              <FaTable className="mr-3 text-teal-600" />
              {activeTable}
            </h2>
            <div className="mt-2 text-sm text-teal-600">
              <span className="font-medium mr-1">Primary Keys:</span>
              {metadata[activeTable].PrimaryKeys.length > 0 ? (
                <span className="bg-teal-100 px-2 py-1 rounded text-teal-800 text-xs font-medium">
                  {metadata[activeTable].PrimaryKeys.join(', ')}
                </span>
              ) : (
                <span className="text-teal-500">None</span>
              )}
            </div>
          </div>
          <div className="flex items-center text-sm text-teal-600">
            <FaInfoCircle className="mr-2" />
            <span>{metadata[activeTable].Columns.length} columns</span>
          </div>
        </div>
      </div>

      {/* Tabbed navigation */}
      <div className="bg-white border-b border-teal-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('columns')}
              className={`py-4 px-6 font-medium flex items-center border-b-2 ${
                activeTab === 'columns'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-teal-600 hover:text-teal-800'
              }`}
            >
              <FaColumns className="mr-2" /> Columns
            </button>
            
            <button
              onClick={() => setActiveTab('foreignKeys')}
              className={`py-4 px-6 font-medium flex items-center border-b-2 ${
                activeTab === 'foreignKeys'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-teal-600 hover:text-teal-800'
              }`}
            >
              <FaKey className="mr-2" /> Foreign Keys
            </button>
            
            <button
              onClick={() => setActiveTab('stored')}
              className={`py-4 px-6 font-medium flex items-center border-b-2 ${
                activeTab === 'stored'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-teal-600 hover:text-teal-800'
              }`}
            >
              <FaCode className="mr-2" /> Stored Procedures
            </button>

            <button
              onClick={() => setActiveTab('mvc')}
              className={`py-4 px-6 font-medium flex items-center border-b-2 ${
                activeTab === 'mvc'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-teal-600 hover:text-teal-800'
              }`}
            >
              <FaFileCode className="mr-2" /> ASP.NET MVC
            </button>
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-screen-xl mx-auto">
          {activeTab === 'columns' && (
            <TableDetails
              activeTable={activeTable}
              metadata={metadata}
              expandedColumns={expandedColumns}
              toggleColumnExpand={toggleColumnExpand}
            />
          )}

          {activeTab === 'foreignKeys' && (
            <ForeignKeysTable
              activeTable={activeTable}
              metadata={metadata}
            />
          )}

          {activeTab === 'stored' && (
            <SPGenerator
              activeTable={activeTable}
              metadata={metadata}
            />
          )}

          {activeTab === 'mvc' && (
            <MvcGenerator
              activeTable={activeTable}
              metadata={metadata}
              onBackToEditor={handleBackToEditor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent;