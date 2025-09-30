import React from 'react';
import MvcGenerator from '../database/MvcGenerator';

const MvcGeneratorPage = ({ metadata, activeTable, setActivePage }) => {
  const handleBackToEditor = () => {
    // Go back to table details when back to editor is clicked
    if (setActivePage) {
      setActivePage('table-details');
    }
  };
  
  return (
    <MvcGenerator
      activeTable={activeTable}
      metadata={metadata}
      onBackToEditor={handleBackToEditor}
    />
  );
};

export default MvcGeneratorPage;
