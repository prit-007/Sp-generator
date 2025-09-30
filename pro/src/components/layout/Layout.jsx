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
  toggleColumnExpand,
  onChangeConnection
}) => {
  return (
    <div className="flex flex-col h-screen">
      <Header onRefresh={onRefresh} onChangeConnection={onChangeConnection} />
      
      <div className="flex flex-1 overflow-hidden">
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