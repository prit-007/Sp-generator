
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Layout = ({
  metadata,
  onRefresh,
  searchTerm,
  handleSearch,
  filteredTables,
  expandedTables,
  toggleTableExpand,
  activeTable,
  exportMetadata,
  expandedColumns,
  toggleColumnExpand
}) => {
  return (
    <div className="min-h-screen bg-teal-50">
      <Header onRefresh={onRefresh} />
      
      <div className="flex max-h-[calc(100vh-64px)]">
        <Sidebar 
          metadata={metadata}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          filteredTables={filteredTables}
          expandedTables={expandedTables}
          toggleTableExpand={toggleTableExpand}
          activeTable={activeTable}
          exportMetadata={exportMetadata}
        />
        
        <MainContent 
          activeTable={activeTable}
          metadata={metadata}
          expandedColumns={expandedColumns}
          toggleColumnExpand={toggleColumnExpand}
        />
      </div>
    </div>
  );
};

export default Layout;