import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCode, FaCopy, FaDownload, FaInfoCircle, FaPlay, FaPlus, FaMinus, 
  FaDatabase, FaFileDownload, FaSync, FaExpand, FaCompress, FaEye, FaEyeSlash,
  FaTerminal, FaCogs, FaFilter, FaSearch, FaCheck, FaTimes, FaRocket,
  FaChevronDown, FaChevronRight, FaCodeBranch, FaLayerGroup, FaFileCode, FaTrash,
  FaGem, FaChartBar, FaList, FaSearchPlus, FaNetworkWired,
  FaChartLine, FaFileInvoice, FaExchangeAlt, FaBackward, FaTable, FaLink,
  FaSpinner, FaExclamationTriangle, FaLightbulb, FaKey, FaColumns,
  FaEdit, FaSave, FaServer, FaQuestion, FaArrowRight, FaFileAlt,
  FaShieldAlt } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import useClipboardAndDownload from '../custom-hooks/useClipboardAndDownload';

const StoredProcedureGenerator = ({ metadata, activeTable, setActivePage }) => {
  // Create a workaround for setActivePage if it's not provided as a prop
  const navigateToPage = (page) => {
    if (typeof setActivePage === 'function') {
      setActivePage(page);
    } else {
      console.log('Navigation to page:', page);
      // Fallback: we can add history.push or other navigation here if needed
    }
  };
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('sql');
  const [showColumnSearch, setShowColumnSearch] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProcedureDetails, setShowProcedureDetails] = useState({});
  const [foreignKeyColumnsToInclude, setForeignKeyColumnsToInclude] = useState({});
  
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
  
  // Additional options
  const [dynamicSearchParams, setDynamicSearchParams] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [aggregateOptions, setAggregateOptions] = useState({
    groupByColumns: [],
    aggregateFunctions: []
  });
  
  const [selectedTemplateType, setSelectedTemplateType] = useState('basic');
  
  // UI enhancement states
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if the user has dismissed the tutorial before
    const tutorialDismissed = localStorage.getItem('sp-generator-tutorial-dismissed');
    return tutorialDismissed !== 'true';
  });
  const [showBestPractices, setShowBestPractices] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const { copyToClipboard, downloadAsFile } = useClipboardAndDownload();

  // Function to render the tutorial panel
  const renderTutorialPanel = () => {
    const tutorialSteps = [
      {
        title: "Welcome to Stored Procedure Generator",
        content: "This tool helps you quickly create SQL stored procedures based on your database schema. Follow this quick guide to get started.",
        icon: <FaRocket className="text-purple-500 text-2xl" />
      },
      {
        title: "1. Select Procedure Type",
        content: "Choose the type of stored procedure you want to generate: SELECT, INSERT, UPDATE, DELETE, or CRUD (all four operations).",
        icon: <FaLayerGroup className="text-blue-500 text-2xl" />
      },
      {
        title: "2. Configure Columns",
        content: "Select which columns to include in your procedure. You can filter and search through columns for large tables.",
        icon: <FaColumns className="text-green-500 text-2xl" />
      },
      {
        title: "3. Set Parameters",
        content: "Define the WHERE clause parameters for filtering data in SELECT, UPDATE, and DELETE procedures.",
        icon: <FaFilter className="text-yellow-500 text-2xl" />
      },
      {
        title: "4. Generate & Use",
        content: "Click 'Generate' to create your procedure. You can preview, copy to clipboard, download as a file, or execute directly in your database.",
        icon: <FaFileCode className="text-red-500 text-2xl" />
      }
    ];

    const currentStep = tutorialSteps[currentTutorialStep - 1] || tutorialSteps[0];

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100 shadow-sm"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <FaLightbulb className="mr-2 text-yellow-500" />
            SP Generator Tutorial
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                if (currentTutorialStep < tutorialSteps.length) {
                  setCurrentTutorialStep(currentTutorialStep + 1);
                } else {
                  setCurrentTutorialStep(1);
                }
              }}
              className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-2 rounded"
            >
              {currentTutorialStep < tutorialSteps.length ? "Next" : "Restart"}
            </button>
            <button
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('sp-generator-tutorial-dismissed', 'true');
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded"
              aria-label="Dismiss tutorial"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-sm">
            {currentStep.icon}
          </div>
          <div>
            <h4 className="font-medium text-indigo-700">{currentStep.title}</h4>
            <p className="text-sm text-indigo-600">{currentStep.content}</p>
          </div>
        </div>
        
        <div className="flex justify-center mt-3 space-x-1">
          {tutorialSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTutorialStep(idx + 1)}
              className={`w-2 h-2 rounded-full ${
                currentTutorialStep === idx + 1 ? 'bg-indigo-600' : 'bg-indigo-200'
              }`}
              aria-label={`Go to tutorial step ${idx + 1}`}
            ></button>
          ))}
        </div>
      </motion.div>
    );
  };

  // Function to render best practices panel
  const renderBestPracticesPanel = () => {
    const bestPractices = [
      {
        title: "Use Parameterized Procedures",
        description: "Always use parameters instead of string concatenation to prevent SQL injection attacks.",
        icon: <FaShieldAlt className="text-green-600" />
      },
      {
        title: "Proper Error Handling",
        description: "Include TRY/CATCH blocks to gracefully handle errors and provide meaningful messages.",
        icon: <FaExclamationTriangle className="text-yellow-600" />
      },
      {
        title: "Schema Qualify Objects",
        description: "Use schema names (e.g., dbo.TableName) to ensure the correct objects are referenced.",
        icon: <FaDatabase className="text-blue-600" />
      },
      {
        title: "Use SET NOCOUNT ON",
        description: "Include SET NOCOUNT ON to reduce network traffic by preventing row count messages.",
        icon: <FaNetworkWired className="text-purple-600" />
      },
      {
        title: "Consistent Naming Conventions",
        description: "Use consistent naming like 'sp_[TableName]_[Action]' for better organization.",
        icon: <FaFileCode className="text-orange-600" />
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-6 border border-yellow-100 shadow-sm"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
            <FaGem className="mr-2 text-yellow-500" />
            SQL Stored Procedure Best Practices
          </h3>
          <button
            onClick={() => setShowBestPractices(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded"
            aria-label="Close best practices"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bestPractices.map((practice, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-yellow-100 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {practice.icon}
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800">{practice.title}</h4>
                  <p className="text-sm text-yellow-700">{practice.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Function to render code metrics
  const renderCodeMetrics = () => {
    // Calculate metrics based on current SP configuration
    const metrics = {
      parameterCount: whereClauses.length,
      tableCount: activeTable ? 1 : 0,
      columnCount: includedColumns.length,
      complexity: calculateComplexity(),
      quality: calculateQuality(),
      performance: calculatePerformance(),
      readability: calculateReadability(),
    };

    // Helper function to render gauge
    const renderGauge = (value, label, colorClass) => (
      <div className="flex flex-col items-center">
        <div className="relative h-1 w-24 bg-gray-200 rounded-full">
          <div 
            className={`absolute top-0 left-0 h-1 rounded-full ${colorClass}`} 
            style={{ width: `${value}%` }}
          ></div>
        </div>
        <span className="text-xs font-medium mt-1 text-gray-700">{label}</span>
      </div>
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-4 mb-6 border border-sky-100 shadow-sm"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-sky-800 flex items-center">
            <FaChartLine className="mr-2 text-sky-500" />
            Code Metrics & Quality Indicators
          </h3>
          <button
            onClick={() => setShowMetrics(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded"
            aria-label="Close metrics"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
            <p className="text-xs text-sky-600">Parameters</p>
            <p className="text-xl font-semibold text-sky-800">{metrics.parameterCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
            <p className="text-xs text-sky-600">Columns</p>
            <p className="text-xl font-semibold text-sky-800">{metrics.columnCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
            <p className="text-xs text-sky-600">Tables</p>
            <p className="text-xl font-semibold text-sky-800">{metrics.tableCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
            <p className="text-xs text-sky-600">Complexity</p>
            <p className="text-xl font-semibold text-sky-800">{metrics.complexity}/10</p>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-sky-100 shadow-sm">
          <h4 className="text-sm font-medium text-sky-700 mb-2">Quality Indicators</h4>
          <div className="flex justify-between space-x-2">
            {renderGauge(metrics.quality, "Quality", "bg-green-500")}
            {renderGauge(metrics.performance, "Performance", "bg-blue-500")}
            {renderGauge(metrics.readability, "Readability", "bg-purple-500")}
          </div>
        </div>
      </motion.div>
    );
  };

  // Function to render stored procedure summary card
  const renderProcedureSummary = () => {
    // Get counts of various items
    const primaryKeyColumns = metadata[activeTable]?.PrimaryKeys || [];
    const foreignKeys = Object.keys(foreignKeyColumns || {});
    const totalColumns = metadata[activeTable]?.Columns?.length || 0;
    const includedColumnsCount = includedColumns.length;
    const whereClausesCount = whereClauses.length;
    
    // Determine procedure name based on selected type and table
    let procedureName = '';
    switch(spType) {
      case 'select':
        procedureName = `sp_${activeTable}_Get`;
        break;
      case 'insert':
        procedureName = `sp_${activeTable}_Insert`;
        break;
      case 'update':
        procedureName = `sp_${activeTable}_Update`;
        break;
      case 'delete':
        procedureName = `sp_${activeTable}_Delete`;
        break;
      case 'crud':
        procedureName = `sp_${activeTable}_CRUD`;
        break;
      default:
        procedureName = `sp_${activeTable}`;
    }
    
    // Get type-specific info
    const procedureTypeInfo = {
      select: { icon: <FaSearch className="text-teal-600" />, color: "bg-gradient-to-br from-teal-100 to-cyan-100" },
      insert: { icon: <FaPlus className="text-green-600" />, color: "bg-gradient-to-br from-green-100 to-teal-100" },
      update: { icon: <FaEdit className="text-blue-600" />, color: "bg-gradient-to-br from-blue-100 to-indigo-100" },
      delete: { icon: <FaTrash className="text-red-600" />, color: "bg-gradient-to-br from-red-100 to-pink-100" },
      crud: { icon: <FaLayerGroup className="text-purple-600" />, color: "bg-gradient-to-br from-purple-100 to-pink-100" },
    };
    
    const info = procedureTypeInfo[spType] || procedureTypeInfo.select;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg p-4 mb-6 shadow-sm border ${info.color}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-white shadow-sm">
              {info.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{procedureName}</h3>
              <p className="text-sm text-gray-600">
                Generating {spType.toUpperCase()} stored procedure for <span className="font-semibold">{activeTable}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <div className="px-2 py-1 bg-white rounded-full text-xs shadow-sm">
                  <span className="font-medium">{includedColumnsCount}</span> of <span className="font-medium">{totalColumns}</span> columns
                </div>
                <div className="px-2 py-1 bg-white rounded-full text-xs shadow-sm">
                  <span className="font-medium">{whereClausesCount}</span> parameters
                </div>
                <div className="px-2 py-1 bg-white rounded-full text-xs shadow-sm">
                  <span className="font-medium">{primaryKeyColumns.length}</span> primary keys
                </div>
                <div className="px-2 py-1 bg-white rounded-full text-xs shadow-sm">
                  <span className="font-medium">{foreignKeys.length}</span> foreign keys
                </div>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg shadow-sm font-medium text-sm flex items-center"
            onClick={() => {
              // Find the appropriate generate function based on template type
              setIsGenerating(true);
              let generateFunction;
              
              switch(selectedTemplateType) {
                case 'analytical':
                  generateFunction = generateAnalyticalStoredProcedure;
                  break;
                case 'dynamic-search':
                  generateFunction = generateDynamicSearchStoredProcedure;
                  break;
                case 'soft-delete':
                  generateFunction = generateSoftDeleteStoredProcedure;
                  break;
                default:
                  generateFunction = generateBasicStoredProcedure;
              }
              
              // Call the generate function
              setTimeout(() => {
                generateFunction();
                setIsGenerating(false);
                setShowPreview(true);
                toast.success('Stored procedure generated successfully!');
              }, 500); // Small delay for animation
            }}
          >
            {isGenerating ? (
              <>
                <FaSpinner className="mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FaPlay className="mr-2" /> Generate
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };
  
  // Helper functions for metrics calculations
  const calculateComplexity = () => {
    let complexity = 0;
    
    // Base complexity based on operation type
    if (spType === 'crud') complexity += 4;
    else if (spType === 'update' || spType === 'delete') complexity += 2;
    else complexity += 1;
    
    // Add complexity for where clauses
    complexity += Math.min(whereClauses.length, 3);
    
    // Add complexity for advanced options
    if (complexQueryOptions.useCTE) complexity += 1;
    if (complexQueryOptions.useSubqueries) complexity += 1;
    if (complexQueryOptions.useAggregates) complexity += 1;
    
    return Math.min(complexity, 10);
  };

  const calculateQuality = () => {
    // Quality is higher when proper parameters are used and error handling is included
    let quality = 60; // Base quality
    
    if (whereClauses.length > 0) quality += 10;
    if (spType === 'crud') quality += 10;
    if (includedColumns.length > 0) quality += 10;
    if (complexQueryOptions.useConditionalLogic) quality += 10;
    
    return Math.min(quality, 100);
  };

  const calculatePerformance = () => {
    // Performance is related to how optimized the query would be
    let performance = 70; // Base performance
    
    // More selective where clauses improve performance
    if (whereClauses.length > 0 && whereClauses.length <= 3) performance += 15;
    else if (whereClauses.length > 3) performance += 5;
    
    // Only selecting needed columns improves performance
    if (includedColumns.length < (metadata[activeTable]?.Columns?.length || 10)) performance += 15;
    
    return Math.min(performance, 100);
  };

  const calculateReadability = () => {
    // Readability is about how easy the code is to understand
    let readability = 65; // Base readability
    
    // Clear procedure type
    if (spType !== 'crud') readability += 15;
    
    // Not too many parameters
    if (whereClauses.length > 0 && whereClauses.length <= 4) readability += 10;
    else if (whereClauses.length > 4) readability -= 5;
    
    // Not using overly complex features
    if (!complexQueryOptions.useDynamicSQL) readability += 10;
    if (!complexQueryOptions.useSubqueries) readability += 5;
    
    return Math.min(readability, 100);
  };

  useEffect(() => {
    // Only try to access metadata if activeTable is defined
    if (activeTable && metadata && metadata[activeTable]) {
      // Make sure the Columns property exists
      if (!metadata[activeTable].Columns) {
        setError(`Column information for ${activeTable} is missing`);
        return;
      }
      
      const columns = metadata[activeTable].Columns.map(col => col.Name);
      setIncludedColumns(columns);
      
      // Reset states when table changes
      setGeneratedSP('');
      setWhereClauses([]);
      setForeignKeySelections({});
      setForeignKeyColumns({});
      setDynamicSearchParams([]);
      setAdvancedFilters([]);
      setAggregateOptions({
        groupByColumns: [],
        aggregateFunctions: []
      });
      
      // Set foreign key columns
      const foreignKeys = metadata[activeTable].ForeignKeys || [];
      const fkObj = {};
      const fkColumnsInclude = {};
      
      foreignKeys.forEach(fk => {
        if (fk && fk.ColumnName && fk.ReferencedTable && fk.ReferencedColumn) {
          fkObj[fk.ColumnName] = {
            referencedTable: fk.ReferencedTable,
            referencedColumn: fk.ReferencedColumn
          };
          
          // Initialize foreign key columns to include
          fkColumnsInclude[fk.ColumnName] = [];
          
          // Initialize selections for each foreign key column
          if (metadata[fk.ReferencedTable] && metadata[fk.ReferencedTable].Columns) {
            const relatedTableColumns = metadata[fk.ReferencedTable].Columns.map(col => ({
              name: col.Name,
              selected: false
            }));
            
            setForeignKeySelections(prev => ({
              ...prev,
              [fk.ColumnName]: relatedTableColumns
            }));
          }
        }
      });
      
      setForeignKeyColumns(fkObj);
      setForeignKeyColumnsToInclude(fkColumnsInclude);
    }
  }, [activeTable, metadata]);

  const handleSpTypeChange = (type) => {
    setSpType(type);
    setGeneratedSP('');
  };

  const handleColumnToggle = (columnName) => {
    if (includedColumns.includes(columnName)) {
      setIncludedColumns(includedColumns.filter(col => col !== columnName));
    } else {
      setIncludedColumns([...includedColumns, columnName]);
    }
  };

  const handleSelectAll = () => {
    if (metadata[activeTable]) {
      const allColumns = metadata[activeTable].Columns.map(col => col.Name);
      setIncludedColumns(allColumns);
    }
  };

  const handleSelectNone = () => {
    setIncludedColumns([]);
  };

  const handleAddWhereClause = () => {
    setWhereClauses([...whereClauses, { column: '', operator: '=', value: '' }]);
  };

  const handleRemoveWhereClause = (index) => {
    const newWhereClauses = [...whereClauses];
    newWhereClauses.splice(index, 1);
    setWhereClauses(newWhereClauses);
  };

  const handleWhereClauseChange = (index, field, value) => {
    const newWhereClauses = [...whereClauses];
    newWhereClauses[index][field] = value;
    setWhereClauses(newWhereClauses);
  };

  const handleForeignKeySelection = (columnName, value) => {
    setForeignKeySelections({
      ...foreignKeySelections,
      [columnName]: value
    });
  };
  
  // Handle foreign key column selection for including in queries
  const handleForeignKeyColumnSelection = (fkColumn, relatedColumn, isSelected) => {
    setForeignKeySelections(prev => {
      const updatedSelections = {...prev};
      
      if (updatedSelections[fkColumn]) {
        updatedSelections[fkColumn] = updatedSelections[fkColumn].map(col => {
          if (col.name === relatedColumn) {
            return {...col, selected: isSelected};
          }
          return col;
        });
      }
      
      return updatedSelections;
    });
    
    // Update the list of columns to include in queries
    setForeignKeyColumnsToInclude(prev => {
      const updated = {...prev};
      
      if (isSelected) {
        // Add column if selected
        if (!updated[fkColumn].includes(relatedColumn)) {
          updated[fkColumn] = [...updated[fkColumn], relatedColumn];
        }
      } else {
        // Remove column if deselected
        updated[fkColumn] = updated[fkColumn].filter(col => col !== relatedColumn);
      }
      
      return updated;
    });
  };

  const handleAddDynamicSearchParam = () => {
    if (metadata[activeTable]) {
      const columns = metadata[activeTable].Columns;
      if (columns.length > 0) {
        setDynamicSearchParams([...dynamicSearchParams, {
          column: columns[0].Name,
          isOptional: true,
          operator: '=',
          defaultValue: null
        }]);
      }
    }
  };

  const handleRemoveDynamicSearchParam = (index) => {
    const newParams = [...dynamicSearchParams];
    newParams.splice(index, 1);
    setDynamicSearchParams(newParams);
  };

  const handleDynamicSearchParamChange = (index, field, value) => {
    const newParams = [...dynamicSearchParams];
    newParams[index][field] = value;
    setDynamicSearchParams(newParams);
  };

  const handleAddAggregateFunction = () => {
    setAggregateOptions({
      ...aggregateOptions,
      aggregateFunctions: [
        ...aggregateOptions.aggregateFunctions,
        { function: 'COUNT', column: '*', alias: 'RecordCount' }
      ]
    });
  };

  const handleRemoveAggregateFunction = (index) => {
    const newFunctions = [...aggregateOptions.aggregateFunctions];
    newFunctions.splice(index, 1);
    setAggregateOptions({
      ...aggregateOptions,
      aggregateFunctions: newFunctions
    });
  };

  const handleAggregateFunctionChange = (index, field, value) => {
    const newFunctions = [...aggregateOptions.aggregateFunctions];
    newFunctions[index][field] = value;
    setAggregateOptions({
      ...aggregateOptions,
      aggregateFunctions: newFunctions
    });
  };

  const handleToggleGroupByColumn = (columnName) => {
    const groupByColumns = [...aggregateOptions.groupByColumns];
    if (groupByColumns.includes(columnName)) {
      setAggregateOptions({
        ...aggregateOptions,
        groupByColumns: groupByColumns.filter(col => col !== columnName)
      });
    } else {
      setAggregateOptions({
        ...aggregateOptions,
        groupByColumns: [...groupByColumns, columnName]
      });
    }
  };

  const handleTemplateTypeChange = (templateType) => {
    setSelectedTemplateType(templateType);
    setGeneratedSP('');
    
    // Reset complex options based on template type
    if (templateType === 'basic') {
      setComplexQueryOptions({
        useAggregates: false,
        usePagination: false,
        useSubqueries: false,
        useCTE: false,
        useConditionalLogic: false,
        useDynamicSQL: false,
        useMultipleResultSets: false
      });
      setDynamicSearchParams([]);
      setAdvancedFilters([]);
      setAggregateOptions({
        groupByColumns: [],
        aggregateFunctions: []
      });
    } else if (templateType === 'analytical') {
      setComplexQueryOptions({
        ...complexQueryOptions,
        useAggregates: true,
        useCTE: true
      });
      
      // Set some default analytical options
      if (aggregateOptions.aggregateFunctions.length === 0) {
        setAggregateOptions({
          groupByColumns: [],
          aggregateFunctions: [
            { function: 'COUNT', column: '*', alias: 'RecordCount' }
          ]
        });
      }
    } else if (templateType === 'dynamic-search') {
      setComplexQueryOptions({
        ...complexQueryOptions,
        useDynamicSQL: true,
        useConditionalLogic: true
      });
      
      // Add default dynamic search param if none exists
      if (dynamicSearchParams.length === 0 && metadata[activeTable]) {
        const columns = metadata[activeTable].Columns;
        if (columns.length > 0) {
          setDynamicSearchParams([{
            column: columns[0].Name,
            isOptional: true,
            operator: '=',
            defaultValue: null
          }]);
        }
      }
    } else if (templateType === 'soft-delete') {
      // For soft-delete, we need specific options
      setSpType('update');
    }
  };

  const generateBasicStoredProcedure = () => {
    if (!activeTable) {
      setError('No table selected');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      
      const tableInfo = metadata[activeTable];
      
      // Check if table info exists and has required properties
      if (!tableInfo) {
        setError(`Table information for ${activeTable} is undefined`);
        setIsGenerating(false);
        return;
      }
      
      const primaryKeys = tableInfo.PrimaryKeys || [];
      
      let procedureName = '';
      let parameters = [];
      let sql = '';
      
      // Prepare columns
      const selectedColumns = includedColumns.length > 0 
        ? includedColumns 
        : tableInfo.Columns.map(col => col.Name);
        
      switch(spType) {
        case 'select':
          procedureName = `sp_Get${activeTable}`;
          
          // Add parameters for primary keys if where clauses are empty
          if (whereClauses.length === 0 && primaryKeys.length > 0) {
            primaryKeys.forEach(pk => {
              const column = tableInfo.Columns.find(col => col.Name === pk);
              if (column) {
                parameters.push(`@${pk} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
              }
            });
          } else {
            // Add parameters for where clauses
            whereClauses.forEach(clause => {
              const column = tableInfo.Columns.find(col => col.Name === clause.column);
              if (column) {
                parameters.push(`@${clause.column} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
              }
            });
          }
          
          // Generate SQL
          sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT ${selectedColumns.map(col => `[${activeTable}].[${col}]`).join(',\n           ')}`;

          // Add foreign key columns if selected
          const fkJoins = [];
          let hasForeignKeyColumns = false;

          if (foreignKeyColumnsToInclude && typeof foreignKeyColumnsToInclude === 'object') {
            Object.entries(foreignKeyColumnsToInclude).forEach(([fkColumn, selectedFkColumns]) => {
              if (selectedFkColumns && selectedFkColumns.length > 0 && 
                  foreignKeyColumns && foreignKeyColumns[fkColumn]) {
                
                const fkInfo = foreignKeyColumns[fkColumn];
                if (fkInfo && fkInfo.referencedTable && fkInfo.referencedColumn) {
                  hasForeignKeyColumns = true;
                  const referencedTable = fkInfo.referencedTable;
                  const referencedColumn = fkInfo.referencedColumn;
                  
                  // Add selected columns from foreign key table
                  sql += `,\n           ${selectedFkColumns.map(col => 
                    `[${referencedTable}].[${col}] AS [${referencedTable}_${col}]`).join(',\n           ')}`;
                  
                  // Add join statement
                  fkJoins.push(`LEFT JOIN [dbo].[${referencedTable}] ON [${activeTable}].[${fkColumn}] = [${referencedTable}].[${referencedColumn}]`);
                }
              }
            });
          }
          
          sql += `\n    FROM [dbo].[${activeTable}]`;
          
          // Add joins if we have any foreign key columns
          if (fkJoins.length > 0) {
            sql += `\n    ${fkJoins.join('\n    ')}`;
          }
          
          // Add WHERE clause
          if (whereClauses.length > 0) {
            sql += `\n    WHERE ${whereClauses.map(clause => `${clause.column} ${clause.operator} @${clause.column}`).join('\n      AND ')}`;
          } else if (primaryKeys.length > 0) {
            sql += `\n    WHERE ${primaryKeys.map(pk => `${pk} = @${pk}`).join('\n      AND ')}`;
          }
          
          sql += `\nEND`;
          break;
          
        case 'insert':
          procedureName = `sp_Insert${activeTable}`;
          
          // Add parameters for all selected columns except identity columns
          selectedColumns.forEach(colName => {
            const column = tableInfo.Columns.find(col => col.Name === colName);
            if (column) {
              parameters.push(`@${colName} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
            }
          });
          
          // Generate SQL
          sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[${activeTable}] (
        ${selectedColumns.join(',\n        ')}
    ) VALUES (
        ${selectedColumns.map(col => `@${col}`).join(',\n        ')}
    )
    
    -- Return the new record ID if there's a primary key
${primaryKeys.length > 0 ? `    SELECT ${primaryKeys.join(', ')} FROM [dbo].[${activeTable}] WHERE ${primaryKeys.map(pk => `${pk} = SCOPE_IDENTITY()`).join(' AND ')}` : ''}
END`;
          break;
          
        case 'update':
          procedureName = `sp_Update${activeTable}`;
          
          // Add parameters for all selected columns
          selectedColumns.forEach(colName => {
            const column = tableInfo.Columns.find(col => col.Name === colName);
            if (column) {
              parameters.push(`@${colName} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
            }
          });
          
          // Generate SQL
          sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[${activeTable}]
    SET ${selectedColumns.filter(col => !primaryKeys.includes(col)).map(col => `${col} = @${col}`).join(',\n        ')}
    WHERE ${primaryKeys.length > 0 ? primaryKeys.map(pk => `${pk} = @${pk}`).join(' AND ') : '1=1 -- WARNING: No primary key defined, will update all rows!'}
END`;
          break;
          
        case 'delete':
          procedureName = `sp_Delete${activeTable}`;
          
          // Add parameters for primary keys
          primaryKeys.forEach(pk => {
            const column = tableInfo.Columns.find(col => col.Name === pk);
            if (column) {
              parameters.push(`@${pk} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
            }
          });
          
          // Generate SQL
          sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM [dbo].[${activeTable}]
    WHERE ${primaryKeys.length > 0 ? primaryKeys.map(pk => `${pk} = @${pk}`).join(' AND ') : '1=1 -- WARNING: No primary key defined, will delete all rows!'}
END`;
          break;
          
        default:
          setError('Unsupported SP type');
          return;
      }
      
      setGeneratedSP(sql);
      setIsGenerating(false);
    } catch (err) {
      setError(`Error generating stored procedure: ${err.message}`);
      setIsGenerating(false);
    }
  };

  const generateAnalyticalStoredProcedure = () => {
    if (!activeTable) {
      setError('No table selected');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      
      const tableInfo = metadata[activeTable];
      
      // Check if table info exists and has required properties
      if (!tableInfo) {
        setError(`Table information for ${activeTable} is undefined`);
        setIsGenerating(false);
        return;
      }
      
      const primaryKeys = tableInfo.PrimaryKeys || [];
      
      const procedureName = `sp_Analyze${activeTable}`;
      let parameters = [];
      let sql = '';
      
      // Prepare columns for grouping
      const groupByColumns = aggregateOptions.groupByColumns.length > 0 
        ? aggregateOptions.groupByColumns 
        : [];
        
      // Prepare aggregate functions
      const aggregateFunctions = aggregateOptions.aggregateFunctions.length > 0
        ? aggregateOptions.aggregateFunctions
        : [{ function: 'COUNT', column: '*', alias: 'RecordCount' }];
      
      // Add parameters for filters
      whereClauses.forEach(clause => {
        const column = tableInfo.Columns.find(col => col.Name === clause.column);
        if (column) {
          parameters.push(`@${clause.column} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
        }
      });
      
      // Add pagination parameters if needed
      if (complexQueryOptions.usePagination) {
        parameters.push(`@PageNumber INT = 1`);
        parameters.push(`@PageSize INT = 100`);
      }
      
      // Generate SQL
      sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    `;
      
      // Add CTEs if needed
      if (complexQueryOptions.useCTE) {
        sql += `
    -- Common Table Expression for filtered data
    WITH FilteredData AS (
        SELECT ${groupByColumns.join(', ')}${groupByColumns.length > 0 ? ',' : ''} 
               ${aggregateFunctions.map(agg => `${agg.function}(${agg.column}) AS ${agg.alias}`).join(',\n               ')}
        FROM [dbo].[${activeTable}]
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.map(clause => `${clause.column} ${clause.operator} @${clause.column}`).join('\n          AND ')}` : ''}
        ${groupByColumns.length > 0 ? `GROUP BY ${groupByColumns.join(', ')}` : ''}
    )`;
      }
      
      // Add main query
      if (complexQueryOptions.useCTE) {
        sql += `
    
    -- Main query with pagination
    ${complexQueryOptions.usePagination ? `SELECT ${groupByColumns.join(', ')}${groupByColumns.length > 0 ? ',' : ''} 
           ${aggregateFunctions.map(agg => agg.alias).join(',\n           ')},
           COUNT(*) OVER() AS TotalRecords
    FROM FilteredData
    ORDER BY ${groupByColumns.length > 0 ? groupByColumns[0] : '1'}
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY` : 
    `SELECT * FROM FilteredData`}`;
      } else {
        sql += `
    
    -- Direct query with aggregations
    SELECT ${groupByColumns.join(', ')}${groupByColumns.length > 0 ? ',' : ''} 
           ${aggregateFunctions.map(agg => `${agg.function}(${agg.column}) AS ${agg.alias}`).join(',\n           ')}
           ${complexQueryOptions.usePagination ? ', COUNT(*) OVER() AS TotalRecords' : ''}
    FROM [dbo].[${activeTable}]
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.map(clause => `${clause.column} ${clause.operator} @${clause.column}`).join('\n          AND ')}` : ''}
    ${groupByColumns.length > 0 ? `GROUP BY ${groupByColumns.join(', ')}` : ''}
    ${complexQueryOptions.usePagination ? `ORDER BY ${groupByColumns.length > 0 ? groupByColumns[0] : '1'}
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY` : ''}`;
      }
      
      // Close the procedure
      sql += `
END`;
      
      setGeneratedSP(sql);
      setIsGenerating(false);
    } catch (err) {
      setError(`Error generating analytical stored procedure: ${err.message}`);
      setIsGenerating(false);
    }
  };

  const generateDynamicSearchStoredProcedure = () => {
    if (!activeTable) {
      setError('No table selected');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      
      const tableInfo = metadata[activeTable];
      
      // Check if table info exists and has required properties
      if (!tableInfo) {
        setError(`Table information for ${activeTable} is undefined`);
        setIsGenerating(false);
        return;
      }
      
      const procedureName = `sp_Search${activeTable}`;
      let parameters = [];
      
      // Add parameters for dynamic search
      dynamicSearchParams.forEach(param => {
        const column = tableInfo.Columns.find(col => col.Name === param.column);
        if (column) {
          parameters.push(`@${param.column} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''} = NULL`);
        }
      });
      
      // Add pagination parameters
      parameters.push(`@PageNumber INT = 1`);
      parameters.push(`@PageSize INT = 100`);
      parameters.push(`@SortColumn NVARCHAR(128) = NULL`);
      parameters.push(`@SortDirection NVARCHAR(4) = 'ASC'`);
      
      // Generate SQL
      let sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Build dynamic SQL
    DECLARE @SQL NVARCHAR(MAX)
    DECLARE @Params NVARCHAR(MAX)
    DECLARE @WhereClause NVARCHAR(MAX) = ''
    
    -- Build base query
    SET @SQL = 'SELECT *,
                COUNT(*) OVER() AS TotalRecords
                FROM [dbo].[${activeTable}] WHERE 1=1'
    
    -- Add dynamic conditions
`;

      // Add dynamic where clauses
      dynamicSearchParams.forEach(param => {
        sql += `    -- Add ${param.column} filter condition
    IF @${param.column} IS NOT NULL
    BEGIN
        SET @SQL = @SQL + ' AND ${param.column} ${param.operator} @${param.column}'
    END
    
`;
      });

      // Add sorting and pagination
      sql += `    -- Add dynamic sorting
    IF @SortColumn IS NOT NULL
    BEGIN
        SET @SQL = @SQL + ' ORDER BY ' + @SortColumn + ' ' + @SortDirection
    END
    ELSE
    BEGIN
        SET @SQL = @SQL + ' ORDER BY ${(tableInfo.PrimaryKeys && tableInfo.PrimaryKeys.length > 0) ? tableInfo.PrimaryKeys[0] : '1'}'
    END
    
    -- Add pagination
    SET @SQL = @SQL + ' OFFSET (@PageNumber - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY'
    
    -- Define parameters
    SET @Params = '`;

      // Define parameters for sp_executesql
      sql += parameters.map(p => {
        const parts = p.split(' ');
        return `${parts[0]} ${parts[1]}${parts.length > 2 ? ' ' + parts.slice(2).join(' ').replace('= NULL', ''): ''}`.trim();
      }).join(', ');

      // Finish the procedure
      sql += `'
    
    -- Execute the dynamic SQL
    EXEC sp_executesql @SQL, @Params, ${parameters.map(p => {
      const paramName = p.split(' ')[0];
      return `${paramName} = ${paramName}`;
    }).join(', ')}
END`;
      
      setGeneratedSP(sql);
      setIsGenerating(false);
    } catch (err) {
      setError(`Error generating dynamic search stored procedure: ${err.message}`);
      setIsGenerating(false);
    }
  };

  const generateSoftDeleteStoredProcedure = () => {
    if (!activeTable) {
      setError('No table selected');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      
      const tableInfo = metadata[activeTable];
      
      // Check if table info exists and has required properties
      if (!tableInfo) {
        setError(`Table information for ${activeTable} is undefined`);
        setIsGenerating(false);
        return;
      }
      
      const primaryKeys = tableInfo.PrimaryKeys || [];
      
      if (primaryKeys.length === 0) {
        setError('Soft delete requires a primary key');
        setIsGenerating(false);
        return;
      }
      
      const procedureName = `sp_SoftDelete${activeTable}`;
      let parameters = [];
      
      // Add parameters for primary keys
      primaryKeys.forEach(pk => {
        const column = tableInfo.Columns.find(col => col.Name === pk);
        if (column) {
          parameters.push(`@${pk} ${column.Type}${column.MaxLength ? `(${column.MaxLength})` : ''}`);
        }
      });
      
      // Add deletion parameter
      parameters.push(`@DeletedBy NVARCHAR(128) = NULL`);
      
      // Generate SQL
      let sql = `CREATE PROCEDURE [dbo].[${procedureName}]
${parameters.length > 0 ? parameters.map(p => `    ${p}`).join(',\n') : ''}
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Soft delete by updating IsDeleted flag and adding deletion metadata
    UPDATE [dbo].[${activeTable}]
    SET IsDeleted = 1,
        DeletedDate = GETUTCDATE(),
        DeletedBy = @DeletedBy
    WHERE ${primaryKeys.map(pk => `${pk} = @${pk}`).join(' AND ')}
    
    -- Return success/failure status
    IF @@ROWCOUNT > 0
        SELECT 1 AS Success, 'Record marked as deleted' AS Message
    ELSE
        SELECT 0 AS Success, 'Record not found' AS Message
END`;
      
      // Add a comment about schema requirements
      sql = `/*
Note: This stored procedure assumes your table has the following columns:
- IsDeleted (BIT) - Flag indicating if the record is deleted
- DeletedDate (DATETIME) - When the record was deleted
- DeletedBy (NVARCHAR) - Who deleted the record

If these columns don't exist, you'll need to add them with a schema modification:

ALTER TABLE [dbo].[${activeTable}]
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedDate DATETIME NULL,
    DeletedBy NVARCHAR(128) NULL
*/

${sql}`;
      
      setGeneratedSP(sql);
      setIsGenerating(false);
    } catch (err) {
      setError(`Error generating soft delete stored procedure: ${err.message}`);
      setIsGenerating(false);
    }
  };

  const generateStoredProcedure = () => {
    switch (selectedTemplateType) {
      case 'basic':
        generateBasicStoredProcedure();
        break;
      case 'analytical':
        generateAnalyticalStoredProcedure();
        break;
      case 'dynamic-search':
        generateDynamicSearchStoredProcedure();
        break;
      case 'soft-delete':
        generateSoftDeleteStoredProcedure();
        break;
      default:
        generateBasicStoredProcedure();
    }
  };

  const handleCopyToClipboard = () => {
    copyToClipboard(generatedSP, 'Stored procedure copied to clipboard!');
  };

  const handleDownload = () => {
    if (!activeTable) return;
    
    let fileName = '';
    switch (selectedTemplateType) {
      case 'basic':
        fileName = `sp_${spType}_${activeTable}.sql`;
        break;
      case 'analytical':
        fileName = `sp_Analyze_${activeTable}.sql`;
        break;
      case 'dynamic-search':
        fileName = `sp_Search_${activeTable}.sql`;
        break;
      case 'soft-delete':
        fileName = `sp_SoftDelete_${activeTable}.sql`;
        break;
      default:
        fileName = `sp_${activeTable}.sql`;
    }
    
    downloadAsFile(generatedSP, fileName, 'text/plain');
  };

  if (!activeTable) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <FaCode className="mx-auto text-5xl text-teal-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Select a Table</h2>
          <p className="text-gray-500">
            Choose a table from the sidebar to generate stored procedures for it
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-teal-600 to-cyan-600 opacity-90"></div>
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-gradient-to-br from-white/5 to-white/2 rounded-full filter blur-3xl opacity-30"></div>
        <div className="relative z-10 p-6 border-b border-gray-200 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-5">
              <motion.div 
                className="flex items-center justify-center w-14 h-14 bg-indigo-600/30 backdrop-blur-sm rounded-2xl border border-indigo-400/20 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <FaFileCode className="text-3xl text-white" />
                  <motion.div 
                    className="absolute -right-2 -top-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center mb-1">
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                      Stored Procedure Generator
                    </span>
                  </h1>
                  <div className="relative ml-3">
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                    <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                  </div>
                </div>
                <p className="text-blue-100 font-light">
                  {activeTable ? 
                    `Generate customizable stored procedures for ${activeTable} table` : 
                    'Select a table to begin generating stored procedures'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setShowTutorial(prev => !prev)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/30 backdrop-blur-sm rounded-xl border border-indigo-400/20 text-white hover:bg-indigo-500/40 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                data-tooltip-id="spg-tooltip"
                data-tooltip-content="Show/Hide Tutorial"
              >
                <FaLightbulb className="text-yellow-300" />
                <span className="text-sm font-medium">Tutorial</span>
              </motion.button>

              <motion.button
                onClick={() => setShowBestPractices(prev => !prev)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/30 backdrop-blur-sm rounded-xl border border-indigo-400/20 text-white hover:bg-indigo-500/40 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                data-tooltip-id="spg-tooltip"
                data-tooltip-content="SQL Best Practices"
              >
                <FaGem className="text-yellow-300" />
                <span className="text-sm font-medium">Best Practices</span>
              </motion.button>

              <motion.button
                onClick={() => setShowMetrics(prev => !prev)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/30 backdrop-blur-sm rounded-xl border border-indigo-400/20 text-white hover:bg-indigo-500/40 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                data-tooltip-id="spg-tooltip"
                data-tooltip-content="Show Code Metrics"
              >
                <FaChartLine className="text-white" />
                <span className="text-sm font-medium">Metrics</span>
              </motion.button>

              <motion.button
                onClick={() => navigateToPage('database-explorer')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl border border-blue-400/30 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                data-tooltip-id="spg-tooltip"
                data-tooltip-content="Back to Database Explorer"
              >
                <FaBackward className="text-blue-200" />
                <span className="font-medium">Back</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Tutorial panel */}
        <AnimatePresence>
          {showTutorial && renderTutorialPanel()}
        </AnimatePresence>
        
        {/* Best practices panel */}
        <AnimatePresence>
          {showBestPractices && renderBestPracticesPanel()}
        </AnimatePresence>
        
        {/* Code metrics panel */}
        <AnimatePresence>
          {showMetrics && renderCodeMetrics()}
        </AnimatePresence>
        
        {/* Procedure summary card - always visible */}
        {activeTable && renderProcedureSummary()}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Configuration */}
          <div className="md:col-span-1 space-y-6">
            {/* Template Selection */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                <h2 className="font-semibold text-teal-800">Template Type</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    className={`p-4 rounded-lg border-2 flex items-center ${
                      selectedTemplateType === 'basic' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50/30'
                    }`}
                    onClick={() => handleTemplateTypeChange('basic')}
                  >
                    <FaCode className={`text-xl mr-3 ${selectedTemplateType === 'basic' ? 'text-teal-500' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <h3 className={`font-medium ${selectedTemplateType === 'basic' ? 'text-teal-700' : 'text-gray-700'}`}>Basic CRUD</h3>
                      <p className="text-xs text-gray-500">Simple Select, Insert, Update, Delete</p>
                    </div>
                  </button>
                  
                  <button
                    className={`p-4 rounded-lg border-2 flex items-center ${
                      selectedTemplateType === 'analytical' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                    onClick={() => handleTemplateTypeChange('analytical')}
                  >
                    <FaChartBar className={`text-xl mr-3 ${selectedTemplateType === 'analytical' ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <h3 className={`font-medium ${selectedTemplateType === 'analytical' ? 'text-indigo-700' : 'text-gray-700'}`}>Analytical Query</h3>
                      <p className="text-xs text-gray-500">Aggregations, Group By, CTEs</p>
                    </div>
                  </button>
                  
                  <button
                    className={`p-4 rounded-lg border-2 flex items-center ${
                      selectedTemplateType === 'dynamic-search' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                    onClick={() => handleTemplateTypeChange('dynamic-search')}
                  >
                    <FaSearch className={`text-xl mr-3 ${selectedTemplateType === 'dynamic-search' ? 'text-purple-500' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <h3 className={`font-medium ${selectedTemplateType === 'dynamic-search' ? 'text-purple-700' : 'text-gray-700'}`}>Dynamic Search</h3>
                      <p className="text-xs text-gray-500">Optional parameters, Dynamic SQL</p>
                    </div>
                  </button>
                  
                  <button
                    className={`p-4 rounded-lg border-2 flex items-center ${
                      selectedTemplateType === 'soft-delete' 
                        ? 'border-rose-500 bg-rose-50' 
                        : 'border-gray-200 hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                    onClick={() => handleTemplateTypeChange('soft-delete')}
                  >
                    <FaBackward className={`text-xl mr-3 ${selectedTemplateType === 'soft-delete' ? 'text-rose-500' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <h3 className={`font-medium ${selectedTemplateType === 'soft-delete' ? 'text-rose-700' : 'text-gray-700'}`}>Soft Delete</h3>
                      <p className="text-xs text-gray-500">Logical deletion with metadata</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Basic Configuration - Only shown for basic template */}
            {selectedTemplateType === 'basic' && (
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 border-b border-teal-100 rounded-t-xl">
                  <h2 className="font-semibold text-white flex items-center">
                    <FaCode className="mr-2" /> Procedure Type
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center ${
                        spType === 'select' 
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg' 
                          : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow hover:border-teal-300'
                      }`}
                      onClick={() => handleSpTypeChange('select')}
                    >
                      <FaSearch className={`text-xl mb-1 ${spType === 'select' ? 'text-white' : 'text-teal-500'}`} />
                      Select
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center ${
                        spType === 'insert' 
                          ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg' 
                          : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow hover:border-green-300'
                      }`}
                      onClick={() => handleSpTypeChange('insert')}
                    >
                      <FaPlus className={`text-xl mb-1 ${spType === 'insert' ? 'text-white' : 'text-green-500'}`} />
                      Insert
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center ${
                        spType === 'update' 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                          : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow hover:border-blue-300'
                      }`}
                      onClick={() => handleSpTypeChange('update')}
                    >
                      <FaEdit className={`text-xl mb-1 ${spType === 'update' ? 'text-white' : 'text-blue-500'}`} />
                      Update
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center ${
                        spType === 'delete' 
                          ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg' 
                          : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow hover:border-red-300'
                      }`}
                      onClick={() => handleSpTypeChange('delete')}
                    >
                      <FaTrash className={`text-xl mb-1 ${spType === 'delete' ? 'text-white' : 'text-red-500'}`} />
                      Delete
                    </motion.button>
                    
                    {/* Add CRUD option */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center col-span-2 md:col-span-4 mt-2 ${
                        spType === 'crud' 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg' 
                          : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow hover:border-purple-300'
                      }`}
                      onClick={() => handleSpTypeChange('crud')}
                    >
                      <FaLayerGroup className={`text-xl mb-1 ${spType === 'crud' ? 'text-white' : 'text-purple-500'}`} />
                      Generate All CRUD Procedures
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Template-specific options */}
            {selectedTemplateType === 'analytical' && (
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                  <h2 className="font-semibold text-indigo-800">Analytical Options</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Aggregation Functions</h3>
                    {aggregateOptions.aggregateFunctions.map((func, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <select
                          className="rounded border-gray-300 text-sm"
                          value={func.function}
                          onChange={(e) => handleAggregateFunctionChange(index, 'function', e.target.value)}
                        >
                          <option value="COUNT">COUNT</option>
                          <option value="SUM">SUM</option>
                          <option value="AVG">AVG</option>
                          <option value="MIN">MIN</option>
                          <option value="MAX">MAX</option>
                        </select>
                        <select
                          className="rounded border-gray-300 text-sm"
                          value={func.column}
                          onChange={(e) => handleAggregateFunctionChange(index, 'column', e.target.value)}
                        >
                          <option value="*">*</option>
                          {metadata[activeTable].Columns.map(col => (
                            <option key={col.Name} value={col.Name}>{col.Name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="rounded border-gray-300 text-sm"
                          placeholder="Alias"
                          value={func.alias}
                          onChange={(e) => handleAggregateFunctionChange(index, 'alias', e.target.value)}
                        />
                        <button
                          className="p-1 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveAggregateFunction(index)}
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-sm hover:bg-indigo-100 flex items-center"
                      onClick={handleAddAggregateFunction}
                    >
                      <FaPlus className="mr-1" size={12} /> Add Function
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Group By Columns</h3>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {metadata[activeTable].Columns.map(col => (
                        <label key={col.Name} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={aggregateOptions.groupByColumns.includes(col.Name)}
                            onChange={() => handleToggleGroupByColumn(col.Name)}
                          />
                          <span className="ml-2 text-sm text-gray-700">{col.Name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Options</h3>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                        checked={complexQueryOptions.usePagination}
                        onChange={() => setComplexQueryOptions({
                          ...complexQueryOptions,
                          usePagination: !complexQueryOptions.usePagination
                        })}
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Pagination</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                        checked={complexQueryOptions.useCTE}
                        onChange={() => setComplexQueryOptions({
                          ...complexQueryOptions,
                          useCTE: !complexQueryOptions.useCTE
                        })}
                      />
                      <span className="ml-2 text-sm text-gray-700">Use Common Table Expression (CTE)</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Foreign Key Column Selection */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                <h2 className="font-semibold text-teal-800 flex items-center">
                  <FaLink className="mr-2 text-teal-600" />
                  Foreign Key Columns
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {Object.keys(foreignKeyColumns).length > 0 ? (
                  <div className="space-y-5">
                    {Object.entries(foreignKeyColumns).map(([fkColumn, details]) => (
                      <div key={fkColumn} className="border rounded-md p-3 bg-gray-50">
                        <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                          <FaTable className="text-teal-500 mr-2" size={14} />
                          {fkColumn} → {details.referencedTable}.{details.referencedColumn}
                        </h3>
                        
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Include columns from {details.referencedTable}:
                          </label>
                          
                          <div className="max-h-40 overflow-y-auto bg-white border rounded-md p-2">
                            {foreignKeySelections[fkColumn] && foreignKeySelections[fkColumn].map(col => (
                              <label key={col.name} className="flex items-center mb-1">
                                <input
                                  type="checkbox"
                                  className="rounded text-teal-600 focus:ring-teal-500"
                                  checked={col.selected}
                                  onChange={(e) => handleForeignKeyColumnSelection(fkColumn, col.name, e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{col.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No foreign keys found in this table</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            {selectedTemplateType === 'dynamic-search' && (
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                  <h2 className="font-semibold text-purple-800">Dynamic Search Parameters</h2>
                </div>
                <div className="p-6 space-y-4">
                  {dynamicSearchParams.map((param, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Parameter #{index + 1}</h3>
                        <button
                          className="p-1 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveDynamicSearchParam(index)}
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Column</label>
                            <select
                              className="w-full rounded border-gray-300 text-sm"
                              value={param.column}
                              onChange={(e) => handleDynamicSearchParamChange(index, 'column', e.target.value)}
                            >
                              {metadata[activeTable].Columns.map(col => (
                                <option key={col.Name} value={col.Name}>{col.Name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Operator</label>
                            <select
                              className="w-full rounded border-gray-300 text-sm"
                              value={param.operator}
                              onChange={(e) => handleDynamicSearchParamChange(index, 'operator', e.target.value)}
                            >
                              <option value="=">Equals (=)</option>
                              <option value="&lt;&gt;">Not Equals (&lt;&gt;)</option>
                              <option value="&gt;">Greater Than (&gt;)</option>
                              <option value="&lt;">Less Than (&lt;)</option>
                              <option value="&gt;=">Greater/Equal (&gt;=)</option>
                              <option value="&lt;=">Less/Equal (&lt;=)</option>
                              <option value="LIKE">LIKE</option>
                              <option value="NOT LIKE">NOT LIKE</option>
                              <option value="IN">IN</option>
                              <option value="NOT IN">NOT IN</option>
                            </select>
                          </div>
                        </div>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded text-purple-600 focus:ring-purple-500"
                            checked={param.isOptional}
                            onChange={(e) => handleDynamicSearchParamChange(index, 'isOptional', e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-700">Optional Parameter</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    className="w-full px-3 py-2 bg-purple-50 text-purple-600 rounded-md text-sm hover:bg-purple-100 flex items-center justify-center"
                    onClick={handleAddDynamicSearchParam}
                  >
                    <FaPlus className="mr-1" size={12} /> Add Search Parameter
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Generate Button */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="p-6">
                <button
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center justify-center"
                  onClick={generateStoredProcedure}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaCode className="mr-2" />
                      Generate Stored Procedure
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-700">
                    <FaExclamationTriangle className="text-red-500 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Right column - Generated Code */}
          <div className="md:col-span-2">
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Generated Stored Procedure</h2>
                <div className="flex items-center space-x-2">
                  {generatedSP && (
                    <>
                      <button
                        className="p-2 text-gray-500 hover:text-teal-600 rounded-md"
                        onClick={() => copyToClipboard(generatedSP || '', 'Stored procedure copied to clipboard!')}
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-teal-600 rounded-md"
                        onClick={() => downloadAsFile(generatedSP || '', `sp_${activeTable || 'Procedure'}.sql`, 'text/plain')}
                        title="Download as file"
                      >
                        <FaDownload />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {generatedSP ? (
                  <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto whitespace-pre-wrap">
                    {generatedSP}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center p-6 text-center text-gray-500">
                    <div>
                      <FaCode className="text-5xl mx-auto mb-4 text-gray-300" />
                      <p>
                        Configure your stored procedure options and click "Generate" to see the SQL code.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Tooltips */}
      <Tooltip id="spg-tooltip" className="z-50" />
    </div>
  );
};

export default StoredProcedureGenerator;
