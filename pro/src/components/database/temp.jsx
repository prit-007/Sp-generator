import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaCode, FaCopy, FaDownload, FaInfoCircle, FaPlay, FaPlus, FaMinus, FaKey,
  FaDatabase, FaFileDownload, FaSync, FaExpand, FaCompress, FaEye, FaEyeSlash,
  FaTerminal, FaCogs, FaFilter, FaSearch, FaCheck, FaTimes, FaRocket,
  FaChevronDown, FaChevronRight, FaCodeBranch, FaLayerGroup, FaFileCode,
  FaGem, FaChartBar, FaList, FaSearchPlus, FaNetworkWired, 
  FaChartLine, FaFileInvoice, FaExchangeAlt, FaBackward
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const API_URL = process.env.REACT_APP_API_URL;

const SPGenerator = ({ activeTable, metadata, onBackToEditor }) => {
  const [spType, setSpType] = useState('select');
  const [includedColumns, setIncludedColumns] = useState([]);
  const [whereClauses, setWhereClauses] = useState([]);
  const [generatedSP, setGeneratedSP] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [foreignKeySelections, setForeignKeySelections] = useState({});
  const [foreignKeyColumns, setForeignKeyColumns] = useState({});

  const [isCreatingAll, setIsCreatingAll] = useState(false);
  const [isCreatingInDB, setIsCreatingInDB] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [allProcedures, setAllProcedures] = useState({});
  
  // New enhanced UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('sql');
  const [showColumnSearch, setShowColumnSearch] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProcedureDetails, setShowProcedureDetails] = useState({});

  // Advanced query options
  const [complexQueryOptions, setComplexQueryOptions] = useState({
    useAggregates: false,
    usePagination: false,
    useSubqueries: false,
    useCTE: false,
    useConditionalLogic: false,
    useDynamicSQL: false,
    useMultipleResultSets: false
  });

  // Advanced filtering options
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [aggregateOptions, setAggregateOptions] = useState({
    groupByColumns: [],
    aggregateFunctions: [],
    havingConditions: []
  });
  const [joinOptions, setJoinOptions] = useState({});
  const [sortingOptions, setSortingOptions] = useState({
    orderByColumns: [],
    sortDirections: {}
  });
  const [paginationOptions, setPaginationOptions] = useState({
    pageSize: 10,
    includeCount: true
  });

  // Enhanced analytical query features
  const [analyticalQueryType, setAnalyticalQueryType] = useState('basic');
  const [dynamicSearchFilters, setDynamicSearchFilters] = useState([]);
  const [searchOperators, setSearchOperators] = useState({});
  const [analyticalMetrics, setAnalyticalMetrics] = useState({
    enableTrends: false,
    enableComparisons: false,
    enableAggregations: true,
    timeWindow: '30days'
  });
  
  // Soft delete configuration
  const [softDeleteConfig, setSoftDeleteConfig] = useState({
    useCustomColumn: false,
    customColumnName: '',
    deleteStrategy: 'flag', // 'flag', 'timestamp', 'archive'
    restoreCapability: true,
    cascadeDelete: false,
    auditTrail: true
  });
  
  // Enhanced UI states
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('metrics');
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [procedureHistory, setProcedureHistory] = useState([]);
  const [favoriteColumns, setFavoriteColumns] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 1, repeat: Infinity }
    }
  };

  const glowVariants = {
    initial: { boxShadow: "0 0 0 rgba(6, 182, 212, 0)" },
    animate: { 
      boxShadow: [
        "0 0 0 rgba(6, 182, 212, 0)",
        "0 0 20px rgba(6, 182, 212, 0.3)",
        "0 0 0 rgba(6, 182, 212, 0)"
      ],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  // Initialize foreign key selections
  React.useEffect(() => {
    if (!activeTable || !metadata || !metadata[activeTable]) {
      return; // Exit early if data is not available
    }
    
    const initialFKSelections = {};
    const initialFKColumns = {};

    metadata[activeTable].ForeignKeys?.forEach(fk => {
      initialFKSelections[fk.ColumnName] = false;
      initialFKColumns[fk.ColumnName] = [];
    });

    setForeignKeySelections(initialFKSelections);
    setForeignKeyColumns(initialFKColumns);
  }, [activeTable, metadata]);

  const handleSelectAll = () => {
    if (!activeTable || !metadata || !metadata[activeTable]) {
      setError('No table data available');
      return;
    }
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

  // Add the rest of your functions here
  const generateAllProcedures = () => {
    setError('');
    setIsCreatingAll(true);
    setIsGenerating(true);

    if (!activeTable || !metadata || !metadata[activeTable]) {
      setError('No table data available');
      setIsCreatingAll(false);
      setIsGenerating(false);
      return;
    }

    const columns = includedColumns.length > 0 ?
        includedColumns :
        metadata[activeTable].Columns.map(col => col.Name);

    try {
        const procedures = {
            select: generateSelectSP(activeTable, columns, []),
            select_with_where: whereClauses.length > 0 ? generateSelectSP(activeTable, columns, whereClauses) : null,
            insert: generateInsertSP(activeTable, columns),
            update: generateUpdateSP(activeTable, columns, whereClauses),
            delete: generateDeleteSP(activeTable, whereClauses)
        };

        setAllProcedures(procedures);

        // Combine all procedures into one string for display
        const combinedSP = Object.entries(procedures)
            .filter(([_, sp]) => sp !== null)
            .map(([type, sp]) => `-- ${type.toUpperCase()} PROCEDURE\n${sp}`)
            .join('\n\n');

        setGeneratedSP(combinedSP);
        setShowPreview(true);
        
        // Show success toast with animation
        toast.success(`🚀 Generated ${Object.keys(procedures).filter(key => procedures[key] !== null).length} stored procedures!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
    } catch (err) {
        setError(err.message);
        toast.error(`❌ Error generating procedures: ${err.message}`);
    } finally {
        setIsCreatingAll(false);
        setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const generateSP = () => {
    setError('');
    setIsGenerating(true);
    
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
      
      toast.success(`✨ ${spType.toUpperCase()} procedure generated successfully!`);
    } catch (err) {
      setError(err.message);
      toast.error(`❌ Error: ${err.message}`);
    }

    setGeneratedSP(sp);
    setShowPreview(true);
    
    setTimeout(() => setIsGenerating(false), 500);
  };

  const createProceduresInDB = async () => {
    setError('');
    setIsCreatingInDB(true);

    try {
        // First generate all procedures if not already done
        if (Object.keys(allProcedures).length === 0) {
            generateAllProcedures();
        }

        // Filter out null procedures
        const proceduresToCreate = Object.fromEntries(
            Object.entries(allProcedures).filter(([_, sp]) => sp !== null)
        );

        // Make API call
        const response = await fetch(`${API_URL}/Database/create-stored-procedures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableName: activeTable,
                procedures: proceduresToCreate
            }),
        });

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create stored procedures');
        }

        setApiResponse(data);

        // Show success message
        setGeneratedSP(`/* 
SUCCESS: Created the following stored procedures:
${Object.keys(proceduresToCreate).map(type => `- SP_${type.charAt(0).toUpperCase() + type.slice(1)}_${activeTable}`).join('\n')}

Response from server: 
${JSON.stringify(data, null, 2)}
*/\n\n${generatedSP}`);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsCreatingInDB(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedSP) {
      toast.warning('No SQL code to copy!', {
        position: "bottom-right",
        autoClose: 2000
      });
      return;
    }
    
    navigator.clipboard.writeText(generatedSP);
    
    // Enhanced toast notification
    toast.success('📋 Copied to clipboard!', {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  const downloadAllProcedures = () => {
    if (!activeTable) {
      toast.warning('No table selected!', {
        position: "bottom-right",
        autoClose: 2000
      });
      return;
    }

    if (Object.keys(allProcedures).length === 0) {
      generateAllProcedures();
      if (!generatedSP) return; // If generation failed
    }

    const blob = new Blob([generatedSP], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `All_SPs_${activeTable}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSP = () => {
    if (!activeTable || !generatedSP) {
      toast.warning('No SQL code to download!', {
        position: "bottom-right",
        autoClose: 2000
      });
      return;
    }

    const blob = new Blob([generatedSP], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SP_${spType}_${activeTable}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getColumnDataType = (columnName) => {
    if (!activeTable || !metadata || !metadata[activeTable]) {
      return 'NVARCHAR(255)'; // Default type if metadata is not available
    }

    const column = metadata[activeTable].Columns.find(col => col.Name === columnName);
    if (!column) return 'NVARCHAR(255)'; // Default if column not found

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
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return '-- Error: Invalid table or columns data provided';
    }

    let selectedColumns = [...columns];
    let columnsList = '';
    let whereParams = '';
    let whereClause = '';
    let joins = '';

    // Handle foreign key selections
    if (metadata && metadata[activeTable] && metadata[activeTable].ForeignKeys) {
      metadata[activeTable].ForeignKeys.forEach(fk => {
        if (foreignKeySelections[fk.ColumnName]) {
          const refColumns = foreignKeyColumns[fk.ColumnName];

          joins += `\n\tLEFT JOIN ${fk.ReferencedTable} ON ${tableName}.${fk.ColumnName} = ${fk.ReferencedTable}.${fk.ReferencedColumn}`;

          // Add selected foreign key columns to the SELECT clause
          if (refColumns && refColumns.length > 0) {
            refColumns.forEach(refCol => {
              selectedColumns.push(`\t${fk.ReferencedTable}.${refCol} AS ${fk.ReferencedTable}_${refCol}`);
            });
          }
        }
      });
    }

    columnsList = selectedColumns.map(col => {
      if (col.includes(' AS ')) return col;
      return `\t${tableName}.${col}`;
    }).join(',\n\t\t');

    if (whereClauses && whereClauses.length > 0) {
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
    END`;
  };

  const generateInsertSP = (tableName, columns) => {
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return '-- Error: Invalid table or columns data provided';
    }
    
    const columnsList = columns.join(', ');
    const paramsList = columns.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n  ');
    const valuesList = columns.map(col => `@${col}`).join(', ');

    return `CREATE PROCEDURE SP_Insert_${tableName}
            ${paramsList}
            AS
            BEGIN
              INSERT INTO ${tableName} (${columnsList})
              VALUES (${valuesList})
            END`;
  };

  const generateUpdateSP = (tableName, columns, whereClauses) => {
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return '-- Error: Invalid table or columns data provided';
    }
    
    if (!whereClauses || whereClauses.length === 0) {
      return '-- Error: At least one WHERE clause is required for UPDATE procedure';
    }

    const updateColumns = columns.filter(col => !whereClauses.includes(col));
    if (updateColumns.length === 0) {
      return '-- Error: No columns selected for update (all are in WHERE clause)';
    }
    
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
END`;
  };

  const generateDeleteSP = (tableName, whereClauses) => {
    if (!tableName || !whereClauses || !Array.isArray(whereClauses)) {
      return '-- Error: Invalid table or WHERE clause data provided';
    }
    
    if (whereClauses.length === 0) {
      return '-- Error: At least one WHERE clause is required for DELETE procedure';
    }

    const paramsList = whereClauses.map(col => `@${col} ${getColumnDataType(col)}`).join(',\n  ');
    const whereClause = 'WHERE ' + whereClauses.map(col => `${col} = @${col}`).join('\n  AND ');

    return `CREATE PROCEDURE SP_Delete_${tableName}
  ${paramsList}
AS
BEGIN
  DELETE FROM ${tableName}
  ${whereClause}
END`;
  };

  // ===== ADVANCED COMPLEX QUERY GENERATION FUNCTIONS =====
  
  const generateComplexStoredProcedure = (operation, columns, customName) => {
    const tableInfo = metadata[activeTable];
    const tableName = activeTable;
    const schemaName = 'dbo'; // Default schema
    const pkColumn = tableInfo.Columns.find(col => col.IsPrimaryKey);
    const spName = customName || `sp_${operation}_${tableName}`;
    
    let sql = `-- Complex Stored Procedure: ${spName}\n`;
    sql += `-- Generated on: ${new Date().toLocaleString()}\n`;
    sql += `-- Advanced Features: ${Object.entries(complexQueryOptions).filter(([k, v]) => v).map(([k]) => k).join(', ')}\n\n`;
    
    // Parameters section
    sql += `CREATE PROCEDURE [${schemaName}].[${spName}]\n`;
    
    const params = generateAdvancedParameters(operation, columns, tableInfo);
    sql += params + '\n';
    
    sql += `AS\nBEGIN\n`;
    sql += `    SET NOCOUNT ON;\n`;
    sql += `    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;\n\n`;
    
    // Error handling
    sql += `    BEGIN TRY\n`;
    
    // CTE if enabled
    if (complexQueryOptions.useCTE) {
      sql += generateCTESection(tableInfo);
    }
    
    // Main query generation
    switch (operation) {
      case 'complexSelect':
        sql += generateComplexSelectQuery(columns, tableInfo);
        break;
      case 'analyticsSelect':
        sql += generateAnalyticsQuery(columns, tableInfo);
        break;
      case 'reportingSelect':
        sql += generateReportingQuery(columns, tableInfo);
        break;
      case 'upsert':
        sql += generateUpsertQuery(columns, tableInfo);
        break;
      case 'bulkOperations':
        sql += generateBulkOperationsQuery(columns, tableInfo);
        break;
      default:
        sql += generateStandardQuery(operation, columns, tableInfo);
    }
    
    // Error handling end
    sql += `\n    END TRY\n`;
    sql += `    BEGIN CATCH\n`;
    sql += `        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();\n`;
    sql += `        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();\n`;
    sql += `        DECLARE @ErrorState INT = ERROR_STATE();\n`;
    sql += `        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);\n`;
    sql += `    END CATCH\n`;
    
    sql += `END\nGO\n\n`;
    
    return sql;
  };

  const generateAdvancedParameters = (operation, columns, tableInfo) => {
    let params = [];
    
    // Standard parameters
    if (['update', 'delete', 'upsert'].includes(operation)) {
      const pkColumn = tableInfo.Columns.find(col => col.IsPrimaryKey);
      if (pkColumn) {
        params.push(`    @${pkColumn.Name} ${getColumnTypeString(pkColumn)}`);
      }
    }
    
    // Column parameters
    if (['insert', 'update', 'upsert'].includes(operation)) {
      columns.forEach(col => {
        if (!col.IsIdentity) {
          params.push(`    @${col.Name} ${getColumnTypeString(col)}${col.IsNullable ? ' = NULL' : ''}`);
        }
      });
    }
    
    // Advanced parameters based on options
    if (complexQueryOptions.usePagination) {
      params.push(`    @PageNumber INT = 1`);
      params.push(`    @PageSize INT = ${paginationOptions.pageSize}`);
      if (paginationOptions.includeCount) {
        params.push(`    @TotalCount INT OUTPUT`);
      }
    }
    
    if (complexQueryOptions.useConditionalLogic) {
      params.push(`    @SortBy NVARCHAR(100) = NULL`);
      params.push(`    @SortDirection NVARCHAR(4) = 'ASC'`);
      params.push(`    @FilterCriteria NVARCHAR(MAX) = NULL`);
    }
    
    if (complexQueryOptions.useDynamicSQL) {
      params.push(`    @DynamicWhere NVARCHAR(MAX) = NULL`);
      params.push(`    @DynamicOrderBy NVARCHAR(MAX) = NULL`);
    }
    
    return params.join(',\n');
  };

  const generateComplexSelectQuery = (columns, tableInfo) => {
    let sql = `    -- Complex SELECT with advanced features\n`;
    
    if (complexQueryOptions.usePagination && paginationOptions.includeCount) {
      sql += `    -- Get total count\n`;
      sql += `    IF @TotalCount IS NOT NULL\n`;
      sql += `    BEGIN\n`;
      sql += `        SELECT @TotalCount = COUNT(*)\n`;
      sql += `        FROM [dbo].[${activeTable}] t\n`;
      sql += generateJoinClauses();
      sql += generateWhereClause();
      sql += `    END\n\n`;
    }
    
    // Main select with window functions for pagination
    sql += `    SELECT\n`;
    
    if (complexQueryOptions.usePagination) {
      sql += `        ROW_NUMBER() OVER (${generateOrderByClause()}) as RowNum,\n`;
    }
    
    // Column selection with aggregates
    if (complexQueryOptions.useAggregates && aggregateOptions.aggregateFunctions.length > 0) {
      sql += generateAggregateColumns(columns);
    } else {
      sql += generateSelectColumns(columns);
    }
    
    sql += `\n    FROM [dbo].[${activeTable}] t\n`;
    
    // Joins
    sql += generateJoinClauses();
    
    // Where clause
    sql += generateWhereClause();
    
    // Group By (if using aggregates)
    if (complexQueryOptions.useAggregates && aggregateOptions.groupByColumns.length > 0) {
      sql += `    GROUP BY ${aggregateOptions.groupByColumns.map(col => `t.[${col}]`).join(', ')}\n`;
      
      // Having clause
      if (aggregateOptions.havingConditions.length > 0) {
        sql += `    HAVING ${aggregateOptions.havingConditions.join(' AND ')}\n`;
      }
    }
    
    // Pagination wrapper
    if (complexQueryOptions.usePagination) {
      sql = `    WITH PaginatedResults AS (\n${sql}    )\n`;
      sql += `    SELECT *\n`;
      sql += `    FROM PaginatedResults\n`;
      sql += `    WHERE RowNum BETWEEN ((@PageNumber - 1) * @PageSize + 1) AND (@PageNumber * @PageSize)\n`;
      sql += `    ORDER BY RowNum;\n`;
    } else {
      sql += generateOrderByClause() + ';\n';
    }
    
    return sql;
  };

  const generateAnalyticsQuery = (columns, tableInfo) => {
    let sql = `    -- Analytics Query with Business Intelligence features\n`;
    
    sql += `    -- Summary Statistics\n`;
    sql += `    SELECT\n`;
    sql += `        'Summary' as ResultType,\n`;
    sql += `        COUNT(*) as TotalRecords,\n`;
    
    // Add numeric aggregates
    const numericColumns = columns.filter(col => 
      ['int', 'bigint', 'decimal', 'numeric', 'float', 'real', 'money', 'smallmoney'].includes(col.Type.toLowerCase())
    );
    
    numericColumns.forEach(col => {
      sql += `        AVG(CAST([${col.Name}] AS DECIMAL(18,2))) as Avg_${col.Name},\n`;
      sql += `        MIN([${col.Name}]) as Min_${col.Name},\n`;
      sql += `        MAX([${col.Name}]) as Max_${col.Name},\n`;
      sql += `        SUM([${col.Name}]) as Sum_${col.Name},\n`;
    });
    
    // Date analytics if date columns exist
    const dateColumns = columns.filter(col => 
      ['datetime', 'datetime2', 'date', 'smalldatetime'].includes(col.Type.toLowerCase())
    );
    
    if (dateColumns.length > 0) {
      const dateCol = dateColumns[0];
      sql += `        MIN([${dateCol.Name}]) as Earliest_Date,\n`;
      sql += `        MAX([${dateCol.Name}]) as Latest_Date,\n`;
    }
    
    sql = sql.slice(0, -2) + '\n'; // Remove trailing comma
    sql += `    FROM [dbo].[${activeTable}]\n`;
    sql += generateWhereClause();
    
    // Monthly/Daily breakdown if date column exists
    if (dateColumns.length > 0) {
      const dateCol = dateColumns[0];
      sql += `\n    UNION ALL\n\n`;
      sql += `    -- Time-based Analysis\n`;
      sql += `    SELECT\n`;
      sql += `        'TimeBreakdown' as ResultType,\n`;
      sql += `        YEAR([${dateCol.Name}]) * 100 + MONTH([${dateCol.Name}]) as YearMonth,\n`;
      sql += `        COUNT(*) as RecordCount,\n`;
      
      if (numericColumns.length > 0) {
        sql += `        SUM([${numericColumns[0].Name}]) as MonthlyTotal,\n`;
      }
      
      sql = sql.slice(0, -2) + '\n';
      sql += `    FROM [dbo].[${activeTable}]\n`;
      sql += generateWhereClause();
      sql += `    GROUP BY YEAR([${dateCol.Name}]), MONTH([${dateCol.Name}])\n`;
      sql += `    ORDER BY YearMonth DESC;\n`;
    } else {
      sql += ';\n';
    }
    
    return sql;
  };

  const generateReportingQuery = (columns, tableInfo) => {
    let sql = `    -- Reporting Query with Summaries and Groupings\n`;
    
    // Generate summary statistics 
    sql += `    -- Summary Statistics\n`;
    sql += `    WITH SummaryStats AS (\n`;
    sql += `        SELECT\n`;
    sql += `            COUNT(*) as TotalRecords,\n`;
    
    // Add numeric aggregates for summary
    const numericColumns = columns.filter(col => 
      ['int', 'bigint', 'decimal', 'numeric', 'float', 'real', 'money'].includes(col.Type.toLowerCase())
    );
    
    numericColumns.forEach(col => {
      sql += `            MIN([${col.Name}]) as Min_${col.Name},\n`;
      sql += `            MAX([${col.Name}]) as Max_${col.Name},\n`;
      sql += `            AVG(CAST([${col.Name}] AS DECIMAL(18,2))) as Avg_${col.Name},\n`;
      sql += `            SUM([${col.Name}]) as Sum_${col.Name},\n`;
    });
    
    // Date analytics for summary
    const dateColumns = columns.filter(col => 
      ['datetime', 'datetime2', 'date', 'smalldatetime'].includes(col.Type.toLowerCase())
    );
    
    if (dateColumns.length > 0) {
      dateColumns.forEach(col => {
        sql += `            MIN([${col.Name}]) as Earliest_${col.Name},\n`;
        sql += `            MAX([${col.Name}]) as Latest_${col.Name},\n`;
        sql += `            DATEDIFF(day, MIN([${col.Name}]), MAX([${col.Name}])) as DateRange_${col.Name}_Days,\n`;
      });
    }
    
    // Remove trailing comma
    sql = sql.slice(0, -2) + '\n';
    sql += `        FROM [dbo].[${activeTable}]\n`;
    sql += generateWhereClause();
    sql += `    ),\n`;
    
    // Generate Time Series Analysis if date column exists
    if (dateColumns.length > 0) {
      const dateCol = dateColumns[0]; // Use first date column
      const valueCol = numericColumns.length > 0 ? numericColumns[0] : null; // Use first numeric column if available
      
      sql += `    TimeAnalysis AS (\n`;
      sql += `        SELECT\n`;
      sql += `            DATEFROMPARTS(YEAR([${dateCol.Name}]), MONTH([${dateCol.Name}]), 1) as PeriodStart,\n`;
      sql += `            YEAR([${dateCol.Name}]) as Year,\n`;
      sql += `            MONTH([${dateCol.Name}]) as Month,\n`;
      sql += `            COUNT(*) as RecordCount,\n`;
      
      if (valueCol) {
        sql += `            SUM([${valueCol.Name}]) as Total_${valueCol.Name},\n`;
        sql += `            AVG([${valueCol.Name}]) as Avg_${valueCol.Name},\n`;
      }
      
      // Remove trailing comma
      sql = sql.slice(0, -2) + '\n';
      sql += `        FROM [dbo].[${activeTable}]\n`;
      sql += generateWhereClause();
      sql += `        GROUP BY YEAR([${dateCol.Name}]), MONTH([${dateCol.Name}])\n`;
      sql += `    ),\n`;
    }
    
    // Generate Rankings if numeric columns exist
    if (numericColumns.length > 0) {
      const rankCol = numericColumns[0]; // Use first numeric column for ranking
      
      sql += `    Rankings AS (\n`;
      sql += `        SELECT *,\n`;
      sql += `            ROW_NUMBER() OVER (ORDER BY [${rankCol.Name}] DESC) as RankByValue,\n`;
      sql += `            NTILE(4) OVER (ORDER BY [${rankCol.Name}] DESC) as Quartile,\n`;
      sql += `            PERCENT_RANK() OVER (ORDER BY [${rankCol.Name}] DESC) as PercentileRank\n`;
      sql += `        FROM [dbo].[${activeTable}]\n`;
      sql += generateWhereClause();
      sql += `    )\n`;
    } else {
      sql = sql.slice(0, -2) + '\n'; // Remove trailing comma if no Rankings CTE
      sql += `    )\n`;
    }
    
    // Generate result sets
    sql += `    -- Result Set 1: Summary Statistics\n`;
    sql += `    SELECT * FROM SummaryStats;\n\n`;
    
    // Time Analysis result set
    if (dateColumns.length > 0) {
      sql += `    -- Result Set 2: Time Series Analysis\n`;
      sql += `    SELECT * FROM TimeAnalysis\n`;
      sql += `    ORDER BY Year DESC, Month DESC;\n\n`;
    }
    
    // Rankings result set
    if (numericColumns.length > 0) {
      sql += `    -- Result Set 3: Top 10 Rankings\n`;
      sql += `    SELECT * FROM Rankings\n`;
      sql += `    WHERE RankByValue <= 10\n`;
      sql += `    ORDER BY RankByValue;\n\n`;
      
      sql += `    -- Result Set 4: Bottom 10 Rankings\n`;
      sql += `    SELECT * FROM Rankings\n`;
      sql += `    WHERE RankByValue > (SELECT COUNT(*) FROM [dbo].[${activeTable}]) - 10\n`;
      sql += `    ORDER BY RankByValue;\n\n`;
    }
    
    // Detailed data result set with select columns
    sql += `    -- Result Set ${dateColumns.length > 0 && numericColumns.length > 0 ? '5' : (dateColumns.length > 0 || numericColumns.length > 0 ? '3' : '2')}: Detailed Data\n`;
    sql += `    SELECT\n`;
    sql += columns.map(col => `        [${col.Name}]`).join(',\n');
    sql += `\n    FROM [dbo].[${activeTable}]\n`;
    sql += generateWhereClause();
    sql += generateOrderByClause() + ';\n';
    
    return sql;
  };

  const generateUpsertQuery = (columns, tableInfo) => {
    const pkColumn = tableInfo.Columns.find(col => col.IsPrimaryKey);
    if (!pkColumn) return '-- Error: No primary key found for UPSERT operation\n';
    
    let sql = `    -- UPSERT (INSERT or UPDATE) Operation\n`;
    sql += `    IF EXISTS (SELECT 1 FROM [dbo].[${activeTable}] WHERE [${pkColumn.Name}] = @${pkColumn.Name})\n`;
    sql += `    BEGIN\n`;
    sql += `        -- UPDATE existing record\n`;
    sql += `        UPDATE [dbo].[${activeTable}]\n`;
    sql += `        SET\n`;
    
    const updateColumns = columns.filter(col => !col.IsIdentity && col.Name !== pkColumn.Name);
    updateColumns.forEach((col, index) => {
      sql += `            [${col.Name}] = @${col.Name}`;
      sql += index < updateColumns.length - 1 ? ',\n' : '\n';
    });
    
    sql += `        WHERE [${pkColumn.Name}] = @${pkColumn.Name};\n\n`;
    sql += `        SELECT 'UPDATED' as Operation, @${pkColumn.Name} as ${pkColumn.Name};\n`;
    sql += `    END\n`;
    sql += `    ELSE\n`;
    sql += `    BEGIN\n`;
    sql += `        -- INSERT new record\n`;
    sql += `        INSERT INTO [dbo].[${activeTable}] (\n`;
    
    const insertColumns = columns.filter(col => !col.IsIdentity);
    sql += insertColumns.map(col => `            [${col.Name}]`).join(',\n');
    sql += `\n        )\n        VALUES (\n`;
    sql += insertColumns.map(col => `            @${col.Name}`).join(',\n');
    sql += `\n        );\n\n`;
    
    if (pkColumn.IsIdentity) {
      sql += `        SELECT 'INSERTED' as Operation, SCOPE_IDENTITY() as ${pkColumn.Name};\n`;
    } else {
      sql += `        SELECT 'INSERTED' as Operation, @${pkColumn.Name} as ${pkColumn.Name};\n`;
    }
    
    sql += `    END\n`;
    
    return sql;
  };

  const generateBulkOperationsQuery = (columns, tableInfo) => {
    let sql = `    -- Bulk Operations with Table-Valued Parameters\n`;
    sql += `    -- Note: This requires creating a User-Defined Table Type first\n\n`;
    
    sql += `    /*\n`;
    sql += `    -- Create the table type first (run separately):\n`;
    sql += `    CREATE TYPE [dbo].[${activeTable}TableType] AS TABLE (\n`;
    
    const bulkColumns = columns.filter(col => !col.IsIdentity);
    bulkColumns.forEach((col, index) => {
      sql += `        [${col.Name}] ${getColumnTypeString(col)}`;
      sql += col.IsNullable ? ' NULL' : ' NOT NULL';
      sql += index < bulkColumns.length - 1 ? ',\n' : '\n';
    });
    
    sql += `    );\n    */\n\n`;
    
    const pkColumn = tableInfo.Columns.find(col => col.IsPrimaryKey);
    sql += `    -- Bulk INSERT with MERGE for UPSERT functionality\n`;
    sql += `    MERGE [dbo].[${activeTable}] AS target\n`;
    sql += `    USING @BulkData AS source\n`;
    sql += `    ON target.[${pkColumn?.Name || 'Id'}] = source.[${pkColumn?.Name || 'Id'}]\n`;
    sql += `    WHEN MATCHED THEN\n`;
    sql += `        UPDATE SET\n`;
    
    const updateCols = bulkColumns.filter(col => col.Name !== pkColumn?.Name);
    updateCols.forEach((col, index) => {
      sql += `            [${col.Name}] = source.[${col.Name}]`;
      sql += index < updateCols.length - 1 ? ',\n' : '\n';
    });
    
    sql += `    WHEN NOT MATCHED THEN\n`;
    sql += `        INSERT (\n`;
    sql += bulkColumns.map(col => `            [${col.Name}]`).join(',\n');
    sql += `\n        )\n        VALUES (\n`;
    sql += bulkColumns.map(col => `            source.[${col.Name}]`).join(',\n');
    sql += `\n        )\n`;
    sql += `    OUTPUT $action, inserted.*, deleted.*;\n`;
    
    return sql;
  };

  const generateStandardQuery = (operation, columns, tableInfo) => {
    // Fallback to existing generation methods
    switch (operation) {
      case 'select':
        return generateSelectSP(activeTable, columns, whereClauses);
      case 'insert':
        return generateInsertSP(activeTable, columns);
      case 'update':
        return generateUpdateSP(activeTable, columns, whereClauses);
      case 'delete':
        return generateDeleteSP(activeTable, whereClauses);
      case 'dynamicSearch':
        return generateDynamicSearchQuery(columns, tableInfo);
      case 'softDelete':
        return generateSoftDeleteQuery(columns, tableInfo);
      case 'reportingSelect':
        return generateReportingQuery(columns, tableInfo);
      default:
        return '-- Unknown operation type\n';
    }
  };

  // Helper functions for complex queries
  const generateJoinClauses = () => {
    let joins = '';
    Object.entries(joinOptions).forEach(([table, joinConfig]) => {
      if (joinConfig.enabled) {
        joins += `    ${joinConfig.type} JOIN [${joinConfig.schema}].[${table}] ${joinConfig.alias}\n`;
        joins += `        ON ${joinConfig.condition}\n`;
      }
    });
    return joins;
  };

  const generateWhereClause = () => {
    let whereClause = '';
    const conditions = [];
    
    // Standard where conditions
    if (whereClauses && whereClauses.length > 0) {
      whereClauses.forEach(clause => {
        if (clause.column && clause.operator && clause.value) {
          conditions.push(`t.[${clause.column}] ${clause.operator} ${clause.value}`);
        }
      });
    }
    
    // Advanced filters
    Object.entries(advancedFilters).forEach(([column, filter]) => {
      if (filter.enabled) {
        switch (filter.type) {
          case 'LIKE':
            conditions.push(`t.[${column}] LIKE '%' + @${column}Filter + '%'`);
            break;
          case 'IN':
            conditions.push(`t.[${column}] IN (${filter.values})`);
            break;
          case 'BETWEEN':
            conditions.push(`t.[${column}] BETWEEN @${column}From AND @${column}To`);
            break;
          case 'EXISTS':
            conditions.push(`EXISTS (${filter.subquery})`);
            break;
        }
      }
    });
    
    if (conditions.length > 0) {
      whereClause = `    WHERE ${conditions.join(' AND ')}\n`;
    }
    
    return whereClause;
  };

  const generateDynamicSearchQuery = (columns, tableInfo) => {
    let sql = `    -- Dynamic Search Procedure with Optional Parameters\n`;
    sql += `    -- This procedure performs a search with any combination of parameters\n`;
    sql += `    -- Any NULL parameters will be ignored in the search\n\n`;
    
    sql += `    -- Build dynamic query\n`;
    sql += `    DECLARE @SQL NVARCHAR(MAX);\n`;
    sql += `    DECLARE @ParamDefinition NVARCHAR(MAX);\n\n`;
    
    sql += `    SET @SQL = N'SELECT\n`;
    
    // If paging is enabled, include row number
    if (complexQueryOptions.usePagination) {
      sql += `        ROW_NUMBER() OVER (ORDER BY [${columns[0].Name}]) AS RowNum,\n`;
    }
    
    // Column selection
    sql += columns.map(col => `        [${col.Name}]`).join(',\n');
    
    sql += `\n    FROM [dbo].[${activeTable}]\n`;
    sql += `    WHERE 1=1';\n\n`;
    
    // Dynamic where conditions for each column
    const searchableColumns = columns.filter(col => !col.IsComputed);
    searchableColumns.forEach(col => {
      sql += `    -- ${col.Name} filter\n`;
      
      if (['varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext'].includes(col.Type.toLowerCase())) {
        // Text columns - use LIKE
        sql += `    IF @${col.Name} IS NOT NULL\n`;
        sql += `    BEGIN\n`;
        sql += `        SET @SQL = @SQL + ' AND [${col.Name}] LIKE ''%'' + @${col.Name} + ''%''';\n`;
        sql += `    END\n\n`;
      } 
      else if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
        // Date columns - use range
        sql += `    IF @${col.Name}_From IS NOT NULL\n`;
        sql += `    BEGIN\n`;
        sql += `        SET @SQL = @SQL + ' AND [${col.Name}] >= @${col.Name}_From';\n`;
        sql += `    END\n\n`;
        
        sql += `    IF @${col.Name}_To IS NOT NULL\n`;
        sql += `    BEGIN\n`;
        sql += `        SET @SQL = @SQL + ' AND [${col.Name}] <= @${col.Name}_To';\n`;
        sql += `    END\n\n`;
      }
      else {
        // Numeric or other columns - use exact match
        sql += `    IF @${col.Name} IS NOT NULL\n`;
        sql += `    BEGIN\n`;
        sql += `        SET @SQL = @SQL + ' AND [${col.Name}] = @${col.Name}';\n`;
        sql += `    END\n\n`;
      }
    });
    
    // Add sorting
    sql += `    -- Add ORDER BY clause\n`;
    sql += `    IF @SortColumn IS NOT NULL\n`;
    sql += `    BEGIN\n`;
    sql += `        SET @SQL = @SQL + ' ORDER BY [' + @SortColumn + '] ' + @SortDirection;\n`;
    sql += `    END\n`;
    sql += `    ELSE\n`;
    sql += `    BEGIN\n`;
    sql += `        SET @SQL = @SQL + ' ORDER BY [${columns[0].Name}]';\n`;
    sql += `    END\n\n`;
    
    // Add pagination if enabled
    if (complexQueryOptions.usePagination) {
      sql += `    -- Add pagination wrapper\n`;
      sql += `    SET @SQL = 'WITH SearchResults AS (' + @SQL + ') ' +\n`;
      sql += `        'SELECT * FROM SearchResults ' +\n`;
      sql += `        'WHERE RowNum BETWEEN ((' + CAST(@PageNumber AS NVARCHAR(10)) + ' - 1) * ' + CAST(@PageSize AS NVARCHAR(10)) + ' + 1) ' +\n`;
      sql += `        'AND (' + CAST(@PageNumber AS NVARCHAR(10)) + ' * ' + CAST(@PageSize AS NVARCHAR(10)) + ')';\n\n`;
      
      // Include total count
      if (paginationOptions.includeCount) {
        sql += `    -- Get total count for pagination\n`;
        sql += `    DECLARE @CountSQL NVARCHAR(MAX);\n`;
        sql += `    SET @CountSQL = 'SELECT @TotalCount = COUNT(*) FROM [dbo].[${activeTable}] WHERE 1=1';\n\n`;
        
        // Add the same conditions to count query
        searchableColumns.forEach(col => {
          if (['varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext'].includes(col.Type.toLowerCase())) {
            sql += `    IF @${col.Name} IS NOT NULL\n`;
            sql += `    BEGIN\n`;
            sql += `        SET @CountSQL = @CountSQL + ' AND [${col.Name}] LIKE ''%'' + @${col.Name} + ''%''';\n`;
            sql += `    END\n\n`;
          } 
          else if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
            sql += `    IF @${col.Name}_From IS NOT NULL\n`;
            sql += `    BEGIN\n`;
            sql += `        SET @CountSQL = @CountSQL + ' AND [${col.Name}] >= @${col.Name}_From';\n`;
            sql += `    END\n\n`;
            
            sql += `    IF @${col.Name}_To IS NOT NULL\n`;
            sql += `    BEGIN\n`;
            sql += `        SET @CountSQL = @CountSQL + ' AND [${col.Name}] <= @${col.Name}_To';\n`;
            sql += `    END\n\n`;
          }
          else {
            sql += `    IF @${col.Name} IS NOT NULL\n`;
            sql += `    BEGIN\n`;
            sql += `        SET @CountSQL = @CountSQL + ' AND [${col.Name}] = @${col.Name}';\n`;
            sql += `    END\n\n`;
          }
        });
        
        sql += `    -- Execute count query\n`;
        sql += `    SET @ParamDefinition = N'`;
        
        // Parameter definitions for count query
        const countParams = [];
        searchableColumns.forEach(col => {
          if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
            countParams.push(`@${col.Name}_From ${getColumnTypeString(col)}`);
            countParams.push(`@${col.Name}_To ${getColumnTypeString(col)}`);
          } else {
            countParams.push(`@${col.Name} ${getColumnTypeString(col)}`);
          }
        });
        countParams.push('@TotalCount INT OUTPUT');
        
        sql += countParams.join(', ');
        sql += `';\n\n`;
        
        sql += `    EXEC sp_executesql @CountSQL, @ParamDefinition, `;
        
        // Parameter values for count query
        const countParamValues = [];
        searchableColumns.forEach(col => {
          if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
            countParamValues.push(`@${col.Name}_From = @${col.Name}_From`);
            countParamValues.push(`@${col.Name}_To = @${col.Name}_To`);
          } else {
            countParamValues.push(`@${col.Name} = @${col.Name}`);
          }
        });
        countParamValues.push('@TotalCount = @TotalCount OUTPUT');
        
        sql += countParamValues.join(', ');
        sql += `;\n\n`;
      }
    }
    
    // Execute main query
    sql += `    -- Define parameters for main query\n`;
    sql += `    SET @ParamDefinition = N'`;
    
    // Parameter definitions
    const params = [];
    searchableColumns.forEach(col => {
      if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
        params.push(`@${col.Name}_From ${getColumnTypeString(col)}`);
        params.push(`@${col.Name}_To ${getColumnTypeString(col)}`);
      } else {
        params.push(`@${col.Name} ${getColumnTypeString(col)}`);
      }
    });
    
    // Add sorting parameters
    params.push('@SortColumn NVARCHAR(128)');
    params.push('@SortDirection NVARCHAR(4)');
    
    // Add pagination parameters
    if (complexQueryOptions.usePagination) {
      params.push('@PageNumber INT');
      params.push('@PageSize INT');
    }
    
    sql += params.join(', ');
    sql += `';\n\n`;
    
    sql += `    -- Execute the dynamic SQL\n`;
    sql += `    EXEC sp_executesql @SQL, @ParamDefinition, `;
    
    // Parameter values
    const paramValues = [];
    searchableColumns.forEach(col => {
      if (['datetime', 'date', 'datetime2', 'smalldatetime'].includes(col.Type.toLowerCase())) {
        paramValues.push(`@${col.Name}_From = @${col.Name}_From`);
        paramValues.push(`@${col.Name}_To = @${col.Name}_To`);
      } else {
        paramValues.push(`@${col.Name} = @${col.Name}`);
      }
    });
    
    // Add sorting parameter values
    paramValues.push('@SortColumn = @SortColumn');
    paramValues.push('@SortDirection = @SortDirection');
    
    // Add pagination parameter values
    if (complexQueryOptions.usePagination) {
      paramValues.push('@PageNumber = @PageNumber');
      paramValues.push('@PageSize = @PageSize');
    }
    
    sql += paramValues.join(', ');
    sql += `;\n`;
    
    return sql;
  };

  const generateOrderByClause = () => {
    if (sortingOptions.orderByColumns.length === 0) {
      return 'ORDER BY 1';
    }
    
    const orderBy = sortingOptions.orderByColumns.map(col => {
      const direction = sortingOptions.sortDirections[col] || 'ASC';
      return `t.[${col}] ${direction}`;
    }).join(', ');
    
    return `ORDER BY ${orderBy}`;
  };

  const generateSelectColumns = (columns) => {
    return columns.map(col => `        t.[${col.Name}]`).join(',\n');
  };

  const generateAggregateColumns = (columns) => {
    let sql = '';
    
    // Group by columns first
    aggregateOptions.groupByColumns.forEach(col => {
      sql += `        t.[${col}],\n`;
    });
    
    // Then aggregate functions
    aggregateOptions.aggregateFunctions.forEach(func => {
      sql += `        ${func.function}(t.[${func.column}]) as ${func.alias},\n`;
    });
    
    return sql.slice(0, -2); // Remove trailing comma
  };

  const generateCTESection = (tableInfo) => {
    return `    -- Common Table Expression\n    WITH DataCTE AS (\n        SELECT *\n        FROM [dbo].[${activeTable}]\n        -- Add your CTE logic here\n    ),\n    AnalyticsCTE AS (\n        SELECT *,\n               ROW_NUMBER() OVER (PARTITION BY SomeColumn ORDER BY SomeOtherColumn) as RowNum\n        FROM DataCTE\n    )\n\n`;
  };

  const getColumnTypeString = (column) => {
    switch (column.Type.toLowerCase()) {
      case 'varchar':
      case 'nvarchar':
      case 'char':
      case 'nchar':
        return `${column.Type.toUpperCase()}(${column.MaxLength || 255})`;
      case 'decimal':
      case 'numeric':
        return `${column.Type.toUpperCase()}(${column.Precision || 18}, ${column.Scale || 2})`;
      default:
        return column.Type.toUpperCase();
    }
  };

  // ===== ENHANCED ANALYTICAL QUERY GENERATION FUNCTIONS =====
  
  // Generate advanced analytical queries
  const generateAnalyticalQuery = (queryType, options = {}) => {
    const pkColumn = activeTable && metadata[activeTable] ? 
      metadata[activeTable].Columns.find(col => col.IsPrimaryKey) : null;
    
    let sql = '';
    
    switch (queryType) {
      case 'trends':
        sql = generateTrendAnalysisQuery(options);
        break;
      case 'performance':
        sql = generatePerformanceMetricsQuery(options);
        break;
      case 'comparison':
        sql = generateComparisonQuery(options);
        break;
      case 'distribution':
        sql = generateDistributionQuery(options);
        break;
      case 'anomaly':
        sql = generateAnomalyDetectionQuery(options);
        break;
      default:
        sql = generateBasicAnalyticsQuery(options);
    }
    
    return sql;
  };
  
  // Generate trend analysis query
  const generateTrendAnalysisQuery = (options) => {
    const dateColumns = metadata[activeTable]?.Columns.filter(col => 
      ['datetime', 'datetime2', 'date', 'smalldatetime'].includes(col.Type.toLowerCase())
    ) || [];
    
    if (dateColumns.length === 0) {
      return '-- No date columns found for trend analysis';
    }
    
    const dateColumn = dateColumns[0]; // Use first date column
    const timeWindow = options.timeWindow || '30days';
    
    let sql = `    -- Trend Analysis Query\n`;
    sql += `    -- Analyzes trends over the last ${timeWindow}\n\n`;
    sql += `    WITH TrendData AS (\n`;
    sql += `        SELECT \n`;
    sql += `            CAST([${dateColumn.Name}] AS DATE) as TrendDate,\n`;
    sql += `            COUNT(*) as RecordCount,\n`;
    sql += `            DATEPART(WEEK, [${dateColumn.Name}]) as WeekNumber,\n`;
    sql += `            DATEPART(MONTH, [${dateColumn.Name}]) as MonthNumber\n`;
    sql += `        FROM [dbo].[${activeTable}]\n`;
    sql += `        WHERE [${dateColumn.Name}] >= DATEADD(DAY, -${timeWindow.replace('days', '')}, GETDATE())\n`;
    sql += `        GROUP BY CAST([${dateColumn.Name}] AS DATE), DATEPART(WEEK, [${dateColumn.Name}]), DATEPART(MONTH, [${dateColumn.Name}])\n`;
    sql += `    )\n`;
    sql += `    SELECT \n`;
    sql += `        TrendDate,\n`;
    sql += `        RecordCount,\n`;
    sql += `        AVG(RecordCount) OVER (ORDER BY TrendDate ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as MovingAverage,\n`;
    sql += `        LAG(RecordCount, 1) OVER (ORDER BY TrendDate) as PreviousDayCount,\n`;
    sql += `        CASE \n`;
    sql += `            WHEN LAG(RecordCount, 1) OVER (ORDER BY TrendDate) IS NOT NULL \n`;
    sql += `            THEN ((RecordCount * 1.0 - LAG(RecordCount, 1) OVER (ORDER BY TrendDate)) / LAG(RecordCount, 1) OVER (ORDER BY TrendDate)) * 100\n`;
    sql += `            ELSE 0\n`;
    sql += `        END as DayOverDayChange\n`;
    sql += `    FROM TrendData\n`;
    sql += `    ORDER BY TrendDate DESC;`;
    
    return sql;
  };
  
  // Generate performance metrics query
  const generatePerformanceMetricsQuery = (options) => {
    const numericColumns = metadata[activeTable]?.Columns.filter(col => 
      ['int', 'bigint', 'decimal', 'float', 'money'].includes(col.Type.toLowerCase())
    ) || [];
    
    let sql = `    -- Performance Metrics Query\n`;
    sql += `    -- Provides comprehensive performance metrics\n\n`;
    sql += `    SELECT \n`;
    sql += `        COUNT(*) as TotalRecords,\n`;
    sql += `        COUNT(DISTINCT *) as UniqueRecords,\n`;
    
    numericColumns.slice(0, 3).forEach(col => {
      sql += `        AVG(CAST([${col.Name}] AS FLOAT)) as Avg_${col.Name},\n`;
      sql += `        MIN([${col.Name}]) as Min_${col.Name},\n`;
      sql += `        MAX([${col.Name}]) as Max_${col.Name},\n`;
      sql += `        STDEV(CAST([${col.Name}] AS FLOAT)) as StdDev_${col.Name},\n`;
    });
    
    sql += `        GETDATE() as AnalysisTimestamp\n`;
    sql += `    FROM [dbo].[${activeTable}];`;
    
    return sql;
  };
  
  // ===== END ENHANCED ANALYTICAL QUERY GENERATION FUNCTIONS =====

  // Enhanced Soft Delete query generator with advanced configuration
  const generateSoftDeleteQuery = (columns, tableInfo) => {
    const pkColumn = tableInfo.Columns.find(col => col.IsPrimaryKey);
    if (!pkColumn) return '-- Error: No primary key found for soft delete operation\n';
    
    // Try to find appropriate columns for soft delete based on configuration
    const possibleStatusColumns = columns.filter(col => 
      ['IsDeleted', 'IsActive', 'Active', 'Deleted', 'Status', 'RecordStatus', 'IsEnabled', 'Enabled'].includes(col.Name)
    );
    
    const possibleDateColumns = columns.filter(col => 
      ['datetime', 'datetime2', 'date', 'smalldatetime'].includes(col.Type.toLowerCase()) &&
      ['DeletedDate', 'DeletedOn', 'RemovedDate', 'RemovedOn', 'DeactivatedDate', 'DisabledDate'].includes(col.Name)
    );
    
    const auditColumns = columns.filter(col => 
      ['DeletedBy', 'DeletedByUserId', 'ModifiedBy', 'UpdatedBy'].includes(col.Name)
    );
    
    let sql = `    -- Enhanced Soft Delete Operation\n`;
    sql += `    -- Strategy: ${softDeleteConfig.deleteStrategy.toUpperCase()}\n`;
    sql += `    -- Restore Capability: ${softDeleteConfig.restoreCapability ? 'ENABLED' : 'DISABLED'}\n`;
    sql += `    -- Audit Trail: ${softDeleteConfig.auditTrail ? 'ENABLED' : 'DISABLED'}\n\n`;
    
    // Generate different strategies based on configuration
    switch (softDeleteConfig.deleteStrategy) {
      case 'archive':
        sql += generateArchiveDeleteStrategy(columns, tableInfo, pkColumn);
        break;
      case 'timestamp':
        sql += generateTimestampDeleteStrategy(columns, tableInfo, pkColumn, possibleDateColumns, auditColumns);
        break;
      default: // 'flag'
        sql += generateFlagDeleteStrategy(columns, tableInfo, pkColumn, possibleStatusColumns, auditColumns);
    }
    
    // Add restore procedure if enabled
    if (softDeleteConfig.restoreCapability) {
      sql += `\n\n    -- Companion Restore Procedure\n`;
      sql += generateRestoreProcedure(columns, tableInfo, pkColumn);
    }
    
    // Add cascade delete if enabled
    if (softDeleteConfig.cascadeDelete && tableInfo.ForeignKeys && tableInfo.ForeignKeys.length > 0) {
      sql += `\n\n    -- Cascade Soft Delete to Related Tables\n`;
      sql += generateCascadeSoftDelete(tableInfo);
    }
    
    return sql;
  };
  
  // Generate flag-based soft delete strategy
  const generateFlagDeleteStrategy = (columns, tableInfo, pkColumn, statusColumns, auditColumns) => {
    let sql = `    -- Flag-based soft delete\n`;
    
    if (statusColumns.length > 0 || softDeleteConfig.useCustomColumn) {
      sql += `    UPDATE [dbo].[${activeTable}]\n`;
      sql += `    SET\n`;
      
      const updates = [];
      
      if (softDeleteConfig.useCustomColumn && softDeleteConfig.customColumnName) {
        updates.push(`        [${softDeleteConfig.customColumnName}] = 1`);
      } else {
        statusColumns.forEach(col => {
          if (['IsDeleted', 'Deleted'].includes(col.Name)) {
            updates.push(`        [${col.Name}] = 1`);
          } else if (['IsActive', 'Active', 'IsEnabled', 'Enabled'].includes(col.Name)) {
            updates.push(`        [${col.Name}] = 0`);
          } else if (['Status', 'RecordStatus'].includes(col.Name)) {
            updates.push(`        [${col.Name}] = 'DELETED'`);
          }
        });
      }
      
      // Add audit trail columns
      if (softDeleteConfig.auditTrail) {
        const deletedDateCol = columns.find(col => col.Name === 'DeletedDate' || col.Name === 'DeletedOn');
        if (deletedDateCol) {
          updates.push(`        [${deletedDateCol.Name}] = GETDATE()`);
        }
        
        const deletedByCol = auditColumns.find(col => col.Name.includes('DeletedBy'));
        if (deletedByCol) {
          updates.push(`        [${deletedByCol.Name}] = @DeletedBy`);
        }
      }
      
      sql += updates.join(',\n');
      sql += `\n    WHERE [${pkColumn.Name}] = @${pkColumn.Name}\n`;
      sql += `      AND ([IsDeleted] = 0 OR [IsDeleted] IS NULL); -- Prevent double deletion\n\n`;
    } else {
      sql += `    -- No suitable columns found. Consider adding:\n`;
      sql += `    --   IsDeleted (bit) - Recommended\n`;
      sql += `    --   DeletedDate (datetime) - For audit trail\n`;
      sql += `    --   DeletedBy (nvarchar(100)) - For user tracking\n\n`;
      
      sql += `    -- Alternative: Use a status table approach\n`;
      sql += `    INSERT INTO [dbo].[${activeTable}_DeleteLog] ([${pkColumn.Name}], [DeletedDate], [DeletedBy])\n`;
      sql += `    SELECT @${pkColumn.Name}, GETDATE(), @DeletedBy\n`;
      sql += `    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[${activeTable}_DeleteLog] WHERE [${pkColumn.Name}] = @${pkColumn.Name});\n\n`;
    }
    
    return sql;
  };
  
  // Generate timestamp-based soft delete strategy
  const generateTimestampDeleteStrategy = (columns, tableInfo, pkColumn, dateColumns, auditColumns) => {
    let sql = `    -- Timestamp-based soft delete\n`;
    
    const deletedDateCol = dateColumns.find(col => col.Name.includes('Deleted')) || 
                          columns.find(col => col.Name === 'DeletedDate');
    
    if (deletedDateCol) {
      sql += `    UPDATE [dbo].[${activeTable}]\n`;
      sql += `    SET [${deletedDateCol.Name}] = GETDATE()`;
      
      if (softDeleteConfig.auditTrail) {
        const deletedByCol = auditColumns.find(col => col.Name.includes('DeletedBy'));
        if (deletedByCol) {
          sql += `,\n        [${deletedByCol.Name}] = @DeletedBy`;
        }
      }
      
      sql += `\n    WHERE [${pkColumn.Name}] = @${pkColumn.Name}\n`;
      sql += `      AND [${deletedDateCol.Name}] IS NULL; -- Prevent double deletion\n\n`;
    } else {
      sql += `    -- No timestamp column found. Creating soft delete with new column suggestion:\n`;
      sql += `    -- ALTER TABLE [dbo].[${activeTable}] ADD [DeletedDate] datetime NULL;\n`;
      sql += `    -- ALTER TABLE [dbo].[${activeTable}] ADD [DeletedBy] nvarchar(100) NULL;\n\n`;
    }
    
    return sql;
  };
  
  // Generate archive-based soft delete strategy
  const generateArchiveDeleteStrategy = (columns, tableInfo, pkColumn) => {
    let sql = `    -- Archive-based soft delete\n`;
    sql += `    -- Step 1: Move record to archive table\n`;
    sql += `    INSERT INTO [dbo].[${activeTable}_Archive]\n`;
    sql += `    SELECT *, GETDATE() as ArchivedDate, @DeletedBy as ArchivedBy\n`;
    sql += `    FROM [dbo].[${activeTable}]\n`;
    sql += `    WHERE [${pkColumn.Name}] = @${pkColumn.Name};\n\n`;
    
    sql += `    -- Step 2: Remove from main table\n`;
    sql += `    DELETE FROM [dbo].[${activeTable}]\n`;
    sql += `    WHERE [${pkColumn.Name}] = @${pkColumn.Name};\n\n`;
    
    return sql;
  };
  
  // Generate restore procedure
  const generateRestoreProcedure = (columns, tableInfo, pkColumn) => {
    let sql = `    -- Restore Procedure (Companion to Soft Delete)\n`;
    sql += `    -- EXEC sp_Restore${activeTable} @${pkColumn.Name}\n\n`;
    
    if (softDeleteConfig.deleteStrategy === 'flag') {
      sql += `    UPDATE [dbo].[${activeTable}]\n`;
      sql += `    SET [IsDeleted] = 0,\n`;
      sql += `        [DeletedDate] = NULL,\n`;
      sql += `        [DeletedBy] = NULL,\n`;
      sql += `        [RestoredDate] = GETDATE(),\n`;
      sql += `        [RestoredBy] = @RestoredBy\n`;
      sql += `    WHERE [${pkColumn.Name}] = @${pkColumn.Name} AND [IsDeleted] = 1;\n`;
    } else if (softDeleteConfig.deleteStrategy === 'archive') {
      sql += `    -- Restore from archive\n`;
      sql += `    INSERT INTO [dbo].[${activeTable}]\n`;
      sql += `    SELECT [original columns], GETDATE() as RestoredDate, @RestoredBy as RestoredBy\n`;
      sql += `    FROM [dbo].[${activeTable}_Archive]\n`;
      sql += `    WHERE [${pkColumn.Name}] = @${pkColumn.Name};\n\n`;
      
      sql += `    DELETE FROM [dbo].[${activeTable}_Archive]\n`;
      sql += `    WHERE [${pkColumn.Name}] = @${pkColumn.Name};\n`;
    }
    
    return sql;
  };
  
  // Generate cascade soft delete
  const generateCascadeSoftDelete = (tableInfo) => {
    let sql = '';
    
    if (tableInfo.ForeignKeys && tableInfo.ForeignKeys.length > 0) {
      tableInfo.ForeignKeys.forEach(fk => {
        sql += `    -- Cascade to ${fk.ReferencedTable}\n`;
        sql += `    UPDATE [dbo].[${fk.ReferencedTable}]\n`;
        sql += `    SET [IsDeleted] = 1, [DeletedDate] = GETDATE(), [DeletedBy] = @DeletedBy\n`;
        sql += `    WHERE [${fk.ReferencedColumn}] = @${fk.ColumnName}\n`;
        sql += `      AND ([IsDeleted] = 0 OR [IsDeleted] IS NULL);\n\n`;
      });
    }
    
    return sql;
  };

  // Get reference table columns for a foreign key
  const getReferenceTableColumns = (fkColumn) => {
    if (!activeTable || !metadata || !metadata[activeTable] || !metadata[activeTable].ForeignKeys) {
      return [];
    }

    const foreignKey = metadata[activeTable].ForeignKeys.find(fk => fk.ColumnName === fkColumn);
    if (!foreignKey || !metadata[foreignKey.ReferencedTable]) return [];

    return metadata[foreignKey.ReferencedTable].Columns || [];
  };

  // Filter columns based on search term
  const getFilteredColumns = () => {
    if (!activeTable || !metadata || !metadata[activeTable] || !metadata[activeTable].Columns) {
      return [];
    }
    
    if (!columnSearchTerm) return metadata[activeTable].Columns;
    
    return metadata[activeTable].Columns.filter(column =>
      column.Name.toLowerCase().includes(columnSearchTerm.toLowerCase()) ||
      column.Type.toLowerCase().includes(columnSearchTerm.toLowerCase())
    );
  };

  // Toggle procedure details visibility
  const toggleProcedureDetails = (procedureType) => {
    setShowProcedureDetails(prev => ({
      ...prev,
      [procedureType]: !prev[procedureType]
    }));
  };

  // Ripple effect style
  React.useEffect(() => {
    if (!document.getElementById('spgen-ripple-style')) {
      const style = document.createElement('style');
      style.id = 'spgen-ripple-style';
      style.innerHTML = `
        .ripple-effect {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(56,189,248,0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes ripple {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <React.Fragment>
      {(!activeTable || !metadata || !metadata[activeTable]) ? (
        <motion.div 
          className="p-8 bg-white rounded-xl shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <FaInfoCircle className="text-amber-500 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No Table Selected</h3>
          <p className="text-slate-600 mb-6">Please select a table from the database explorer to generate stored procedures.</p>
          <motion.button
            onClick={onBackToEditor}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBackward />
            <span>Back to Explorer</span>
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-white overflow-auto' : 'relative'} transition-all duration-500`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
        <div className={`${isFullscreen ? 'min-h-screen' : ''} bg-gradient-to-br from-slate-50 via-white to-teal-50 rounded-2xl shadow-2xl overflow-hidden border border-slate-200`}>
          {/* Enhanced Header */}
          <motion.div 
            className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-teal-900 text-white p-6 border-b border-slate-300"
            variants={glowVariants}
            initial="initial"
            animate="animate"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* Left: Icon & Title */}
              <motion.div 
                className="flex items-center gap-4"
                variants={itemVariants}
              >
                <motion.div 
                  className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="SQL Terminal Icon"
                  tabIndex={0}
                >
                  <FaTerminal className="text-2xl" />
                </motion.div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
                    SQL Procedure Generator
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Generate enterprise-grade stored procedures for <span className="font-semibold text-teal-200">{activeTable}</span>
                  </p>
                </div>
              </motion.div>

              {/* Right: Action Buttons */}
              <motion.div 
                className="flex items-center gap-2 md:gap-3"
                variants={itemVariants}
              >
                {/* Back to Editor Button */}
                {showPreview && (
                  <motion.button
                    type="button"
                    aria-label="Back to Editor"
                    onClick={(e) => {
                      // Ripple effect
                      const button = e.currentTarget;
                      const ripple = document.createElement('span');
                      ripple.className = 'ripple-effect';
                      const rect = button.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      ripple.style.left = `${x}px`;
                      ripple.style.top = `${y}px`;
                      button.appendChild(ripple);
                      setTimeout(() => ripple.remove(), 600);
                      // Execute callback
                      setShowPreview(false);
                      setGeneratedSP('');
                      setError('');
                      if (onBackToEditor) {
                        onBackToEditor();
                      }
                    }}
                    className="relative px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 shadow-lg"
                    whileHover={{ scale: 1.08, boxShadow: '0 4px 20px rgba(56,189,248,0.15)' }}
                    whileTap={{ scale: 0.96 }}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    <FaCodeBranch className="text-base" />
                    <span>Back to Editor</span>
                  </motion.button>
                )}

                {/* Fullscreen Toggle Button */}
                <motion.button
                  type="button"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  style={{ cursor: 'pointer' }}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </motion.button>
              </motion.div>
            </div>
            
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full animate-pulse"></div>
            </div>
          </motion.div>
          
          <div className={`${isFullscreen ? 'min-h-screen overflow-auto' : ''} p-6`}>
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-xl border border-red-200 flex items-center shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaTimes className="mr-3 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Display */}
            <AnimatePresence>
              {apiResponse && (
                <motion.div 
                  className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 rounded-xl border border-green-200 flex items-center shadow-lg"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaCheck className="mr-3 text-green-500 flex-shrink-0" />
                  <span className="font-medium">Successfully created stored procedures in the database! 🎉</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!showPreview ? (
              <motion.div
                variants={itemVariants}
                className="space-y-8"
              >
                {/* Procedure Type Selection */}
                <motion.div 
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
                  whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold text-slate-800 flex items-center">
                      <FaLayerGroup className="mr-3 text-teal-600" />
                      Procedure Type
                    </h4>
                    <motion.div
                      animate={isGenerating ? "pulse" : ""}
                      variants={pulseVariants}
                    >
                      <FaRocket className={`text-2xl ${isGenerating ? 'text-orange-500' : 'text-slate-400'}`} />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['select', 'insert', 'update', 'delete'].map((type, index) => (
                      <motion.button
                        key={type}
                        onClick={() => setSpType(type)}
                        className={`relative overflow-hidden p-4 rounded-xl capitalize font-semibold text-sm transition-all duration-300 transform ${
                          spType === type
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-102'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div className="flex flex-col items-center space-y-2">
                          <motion.div
                            animate={spType === type ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            {type === 'select' && <FaEye />}
                            {type === 'insert' && <FaPlus />}
                            {type === 'update' && <FaCogs />}
                            {type === 'delete' && <FaTimes />}
                          </motion.div>
                          <span>{type}</span>
                        </motion.div>
                        
                        {spType === type && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Columns and Where Clauses */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* Column Selection */}
                  <motion.div 
                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold flex items-center">
                          <FaFilter className="mr-2" />
                          Columns to Include
                        </h4>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => setShowColumnSearch(!showColumnSearch)}
                            className="p-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaSearch className="text-sm" />
                          </motion.button>
                          <motion.button
                            onClick={handleSelectAll}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-lg text-xs font-medium transition-all duration-200 flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaPlus className="mr-1 text-xs" /> All
                          </motion.button>
                          <motion.button
                            onClick={handleSelectNone}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-lg text-xs font-medium transition-all duration-200 flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaMinus className="mr-1 text-xs" /> None
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Search Bar */}
                      <AnimatePresence>
                        {showColumnSearch && (
                          <motion.div 
                            className="mt-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search columns..."
                                value={columnSearchTerm}
                                onChange={(e) => setColumnSearchTerm(e.target.value)}
                                className="w-full bg-white/20 text-white placeholder-white/70 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                              />
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
                      <motion.div className="space-y-2">
                        {getFilteredColumns().map((column, index) => (
                          <motion.div
                            key={column.Name}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-center flex-1">
                              <motion.input
                                type="checkbox"
                                id={`col-${column.Name}`}
                                checked={includedColumns.includes(column.Name)}
                                onChange={() => handleColumnToggle(column.Name)}
                                className="mr-3 h-4 w-4 text-teal-600 border-teal-300 rounded focus:ring-teal-500"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              />
                              <label
                                htmlFor={`col-${column.Name}`}
                                className="font-medium text-slate-800 flex-1 cursor-pointer"
                              >
                                {column.Name}
                              </label>
                            </div>
                            <motion.span 
                              className="text-xs py-1 px-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full font-medium"
                              whileHover={{ scale: 1.05 }}
                            >
                              {column.Type}
                            </motion.span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                      <p className="text-xs text-slate-600 flex items-center">
                        <FaInfoCircle className="mr-2 text-slate-400" />
                        {includedColumns.length > 0 ? `${includedColumns.length} columns selected` : 'All columns will be included if none selected'}
                      </p>
                    </div>
                  </motion.div>

                  {/* Where Clauses */}
                  <motion.div 
                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                      <h4 className="font-bold flex items-center">
                        <FaCodeBranch className="mr-2" />
                        Where Clauses
                      </h4>
                    </div>
                    
                    <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
                      <motion.div className="space-y-2">
                        {metadata[activeTable].Columns.map((column, index) => (
                          <motion.div
                            key={column.Name}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: -5 }}
                          >
                            <div className="flex items-center flex-1">
                              <motion.input
                                type="checkbox"
                                id={`where-${column.Name}`}
                                checked={whereClauses.includes(column.Name)}
                                onChange={() => handleWhereClauseToggle(column.Name)}
                                className="mr-3 h-4 w-4 text-orange-500 border-orange-300 rounded focus:ring-orange-500"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              />
                              <label
                                htmlFor={`where-${column.Name}`}
                                className="font-medium text-slate-800 flex-1 cursor-pointer"
                              >
                                {column.Name}
                              </label>
                            </div>
                            <motion.span 
                              className="text-xs py-1 px-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full font-medium"
                              whileHover={{ scale: 1.05 }}
                            >
                              {column.Type}
                            </motion.span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                      <p className="text-xs text-slate-600 flex items-center">
                        <FaInfoCircle className="mr-2 text-slate-400" />
                        {spType === 'select' ? 'Optional parameter conditions' : 'Required for update/delete operations'}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Foreign Key Selections (Only for SELECT procedures) */}
                {spType === 'select' && metadata[activeTable].ForeignKeys && metadata[activeTable].ForeignKeys.length > 0 && (
                  <motion.div 
                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
                      <h4 className="font-bold flex items-center">
                        <FaKey className="mr-2" />
                        Foreign Key Joins
                      </h4>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-4">
                        {metadata[activeTable].ForeignKeys.map((fk, index) => (
                          <motion.div 
                            key={fk.ColumnName} 
                            className="border border-slate-200 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <motion.div
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-all duration-200"
                              onClick={() => toggleForeignKeySelection(fk.ColumnName)}
                              whileHover={{ x: 5 }}
                            >
                              <div className="flex items-center">
                                <motion.input
                                  type="checkbox"
                                  checked={foreignKeySelections[fk.ColumnName] || false}
                                  onChange={() => toggleForeignKeySelection(fk.ColumnName)}
                                  className="mr-3 h-4 w-4 text-purple-500 border-purple-300 rounded focus:ring-purple-500"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                />
                                <div>
                                  <span className="font-medium text-slate-800">{fk.ColumnName}</span>
                                  <span className="text-sm ml-2 text-slate-600">→ {fk.ReferencedTable}.{fk.ReferencedColumn}</span>
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: foreignKeySelections[fk.ColumnName] ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <FaChevronRight className="text-slate-400" />
                              </motion.div>
                            </motion.div>

                            <AnimatePresence>
                              {foreignKeySelections[fk.ColumnName] && (
                                <motion.div 
                                  className="border-t border-slate-200 bg-slate-50 p-4"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <p className="text-sm text-slate-700 mb-3 font-medium">Select columns from {fk.ReferencedTable}:</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {getReferenceTableColumns(fk.ColumnName).map((refCol, colIndex) => (
                                      <motion.div 
                                        key={refCol.Name} 
                                        className="flex items-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: colIndex * 0.05 }}
                                      >
                                        <motion.input
                                          type="checkbox"
                                          id={`fkCol-${fk.ColumnName}-${refCol.Name}`}
                                          checked={(foreignKeyColumns[fk.ColumnName] || []).includes(refCol.Name)}
                                          onChange={() => handleFKColumnToggle(fk.ColumnName, refCol.Name)}
                                          className="mr-2 h-3 w-3 text-purple-500 border-purple-300 rounded focus:ring-purple-500"
                                          whileHover={{ scale: 1.2 }}
                                          whileTap={{ scale: 0.8 }}
                                        />
                                        <label
                                          htmlFor={`fkCol-${fk.ColumnName}-${refCol.Name}`}
                                          className="text-sm text-slate-700 cursor-pointer truncate"
                                        >
                                          {refCol.Name}
                                        </label>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Action Buttons */}
                <motion.div 
                  className="bg-gradient-to-br from-slate-100 via-white to-teal-50 rounded-2xl p-6 border border-slate-200 shadow-lg"
                  variants={itemVariants}
                  whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold text-slate-800 flex items-center">
                      <FaRocket className="mr-3 text-orange-500" />
                      Generate Options
                    </h4>
                    <motion.button
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaCogs />
                      <span className="text-sm">Advanced</span>
                      <motion.div
                        animate={{ rotate: showAdvancedOptions ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-xs" />
                      </motion.div>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      className="group bg-white rounded-xl border-2 border-teal-200 p-6 hover:border-teal-400 transition-all duration-300 hover:shadow-lg"
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <motion.div 
                          className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <FaPlay className="text-white text-xl" />
                        </motion.div>
                        <h5 className="font-bold text-slate-800 mb-2">Single Procedure</h5>
                        <p className="text-sm text-slate-600 mb-4">Generate a specific stored procedure type.</p>
                        <motion.button
                          onClick={generateSP}
                          disabled={isGenerating}
                          className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isGenerating ? (
                            <motion.div 
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (
                            <>
                              <FaPlay />
                              <span>Generate {spType.charAt(0).toUpperCase() + spType.slice(1)}</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="group bg-white rounded-xl border-2 border-amber-200 p-6 hover:border-amber-400 transition-all duration-300 hover:shadow-lg"
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <motion.div 
                          className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <FaLayerGroup className="text-white text-xl" />
                        </motion.div>
                        <h5 className="font-bold text-slate-800 mb-2">All Procedures</h5>
                        <p className="text-sm text-slate-600 mb-4">Generate all CRUD operations at once.</p>
                        <motion.button
                          onClick={generateAllProcedures}
                          disabled={isCreatingAll}
                          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isCreatingAll ? (
                            <motion.div 
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (
                            <>
                              <FaLayerGroup />
                              <span>Generate All</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="group bg-white rounded-xl border-2 border-blue-200 p-6 hover:border-blue-400 transition-all duration-300 hover:shadow-lg"
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <motion.div 
                          className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <FaDatabase className="text-white text-xl" />
                        </motion.div>
                        <h5 className="font-bold text-slate-800 mb-2">Deploy to DB</h5>
                        <p className="text-sm text-slate-600 mb-4">Create procedures directly in database.</p>
                        <motion.button
                          onClick={createProceduresInDB}
                          disabled={isCreatingInDB}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isCreatingInDB ? (
                            <motion.div 
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (
                            <>
                              <FaDatabase />
                              <span>Deploy</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Advanced Complex Query Options */}
                <AnimatePresence>
                  {showAdvancedOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-lg"
                    >
                      <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <FaGem className="mr-3 text-indigo-500" />
                        Complex Query Features
                      </h4>

                      {/* Complex Query Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Basic Complex Options */}
                        {[
                          { key: 'useAggregates', label: 'Aggregate Functions', icon: FaChartBar, desc: 'SUM, COUNT, AVG, MAX, MIN, GROUP BY' },
                          { key: 'usePagination', label: 'Pagination', icon: FaList, desc: 'ROW_NUMBER, OFFSET/FETCH' },
                          { key: 'useSubqueries', label: 'Subqueries', icon: FaSearchPlus, desc: 'EXISTS, IN, correlated subqueries' },
                          { key: 'useCTE', label: 'Common Table Expressions', icon: FaNetworkWired, desc: 'WITH clause for complex queries' },
                          { key: 'useConditionalLogic', label: 'Conditional Logic', icon: FaCodeBranch, desc: 'CASE statements, IF/ELSE' },
                          { key: 'useDynamicSQL', label: 'Dynamic SQL', icon: FaCogs, desc: 'Runtime query construction' },
                          { key: 'useMultipleResultSets', label: 'Multiple Result Sets', icon: FaLayerGroup, desc: 'Return multiple datasets' }
                        ].map(option => (
                          <motion.div
                            key={option.key}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              complexQueryOptions[option.key]
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-400 shadow-lg'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                            }`}
                            onClick={() => setComplexQueryOptions(prev => ({ ...prev, [option.key]: !prev[option.key] }))}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center mb-2">
                              <option.icon className={`mr-2 ${complexQueryOptions[option.key] ? 'text-white' : 'text-indigo-500'}`} />
                              <span className="font-medium text-sm">{option.label}</span>
                            </div>
                            <p className={`text-xs ${complexQueryOptions[option.key] ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {option.desc}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Advanced Configuration Sections */}
                      <div className="space-y-4">
                        
                        {/* Enhanced Soft Delete Configuration */}
                        {spType === 'softDelete' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-6 border border-red-200 shadow-md"
                          >
                            <h5 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                              <FaTimes className="mr-2 text-red-500" />
                              Soft Delete Configuration
                            </h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Delete Strategy</label>
                                <select
                                  value={softDeleteConfig.deleteStrategy}
                                  onChange={(e) => setSoftDeleteConfig(prev => ({...prev, deleteStrategy: e.target.value}))}
                                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                >
                                  <option value="flag">Flag-Based (Recommended)</option>
                                  <option value="timestamp">Timestamp-Based</option>
                                  <option value="archive">Archive to Separate Table</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Custom Column Name</label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={softDeleteConfig.useCustomColumn}
                                    onChange={(e) => setSoftDeleteConfig(prev => ({...prev, useCustomColumn: e.target.checked}))}
                                    className="h-4 w-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="e.g., IsDeleted, IsActive"
                                    value={softDeleteConfig.customColumnName}
                                    onChange={(e) => setSoftDeleteConfig(prev => ({...prev, customColumnName: e.target.value}))}
                                    disabled={!softDeleteConfig.useCustomColumn}
                                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-slate-100"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={softDeleteConfig.restoreCapability}
                                  onChange={(e) => setSoftDeleteConfig(prev => ({...prev, restoreCapability: e.target.checked}))}
                                  className="h-4 w-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-slate-700">Restore Capability</span>
                              </label>
                              
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={softDeleteConfig.cascadeDelete}
                                  onChange={(e) => setSoftDeleteConfig(prev => ({...prev, cascadeDelete: e.target.checked}))}
                                  className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-slate-700">Cascade Delete</span>
                              </label>
                              
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={softDeleteConfig.auditTrail}
                                  onChange={(e) => setSoftDeleteConfig(prev => ({...prev, auditTrail: e.target.checked}))}
                                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">Audit Trail</span>
                              </label>
                            </div>
                          </motion.div>
                        )}

                        {/* Analytical Query Configuration */}
                        {spType === 'analyticalQuery' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-6 border border-purple-200 shadow-md"
                          >
                            <h5 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                              <FaChartLine className="mr-2 text-purple-500" />
                              Analytical Query Configuration
                            </h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Query Type</label>
                                <select
                                  value={analyticalQueryType}
                                  onChange={(e) => setAnalyticalQueryType(e.target.value)}
                                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="basic">Basic Analytics</option>
                                  <option value="trends">Trend Analysis</option>
                                  <option value="performance">Performance Metrics</option>
                                  <option value="comparison">Comparison Analysis</option>
                                  <option value="distribution">Data Distribution</option>
                                  <option value="anomaly">Anomaly Detection</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Time Window</label>
                                <select
                                  value={analyticalMetrics.timeWindow}
                                  onChange={(e) => setAnalyticalMetrics(prev => ({...prev, timeWindow: e.target.value}))}
                                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="7days">Last 7 Days</option>
                                  <option value="30days">Last 30 Days</option>
                                  <option value="90days">Last 90 Days</option>
                                  <option value="1year">Last Year</option>
                                  <option value="all">All Time</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={analyticalMetrics.enableTrends}
                                  onChange={(e) => setAnalyticalMetrics(prev => ({...prev, enableTrends: e.target.checked}))}
                                  className="h-4 w-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-slate-700">Trend Analysis</span>
                              </label>
                              
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={analyticalMetrics.enableComparisons}
                                  onChange={(e) => setAnalyticalMetrics(prev => ({...prev, enableComparisons: e.target.checked}))}
                                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">Comparisons</span>
                              </label>
                              
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={analyticalMetrics.enableAggregations}
                                  onChange={(e) => setAnalyticalMetrics(prev => ({...prev, enableAggregations: e.target.checked}))}
                                  className="h-4 w-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm text-slate-700">Aggregations</span>
                              </label>
                            </div>
                          </motion.div>
                        )}

                        {/* Dynamic Search Configuration */}
                        {spType === 'dynamicSearch' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-6 border border-teal-200 shadow-md"
                          >
                            <h5 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                              <FaSearchPlus className="mr-2 text-teal-500" />
                              Dynamic Search Configuration
                            </h5>
                            
                            <div className="space-y-4">
                              {dynamicSearchFilters.map((filter, index) => (
                                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-1">Column</label>
                                      <select
                                        value={filter.column || ''}
                                        onChange={(e) => {
                                          const newFilters = [...dynamicSearchFilters];
                                          newFilters[index] = {...filter, column: e.target.value};
                                          setDynamicSearchFilters(newFilters);
                                        }}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                      >
                                        <option value="">Select Column</option>
                                        {metadata[activeTable]?.Columns.map(col => (
                                          <option key={col.Name} value={col.Name}>{col.Name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-1">Operator</label>
                                      <select
                                        value={filter.operator || 'contains'}
                                        onChange={(e) => {
                                          const newFilters = [...dynamicSearchFilters];
                                          newFilters[index] = {...filter, operator: e.target.value};
                                          setDynamicSearchFilters(newFilters);
                                        }}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                      >
                                        <option value="contains">Contains</option>
                                        <option value="startsWith">Starts With</option>
                                        <option value="endsWith">Ends With</option>
                                        <option value="equals">Equals</option>
                                        <option value="notEquals">Not Equals</option>
                                        <option value="greaterThan">Greater Than</option>
                                        <option value="lessThan">Less Than</option>
                                        <option value="between">Between</option>
                                        <option value="in">In List</option>
                                        <option value="isNull">Is Null</option>
                                        <option value="isNotNull">Is Not Null</option>
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-1">Logic</label>
                                      <select
                                        value={filter.logicalOperator || 'AND'}
                                        onChange={(e) => {
                                          const newFilters = [...dynamicSearchFilters];
                                          newFilters[index] = {...filter, logicalOperator: e.target.value};
                                          setDynamicSearchFilters(newFilters);
                                        }}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        disabled={index === 0}
                                      >
                                        <option value="AND">AND</option>
                                        <option value="OR">OR</option>
                                      </select>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          const newFilters = dynamicSearchFilters.filter((_, i) => i !== index);
                                          setDynamicSearchFilters(newFilters);
                                        }}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                      >
                                        <FaTimes />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <button
                                onClick={() => setDynamicSearchFilters([...dynamicSearchFilters, {column: '', operator: 'contains', logicalOperator: 'AND'}])}
                                className="w-full p-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center space-x-2"
                              >
                                <FaPlus />
                                <span>Add Search Filter</span>
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Pagination Settings */}
                        {complexQueryOptions.usePagination && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-4 border border-slate-200"
                          >
                            <h5 className="font-semibold text-slate-800 mb-3 flex items-center">
                              <FaList className="mr-2 text-indigo-500" />
                              Pagination Configuration
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Default Page Size</label>
                                <input
                                  type="number"
                                  value={paginationOptions.pageSize}
                                  onChange={(e) => setPaginationOptions(prev => ({ ...prev, pageSize: parseInt(e.target.value) }))}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                  min="1"
                                  max="1000"
                                />
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="includeCount"
                                  checked={paginationOptions.includeCount}
                                  onChange={(e) => setPaginationOptions(prev => ({ ...prev, includeCount: e.target.checked }))}
                                  className="mr-2 h-4 w-4 text-indigo-500"
                                />
                                <label htmlFor="includeCount" className="text-sm text-slate-700">Include total count</label>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Aggregate Functions Settings */}
                        {complexQueryOptions.useAggregates && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-4 border border-slate-200"
                          >
                            <h5 className="font-semibold text-slate-800 mb-3 flex items-center">
                              <FaChartBar className="mr-2 text-indigo-500" />
                              Aggregate Functions Configuration
                            </h5>
                            
                            {/* Group By Columns */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-slate-700 mb-2">Group By Columns</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {metadata[activeTable].Columns.map(col => (
                                  <label key={col.Name} className="flex items-center text-sm">
                                    <input
                                      type="checkbox"
                                      checked={aggregateOptions.groupByColumns.includes(col.Name)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setAggregateOptions(prev => ({
                                            ...prev,
                                            groupByColumns: [...prev.groupByColumns, col.Name]
                                          }));
                                        } else {
                                          setAggregateOptions(prev => ({
                                            ...prev,
                                            groupByColumns: prev.groupByColumns.filter(c => c !== col.Name)
                                          }));
                                        }
                                      }}
                                      className="mr-2 h-3 w-3 text-indigo-500"
                                    />
                                    {col.Name}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Aggregate Functions */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Aggregate Functions</label>
                              <div className="space-y-2">
                                {['SUM', 'COUNT', 'AVG', 'MAX', 'MIN'].map(func => (
                                  <div key={func} className="flex items-center space-x-4 p-2 bg-slate-50 rounded-lg">
                                    <span className="text-sm font-medium w-16">{func}</span>
                                    <select
                                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const newFunc = { function: func, column: e.target.value, alias: `${func}_${e.target.value}` };
                                          setAggregateOptions(prev => ({
                                            ...prev,
                                            aggregateFunctions: [...prev.aggregateFunctions.filter(f => f.function !== func), newFunc]
                                          }));
                                        }
                                      }}
                                    >
                                      <option value="">Select column</option>
                                      {metadata[activeTable].Columns
                                        .filter(col => ['int', 'bigint', 'decimal', 'numeric', 'float', 'real', 'money'].includes(col.Type.toLowerCase()))
                                        .map(col => (
                                          <option key={col.Name} value={col.Name}>{col.Name}</option>
                                        ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                      </div>

                      {/* Complex Query Type Selection */}
                      <div className="mt-6">
                        <h5 className="font-semibold text-slate-800 mb-3 flex items-center">
                          <FaGem className="mr-2 text-indigo-500" />
                          Complex Query Templates
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { type: 'complexSelect', label: 'Advanced Select', icon: FaSearchPlus, desc: 'Complex SELECT with joins, pagination, and filters' },
                            { type: 'analyticsSelect', label: 'Analytics Query', icon: FaChartLine, desc: 'Business intelligence with aggregates and statistics' },
                            { type: 'reportingSelect', label: 'Reporting Query', icon: FaFileInvoice, desc: 'Report-ready queries with grouping and summaries' },
                            { type: 'dynamicSearch', label: 'Dynamic Search', icon: FaSearch, desc: 'Multi-optional parameter search with dynamic SQL' },
                            { type: 'softDelete', label: 'Enhanced Soft Delete', icon: FaTimes, desc: 'Advanced soft delete with restore, audit, and cascade options' },
                            { type: 'analyticalQuery', label: 'Analytical Queries', icon: FaChartLine, desc: 'Advanced analytics with trends, performance metrics, and comparisons' },
                            { type: 'dynamicSearch', label: 'Dynamic Search', icon: FaSearchPlus, desc: 'Flexible search with multiple operators and conditions' },
                            { type: 'upsert', label: 'UPSERT Operation', icon: FaExchangeAlt, desc: 'INSERT or UPDATE based on existence' },
                            { type: 'bulkOperations', label: 'Bulk Operations', icon: FaLayerGroup, desc: 'Table-valued parameters for bulk processing' }
                          ].map(template => (
                            <motion.button
                              key={template.type}
                              onClick={() => {
                                setSpType(template.type);
                                let complexSP;
                                const selectedColumns = includedColumns.length > 0 ? 
                                  includedColumns.map(colName => metadata[activeTable].Columns.find(col => col.Name === colName)) : 
                                  metadata[activeTable].Columns;
                                
                                if (template.type === 'dynamicSearch') {
                                  complexSP = generateDynamicSearchQuery(selectedColumns, metadata[activeTable]);
                                } else if (template.type === 'softDelete') {
                                  complexSP = generateSoftDeleteQuery(selectedColumns, metadata[activeTable]);
                                } else if (template.type === 'reportingSelect') {
                                  complexSP = generateReportingQuery(selectedColumns, metadata[activeTable]);
                                } else {
                                  complexSP = generateComplexStoredProcedure(template.type, selectedColumns);
                                }
                                
                                setGeneratedSP(complexSP);
                                setShowPreview(true);
                              }}
                              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 text-left"
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center mb-2">
                                <template.icon className="mr-2 text-indigo-500" />
                                <span className="font-medium text-slate-800">{template.label}</span>
                              </div>
                              <p className="text-xs text-slate-600">{template.desc}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add other sections here as needed */}

              </motion.div>
            ) : (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Preview Header */}
                <div className="flex justify-between items-center">
                  <motion.h4 
                    className="text-2xl font-bold text-slate-800 flex items-center"
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                  >
                    <FaTerminal className="mr-3 text-orange-500" />
                    {Object.keys(allProcedures).length > 1 ? 'Generated Stored Procedures' : 'Generated Stored Procedure'}
                  </motion.h4>
                  
                  <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ x: 20 }}
                    animate={{ x: 0 }}
                  >
                    <motion.button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaCopy />
                      <span>Copy</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={downloadSP}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaDownload />
                      <span>Download</span>
                    </motion.button>
                    
                    {Object.keys(allProcedures).length > 1 && (
                      <motion.button
                        onClick={downloadAllProcedures}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaFileDownload />
                        <span>Download All</span>
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={createProceduresInDB}
                      disabled={isCreatingInDB}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaDatabase className={isCreatingInDB ? 'animate-pulse' : ''} />
                      <span>{isCreatingInDB ? 'Deploying...' : 'Deploy'}</span>
                    </motion.button>
                  </motion.div>
                </div>

                {/* Code Preview with Syntax Highlighting Effect */}
                <motion.div 
                  className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-slate-300 text-sm font-medium">SQL Generator Terminal</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400 text-sm">
                      <FaFileCode />
                      <span>{activeTable}_procedures.sql</span>
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className="relative">
                    <motion.pre 
                      className="p-6 text-green-400 font-mono text-sm overflow-x-auto custom-scrollbar bg-slate-900 min-h-96"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.code
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 1 }}
                      >
                        {generatedSP}
                      </motion.code>
                    </motion.pre>
                    
                    {/* Animated Cursor */}
                    <motion.div
                      className="absolute bottom-6 left-6 w-2 h-5 bg-green-400"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent pointer-events-none"></div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      )}
      
      {/* Tooltips */}
      <Tooltip id="sp-type-tooltip" />
      <Tooltip id="copy-tooltip" />
      <Tooltip id="download-tooltip" />
      <Tooltip id="download-all-tooltip" />
      <Tooltip id="create-db-tooltip" />
    </React.Fragment>
  );
};

export default SPGenerator;
