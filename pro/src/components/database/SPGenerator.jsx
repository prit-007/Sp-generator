import React, { useState } from 'react';
import { FaCode, FaCopy, FaDownload, FaInfoCircle, FaPlay, FaPlus, FaMinus, FaKey } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const SPGenerator = ({ activeTable, metadata }) => {
  const [spType, setSpType] = useState('select');
  const [includedColumns, setIncludedColumns] = useState([]);
  const [whereClauses, setWhereClauses] = useState([]);
  const [generatedSP, setGeneratedSP] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [foreignKeySelections, setForeignKeySelections] = useState({});
  const [foreignKeyColumns, setForeignKeyColumns] = useState({});

  // Initialize foreign key selections
  React.useEffect(() => {
    const initialFKSelections = {};
    const initialFKColumns = {};

    metadata[activeTable].ForeignKeys.forEach(fk => {
      initialFKSelections[fk.Column] = false;
      initialFKColumns[fk.Column] = [];
    });

    setForeignKeySelections(initialFKSelections);
    setForeignKeyColumns(initialFKColumns);
  }, [activeTable, metadata]);

  const handleSelectAll = () => {
    setIncludedColumns(metadata[activeTable].Columns.map(col => col.Name));
  };

  const handleSelectNone = () => {
    setIncludedColumns([]);
  };

  const handleColumnToggle = (columnName) => {
    if (includedColumns.includes(columnName)) {
      setIncludedColumns(includedColumns.filter(col => col !== columnName));
    } else {
      setIncludedColumns([...includedColumns, columnName]);
    }
  };

  const handleWhereClauseToggle = (columnName) => {
    if (whereClauses.includes(columnName)) {
      setWhereClauses(whereClauses.filter(col => col !== columnName));
    } else {
      setWhereClauses([...whereClauses, columnName]);
    }
  };

  const toggleForeignKeySelection = (fkColumn) => {
    setForeignKeySelections({
      ...foreignKeySelections,
      [fkColumn]: !foreignKeySelections[fkColumn]
    });
  };

  const handleFKColumnToggle = (fkColumn, refColumnName) => {
    const currentColumns = foreignKeyColumns[fkColumn] || [];

    if (currentColumns.includes(refColumnName)) {
      setForeignKeyColumns({
        ...foreignKeyColumns,
        [fkColumn]: currentColumns.filter(col => col !== refColumnName)
      });
    } else {
      setForeignKeyColumns({
        ...foreignKeyColumns,
        [fkColumn]: [...currentColumns, refColumnName]
      });
    }
  };

  const generateSP = () => {
    setError('');
    const columns = includedColumns.length > 0 ?
      includedColumns :
      metadata[activeTable].Columns.map(col => col.Name);

    let sp = '';

    try {
      switch (spType) {
        case 'select':
          sp = generateSelectSP(activeTable, columns, whereClauses);
          break;
        case 'insert':
          sp = generateInsertSP(activeTable, columns);
          break;
        case 'update':
          sp = generateUpdateSP(activeTable, columns, whereClauses);
          break;
        case 'delete':
          sp = generateDeleteSP(activeTable, whereClauses);
          break;
        default:
          sp = 'Select a procedure type';
      }
    } catch (err) {
      setError(err.message);
    }

    setGeneratedSP(sp);
    setShowPreview(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSP);
    // Show a temporary success message
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
      const originalText = copyButton.innerText;
      copyButton.innerText = 'Copied!';
      setTimeout(() => {
        copyButton.innerText = originalText;
      }, 2000);
    }
  };

  const downloadSP = () => {
    const blob = new Blob([generatedSP], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SP_${spType}_${activeTable}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getColumnDataType = (columnName) => {
    const column = metadata[activeTable].Columns.find(col => col.Name === columnName);
    if (!column) throw new Error(`Column ${columnName} not found in metadata`);

    switch (column.Type.toLowerCase()) {
      case 'int':
        return 'INT';
      case 'nvarchar':
        return `NVARCHAR(${column.MaxLength || 255})`;
      case 'datetime':
        return 'DATETIME';
      case 'decimal':
        return 'DECIMAL(18, 2)';
      case 'bit':
        return 'BIT';
      default:
        return 'NVARCHAR(255)';
    }
  };

  const generateSelectSP = (tableName, columns, whereClauses) => {
    let selectedColumns = [...columns];
    let columnsList = '';
    let whereParams = '';
    let whereClause = '';
    let joins = '';

    // Handle foreign key selections
    metadata[activeTable].ForeignKeys.forEach(fk => {
        if (foreignKeySelections[fk.Column]) {
            const refColumns = foreignKeyColumns[fk.Column];

            joins += `\n\tLEFT JOIN ${fk.ReferenceTable} ON ${tableName}.${fk.Column} = ${fk.ReferenceTable}.${fk.ReferenceColumn}`;

            // Add selected foreign key columns to the SELECT clause
            if (refColumns && refColumns.length > 0) {
                refColumns.forEach(refCol => {
                    selectedColumns.push(`\t${fk.ReferenceTable}.${refCol} AS ${fk.ReferenceTable}_${refCol}`);
                });
            }
        }
    });

    columnsList = selectedColumns.map(col => {
        if (col.includes(' AS ')) return col;
        return `\t${tableName}.${col}`;
    }).join(',\n\t\t');

    if (whereClauses.length > 0) {
        whereParams = whereClauses.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n\t\t');
        whereClause = 'WHERE ' + whereClauses.map(col => `${tableName}.${col} = @${col}`).join('\n\t\tAND ');
    }

    return `CREATE PROCEDURE SP_Select_${tableName}
    ${whereParams ? '\t' + whereParams : ''}
    AS
    BEGIN
        SELECT 
          ${columnsList}
        FROM ${tableName}${joins}
        ${whereClause}
    END
    GO`;
};

  const generateInsertSP = (tableName, columns) => {
    const columnsList = columns.join(', ');
    const paramsList = columns.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n  ');
    const valuesList = columns.map(col => `@${col}`).join(', ');

    return `CREATE PROCEDURE SP_Insert_${tableName}
  ${paramsList}
AS
BEGIN
  INSERT INTO ${tableName} (${columnsList})
  VALUES (${valuesList})
END
GO`;
  };

  const generateUpdateSP = (tableName, columns, whereClauses) => {
    if (whereClauses.length === 0) {
      throw new Error('At least one WHERE clause is required for UPDATE procedure');
    }

    const updateColumns = columns.filter(col => !whereClauses.includes(col));
    const setClause = updateColumns.map(col => `${col} = @${col}`).join(',\n    ');
    const whereClause = 'WHERE ' + whereClauses.map(col => `${col} = @${col}`).join('\n  AND ');

    const allParams = [...columns, ...whereClauses.filter(w => !columns.includes(w))];
    const paramsList = allParams.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n  ');

    return `CREATE PROCEDURE SP_Update_${tableName}
  ${paramsList}
AS
BEGIN
  UPDATE ${tableName}
  SET ${setClause}
  ${whereClause}
END
GO`;
  };

  const generateDeleteSP = (tableName, whereClauses) => {
    if (whereClauses.length === 0) {
      throw new Error('At least one WHERE clause is required for DELETE procedure');
    }

    const paramsList = whereClauses.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n  ');
    const whereClause = 'WHERE ' + whereClauses.map(col => `${col} = @${col}`).join('\n  AND ');

    return `CREATE PROCEDURE SP_Delete_${tableName}
  ${paramsList}
AS
BEGIN
  DELETE FROM ${tableName}
  ${whereClause}
END
GO`;
  };

  // Get reference table columns for a foreign key
  const getReferenceTableColumns = (fkColumn) => {
    const foreignKey = metadata[activeTable].ForeignKeys.find(fk => fk.Column === fkColumn);
    if (!foreignKey || !metadata[foreignKey.ReferenceTable]) return [];

    return metadata[foreignKey.ReferenceTable].Columns;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-teal-100 mb-8">
      <div className="border-b border-teal-100 bg-teal-50 px-6 py-4 flex justify-between items-center">
        <h3 className="font-semibold text-teal-800 text-lg flex items-center">
          <FaCode className="mr-2 text-orange-500" />
          Stored Procedure Generator
        </h3>
        {showPreview && (
          <button
            onClick={() => setShowPreview(false)}
            className="text-sm px-3 py-1 bg-teal-100 rounded-md hover:bg-teal-200 text-teal-700 transition duration-200"
          >
            Back to Editor
          </button>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
            <FaInfoCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!showPreview ? (
          <>
            <div className="mb-6">
              <label className="block text-teal-700 font-medium mb-2 flex items-center">
                Procedure Type
                <FaInfoCircle
                  className="ml-2 text-teal-500 cursor-pointer"
                  data-tooltip-id="sp-type-tooltip"
                  data-tooltip-content="Choose the type of stored procedure to generate"
                />
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['select', 'insert', 'update', 'delete'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSpType(type)}
                    className={`px-4 py-3 rounded-lg capitalize shadow-sm transition duration-200 ${spType === type
                        ? 'bg-teal-600 text-white font-medium'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg border border-teal-100 shadow-sm">
                <div className="px-4 py-3 bg-teal-50 border-b border-teal-100 flex justify-between items-center">
                  <h4 className="font-medium text-teal-700">Columns to Include</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs px-2 py-1 bg-teal-100 rounded hover:bg-teal-200 text-teal-700 transition duration-200 flex items-center"
                    >
                      <FaPlus className="mr-1" size={10} /> All
                    </button>
                    <button
                      onClick={handleSelectNone}
                      className="text-xs px-2 py-1 bg-teal-100 rounded hover:bg-teal-200 text-teal-700 transition duration-200 flex items-center"
                    >
                      <FaMinus className="mr-1" size={10} /> None
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    {metadata[activeTable].Columns.map(column => (
                      <div key={column.Name} className="flex items-center py-2 px-3 rounded hover:bg-teal-50">
                        <input
                          type="checkbox"
                          id={`col-${column.Name}`}
                          checked={includedColumns.includes(column.Name)}
                          onChange={() => handleColumnToggle(column.Name)}
                          className="mr-3 h-4 w-4 text-teal-600 border-teal-300 rounded focus:ring-teal-500"
                        />
                        <label
                          htmlFor={`col-${column.Name}`}
                          className="text-sm text-teal-800 font-medium flex-1 cursor-pointer"
                        >
                          {column.Name}
                        </label>
                        <span className="text-xs py-1 px-2 bg-teal-100 text-teal-600 rounded">{column.Type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2 bg-teal-50 border-t border-teal-100">
                  <p className="text-xs text-teal-600">
                    If none selected, all columns will be included
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-teal-100 shadow-sm">
                <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
                  <h4 className="font-medium text-teal-700">Where Clauses</h4>
                </div>
                <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    {metadata[activeTable].Columns.map(column => (
                      <div key={column.Name} className="flex items-center py-2 px-3 rounded hover:bg-teal-50">
                        <input
                          type="checkbox"
                          id={`where-${column.Name}`}
                          checked={whereClauses.includes(column.Name)}
                          onChange={() => handleWhereClauseToggle(column.Name)}
                          className="mr-3 h-4 w-4 text-orange-500 border-orange-300 rounded focus:ring-orange-500"
                        />
                        <label
                          htmlFor={`where-${column.Name}`}
                          className="text-sm text-teal-800 font-medium flex-1 cursor-pointer"
                        >
                          {column.Name}
                        </label>
                        <span className="text-xs py-1 px-2 bg-teal-100 text-teal-600 rounded">{column.Type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2 bg-teal-50 border-t border-teal-100">
                  <p className="text-xs text-teal-600">
                    {spType === 'select' ? 'Optional parameter conditions' : 'Required for update/delete operations'}
                  </p>
                </div>
              </div>
            </div>

            {/* Foreign Key Selections (Only for SELECT procedures) */}
            {spType === 'select' && metadata[activeTable].ForeignKeys.length > 0 && (
              <div className="mb-6 bg-white rounded-lg border border-teal-100 shadow-sm">
                <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
                  <h4 className="font-medium text-teal-700 flex items-center">
                    <FaKey className="mr-2 text-amber-600" />
                    Include Foreign Key Joins
                  </h4>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {metadata[activeTable].ForeignKeys.map((fk) => (
                      <div key={fk.Column} className="border border-teal-100 rounded-lg">
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-teal-50"
                          onClick={() => toggleForeignKeySelection(fk.Column)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`fk-${fk.Column}`}
                              checked={foreignKeySelections[fk.Column] || false}
                              onChange={() => toggleForeignKeySelection(fk.Column)}
                              className="mr-3 h-4 w-4 text-amber-500 border-amber-300 rounded focus:ring-amber-500"
                            />
                            <label htmlFor={`fk-${fk.Column}`} className="cursor-pointer">
                              <span className="text-sm font-medium text-teal-800">{fk.Column}</span>
                              <span className="text-xs ml-2 text-teal-600">→ {fk.ReferenceTable}.{fk.ReferenceColumn}</span>
                            </label>
                          </div>
                        </div>

                        {foreignKeySelections[fk.Column] && (
                          <div className="border-t border-teal-100 bg-teal-50 p-3">
                            <p className="text-xs text-teal-700 mb-2">Select columns to include from {fk.ReferenceTable}:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {getReferenceTableColumns(fk.Column).map(refCol => (
                                <div key={refCol.Name} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`fkCol-${fk.Column}-${refCol.Name}`}
                                    checked={(foreignKeyColumns[fk.Column] || []).includes(refCol.Name)}
                                    onChange={() => handleFKColumnToggle(fk.Column, refCol.Name)}
                                    className="mr-2 h-3 w-3 text-amber-500 border-amber-300 rounded focus:ring-amber-500"
                                  />
                                  <label
                                    htmlFor={`fkCol-${fk.Column}-${refCol.Name}`}
                                    className="text-xs text-teal-700 cursor-pointer truncate"
                                  >
                                    {refCol.Name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                onClick={generateSP}
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg 
                   hover:from-teal-500 hover:to-teal-600 shadow-md transition-all duration-200 
                   flex items-center font-medium"
              >
                <FaPlay className="mr-2" />
                Generate Stored Procedure
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-teal-800 text-lg flex items-center">
                <FaCode className="mr-2 text-orange-500" />
                Generated SQL
              </h4>
              <div className="flex space-x-3">
                <button
                  id="copy-button"
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" />
                  Copy
                </button>
                <button
                  onClick={downloadSP}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-5 rounded-lg overflow-x-auto custom-scrollbar shadow-inner border border-gray-700 font-mono text-sm">
                {generatedSP}
              </pre>
            </div>
          </div>
        )}
      </div>
      <Tooltip id="sp-type-tooltip" />
    </div>
  );
};

export default SPGenerator;