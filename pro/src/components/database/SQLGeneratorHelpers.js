/**
 * SQL Generator Helper Functions
 * This module contains reusable helper functions for generating SQL queries and stored procedures
 */

/**
 * Generate a parameterized condition based on column type
 * @param {Object} column - The column metadata
 * @param {string} sqlVariable - The SQL variable to modify (e.g., '@SQL' or '@CountSQL')
 * @param {string} paramPrefix - Prefix to use for parameter names
 * @returns {string} - SQL code for the condition
 */
export const generateConditionForColumn = (column, sqlVariable = '@SQL', paramPrefix = '') => {
  const colName = column.Name;
  let sql = '';
  
  // Handle different column types appropriately
  if (['varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext'].includes(column.Type.toLowerCase())) {
    // Text columns - use LIKE
    sql += `    IF @${paramPrefix}${colName} IS NOT NULL\n`;
    sql += `    BEGIN\n`;
    sql += `        SET ${sqlVariable} = ${sqlVariable} + ' AND [${colName}] LIKE ''%'' + @${paramPrefix}${colName} + ''%''';\n`;
    sql += `    END\n\n`;
  } 
  else if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(column.Type.toLowerCase())) {
    // Date columns - use range
    sql += `    IF @${paramPrefix}${colName}_From IS NOT NULL\n`;
    sql += `    BEGIN\n`;
    sql += `        SET ${sqlVariable} = ${sqlVariable} + ' AND [${colName}] >= @${paramPrefix}${colName}_From';\n`;
    sql += `    END\n\n`;
    
    sql += `    IF @${paramPrefix}${colName}_To IS NOT NULL\n`;
    sql += `    BEGIN\n`;
    sql += `        SET ${sqlVariable} = ${sqlVariable} + ' AND [${colName}] <= @${paramPrefix}${colName}_To';\n`;
    sql += `    END\n\n`;
  }
  else {
    // Numeric or other columns - use exact match
    sql += `    IF @${paramPrefix}${colName} IS NOT NULL\n`;
    sql += `    BEGIN\n`;
    sql += `        SET ${sqlVariable} = ${sqlVariable} + ' AND [${colName}] = @${paramPrefix}${colName}';\n`;
    sql += `    END\n\n`;
  }
  
  return sql;
};

/**
 * Generate parameter definitions based on column types
 * @param {Array} columns - Array of column objects
 * @param {Function} getColumnTypeString - Function to get SQL type string for a column
 * @param {Array} additionalParams - Additional parameters to include
 * @returns {string} - Parameter definitions as a string
 */
export const generateParameterDefinitions = (columns, getColumnTypeString, additionalParams = []) => {
  const params = [];
  
  columns.forEach(col => {
    if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
      params.push(`@${col.Name}_From ${getColumnTypeString(col)}`);
      params.push(`@${col.Name}_To ${getColumnTypeString(col)}`);
    } else {
      params.push(`@${col.Name} ${getColumnTypeString(col)}`);
    }
  });
  
  // Add additional params
  if (additionalParams && additionalParams.length > 0) {
    params.push(...additionalParams);
  }
  
  return params.join(', ');
};

/**
 * Generate parameter values for SQL execution
 * @param {Array} columns - Array of column objects
 * @param {Array} additionalParams - Additional parameter values to include
 * @returns {string} - Parameter values as a string for sp_executesql
 */
export const generateParameterValues = (columns, additionalParams = []) => {
  const paramValues = [];
  
  columns.forEach(col => {
    if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
      paramValues.push(`@${col.Name}_From = @${col.Name}_From`);
      paramValues.push(`@${col.Name}_To = @${col.Name}_To`);
    } else {
      paramValues.push(`@${col.Name} = @${col.Name}`);
    }
  });
  
  // Add additional params
  if (additionalParams && additionalParams.length > 0) {
    paramValues.push(...additionalParams);
  }
  
  return paramValues.join(', ');
};

/**
 * Helper function to generate a clean SQL column list
 * @param {Array} columns - Array of column names or objects
 * @param {string} tableAlias - Optional table alias
 * @returns {string} - Comma-separated column list for SQL queries
 */
export const generateColumnList = (columns, tableAlias = '') => {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  
  if (typeof columns[0] === 'string') {
    return columns.map(col => `${prefix}[${col}]`).join(', ');
  }
  
  return columns.map(col => `${prefix}[${col.Name}]`).join(', ');
};

/**
 * Helper function to create SQL parameter declarations from column metadata
 * @param {Array} columns - Array of column objects or names
 * @param {Function} getColumnDataType - Function to get data type for a column
 * @returns {string} - SQL parameter declarations
 */
export const generateParameterDeclarations = (columns, getColumnDataType) => {
  if (!columns || columns.length === 0) return '';
  
  return columns.map(col => {
    const colName = typeof col === 'string' ? col : col.Name;
    return `@${colName} ${getColumnDataType(colName)}`;
  }).join(',\n  ');
};

/**
 * Helper function to create a WHERE clause from column list
 * @param {Array} whereClauses - Array of column names to use in WHERE clause
 * @param {string} tableAlias - Optional table alias
 * @returns {string} - SQL WHERE clause
 */
export const generateWhereClauseFromColumns = (whereClauses, tableAlias = '') => {
  if (!whereClauses || whereClauses.length === 0) return '';
  
  const prefix = tableAlias ? `${tableAlias}.` : '';
  return 'WHERE ' + whereClauses.map(col => `${prefix}[${col}] = @${col}`).join('\n  AND ');
};

/**
 * Generate a standardized stored procedure comment header
 * @param {string} procedureType - Type of procedure (Select, Insert, etc.)
 * @param {string} tableName - Name of the target table
 * @param {Object} options - Optional metadata to include in comments
 * @returns {string} - SQL comment block
 */
export const generateSPHeader = (procedureType, tableName, options = {}) => {
  let header = `-- =============================================\n`;
  header += `-- Author: SP Generator Tool\n`;
  header += `-- Create date: ${new Date().toISOString().split('T')[0]}\n`;
  header += `-- Description: ${procedureType} stored procedure for ${tableName} table\n`;
  
  // Add any additional options to the header
  Object.entries(options).forEach(([key, value]) => {
    header += `-- ${key}: ${value}\n`;
  });
  
  header += `-- =============================================\n`;
  return header;
};

/**
 * Generate error handling wrapper for a stored procedure body
 * @param {string} sqlBody - The main SQL body to wrap with error handling
 * @returns {string} - Complete SQL with error handling
 */
export const wrapWithErrorHandling = (sqlBody) => {
  let sql = `BEGIN TRY\n`;
  sql += `    SET NOCOUNT ON;\n\n`;
  sql += sqlBody;
  sql += `\nEND TRY\n`;
  sql += `BEGIN CATCH\n`;
  sql += `    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();\n`;
  sql += `    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();\n`;
  sql += `    DECLARE @ErrorState INT = ERROR_STATE();\n`;
  sql += `    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);\n`;
  sql += `END CATCH\n`;
  return sql;
};

/**
 * Generate soft delete strategy based on configuration
 * @param {Array} columns - Table columns
 * @param {Object} tableInfo - Table metadata
 * @param {Object} config - Soft delete configuration
 * @returns {string} - SQL for soft delete operation
 */
export const generateSoftDeleteStrategy = (columns, tableInfo, config) => {
  const pkColumn = tableInfo.Columns.find(col => col.IsPrimaryKey);
  if (!pkColumn) return '-- Error: No primary key found for soft delete operation\n';
  
  // Find status columns that could be used for soft delete
  const statusColumns = tableInfo.Columns.filter(col => 
    ['IsActive', 'IsDeleted', 'Status', 'Active', 'Deleted'].includes(col.Name) ||
    (col.Type.toLowerCase() === 'bit' && !col.IsIdentity)
  );
  
  // Find date columns that could be used for timestamp-based soft delete
  const dateColumns = tableInfo.Columns.filter(col => 
    ['datetime', 'datetime2', 'date', 'smalldatetime'].includes(col.Type.toLowerCase()) &&
    ['DeletedDate', 'DeletedAt', 'DateDeleted', 'RemovedDate', 'RemovedAt'].includes(col.Name)
  );
  
  // Find audit columns
  const auditColumns = tableInfo.Columns.filter(col => 
    ['ModifiedBy', 'UpdatedBy', 'DeletedBy', 'ModifiedDate', 'UpdatedDate'].includes(col.Name)
  );
  
  switch(config.deleteStrategy) {
    case 'timestamp':
      return generateTimestampDeleteStrategy(columns, tableInfo, pkColumn, dateColumns, auditColumns);
    case 'archive':
      return generateArchiveDeleteStrategy(columns, tableInfo, pkColumn);
    case 'flag':
    default:
      return generateFlagDeleteStrategy(columns, tableInfo, pkColumn, statusColumns, auditColumns);
  }
};

// Export all your existing SQL generator functions here
// These exports will be used in the test file
// You'll refactor the actual SP Generator to use these helper functions