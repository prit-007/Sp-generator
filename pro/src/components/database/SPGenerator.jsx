import React, { useState } from 'react';
import { FaCode, FaCopy, FaDownload, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const SPGenerator = ({ activeTable, metadata }) => {
  const [spType, setSpType] = useState('select');
  const [includedColumns, setIncludedColumns] = useState([]);
  const [whereClauses, setWhereClauses] = useState([]);
  const [generatedSP, setGeneratedSP] = useState('');
  const [error, setError] = useState('');

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

  const generateSP = () => {
    setError('');
    const columns = includedColumns.length > 0 ? 
      includedColumns : 
      metadata[activeTable].Columns.map(col => col.Name);

    let sp = '';
    
    try {
      switch(spType) {
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
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSP);
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
    
    switch(column.Type.toLowerCase()) {
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
    const columnsList = columns.join(', ');
    let whereParams = '';
    let whereClause = '';
    let joins = '';

    metadata[activeTable].ForeignKeys.forEach(fk => {
      joins += `\n  JOIN ${fk.ReferenceTable} ON ${tableName}.${fk.Column} = ${fk.ReferenceTable}.${fk.ReferenceColumn}`;
    });

    if (whereClauses.length > 0) {
      whereParams = whereClauses.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n  ');
      whereClause = 'WHERE ' + whereClauses.map(col => `${tableName}.${col} = @${col}`).join('\n  AND ');
    }

    return `CREATE PROCEDURE SP_Select_${tableName}
${whereParams ? '  ' + whereParams : ''}
AS
BEGIN
  
  SELECT ${columnsList}
  FROM ${tableName}
  ${joins}
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-teal-100 mb-8">
      <div className="border-b border-teal-100 bg-teal-50 px-6 py-4">
        <h3 className="font-semibold text-teal-800 text-lg flex items-center">
          <FaCode className="mr-2 text-orange-500" />
          Stored Procedure Generator
        </h3>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-teal-700 font-medium mb-2 flex items-center">
            Procedure Type
            <FaInfoCircle 
              className="ml-2 text-teal-500 cursor-pointer"
              data-tooltip-id="sp-type-tooltip"
              data-tooltip-content="Choose the type of stored procedure to generate"
            />
          </label>
          <div className="flex space-x-4">
            {['select', 'insert', 'update', 'delete'].map(type => (
              <button
                key={type}
                onClick={() => setSpType(type)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  spType === type 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-teal-700 font-medium mb-2">
              Columns to Include
            </label>
            <div className="bg-teal-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              {metadata[activeTable].Columns.map(column => (
                <div key={column.Name} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`col-${column.Name}`}
                    checked={includedColumns.includes(column.Name)}
                    onChange={() => handleColumnToggle(column.Name)}
                    className="mr-2 h-4 w-4 text-teal-600"
                  />
                  <label htmlFor={`col-${column.Name}`} className="text-sm text-teal-700">
                    {column.Name} <span className="text-xs text-teal-500">({column.Type})</span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-teal-600 mt-2">
              If none selected, all columns will be included
            </p>
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-2">
              Where Clauses
            </label>
            <div className="bg-teal-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              {metadata[activeTable].Columns.map(column => (
                <div key={column.Name} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`where-${column.Name}`}
                    checked={whereClauses.includes(column.Name)}
                    onChange={() => handleWhereClauseToggle(column.Name)}
                    className="mr-2 h-4 w-4 text-teal-600"
                  />
                  <label htmlFor={`where-${column.Name}`} className="text-sm text-teal-700">
                    {column.Name} <span className="text-xs text-teal-500">({column.Type})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generateSP}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Generate Stored Procedure
        </button>

        {generatedSP && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-teal-800">Generated SQL</h4>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-teal-600 hover:text-teal-800 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadSP}
                  className="p-2 text-teal-600 hover:text-teal-800 transition-colors"
                  title="Download SQL file"
                >
                  <FaDownload />
                </button>
              </div>
            </div>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
              {generatedSP}
            </pre>
          </div>
        )}
      </div>
      <Tooltip id="sp-type-tooltip" />
    </div>
  );
};

export default SPGenerator;