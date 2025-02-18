import React from 'react';
import { FaTable } from 'react-icons/fa';
import TableDetails from '../database/TableDetails';
import ForeignKeysTable from '../database/ForeignKeysTable';
import EmptyState from '../database/EmptyState';
import SPGenerator from '../database/SPGenerator';

const MainContent = ({ 
  activeTable, 
  metadata,
  expandedColumns,
  toggleColumnExpand
}) => {
  if (!activeTable) {
    return <EmptyState />;
  }
  
  return (
    <div className="w-3/4 p-8 overflow-y-auto">
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3 flex items-center text-teal-800">
            <FaTable className="mr-3 text-teal-600" />
            {activeTable}
          </h2>
          <div className="text-sm bg-white p-4 rounded-lg shadow-sm inline-block">
            <span className="font-medium text-teal-800">Primary Keys:</span>{' '}
            <span className="text-teal-600">{metadata[activeTable].PrimaryKeys.join(', ') || 'None'}</span>
          </div>
        </div>
        
        {/* SP Generator */}
        <SPGenerator 
          activeTable={activeTable}
          metadata={metadata}
        />
        
        {/* Table Details Component */}
        <TableDetails 
          activeTable={activeTable}
          metadata={metadata}
          expandedColumns={expandedColumns}
          toggleColumnExpand={toggleColumnExpand}
        />
        
        {/* Foreign Keys Component */}
        <ForeignKeysTable 
          activeTable={activeTable}
          metadata={metadata}
        />
      </div>
    </div>
  );
};

export default MainContent;