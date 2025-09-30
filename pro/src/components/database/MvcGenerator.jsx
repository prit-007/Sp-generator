import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaCode, FaCopy, FaDownload, FaReact, FaServer, FaFileCode, FaColumns, 
  FaExchangeAlt, FaDatabase, FaExpand, FaCompress, FaTerminal, FaCogs,
  FaEye, FaPlus, FaLayerGroup, FaRocket, FaChevronDown, FaCodeBranch,
  FaFileDownload, FaTimes, FaCheck, FaSearch, FaFilter, FaGlobe,
  FaFileAlt, FaTable, FaEdit, FaList, FaSave, FaSpinner, FaLightbulb,
  FaInfoCircle, FaArrowRight, FaQuestion, FaChartLine
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import useAddEditFormGenerator from '../custom-hooks/useAddEditFormGenerator';
import useModelGenerator from '../custom-hooks/useModelGenerator';
import useViewGenerator from '../custom-hooks/useViewGenerator';
import useControllerGenerator from '../custom-hooks/useControllerGenerator';
import useClipboardAndDownload from '../custom-hooks/useClipboardAndDownload';

const MvcGenerator = ({ activeTable, metadata, onBackToEditor }) => {
  const [activeTab, setActiveTab] = useState('model');
  const [useStronglyTyped, setUseStronglyTyped] = useState(true);
  const [dataAccessType, setDataAccessType] = useState('ef'); // 'ef' or 'sp'
  
  // Enhanced UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if the user has dismissed the tutorial before
    const tutorialDismissed = localStorage.getItem('mvc-generator-tutorial-dismissed');
    return tutorialDismissed !== 'true';
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingText, setLoadingText] = useState('');
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  
  // Enhanced MVC Generator features
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTables, setFilteredTables] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [codeTemplates, setCodeTemplates] = useState({
    useRepositoryPattern: true,
    useAsyncPatterns: true,
    includeValidation: true,
    includeLogging: true,
    useAutoMapper: false,
    includeCaching: false,
    useSwagger: true
  });
  const [architecturePattern, setArchitecturePattern] = useState('clean'); // 'mvc', 'clean', 'onion'
  const [frameworkVersion, setFrameworkVersion] = useState('net8'); // 'net6', 'net7', 'net8'
  const [showArchitectureGuide, setShowArchitectureGuide] = useState(false);
  const [codeMetrics, setCodeMetrics] = useState({
    linesOfCode: 0,
    complexity: 'Low',
    maintainability: 'High',
    testCoverage: 85
  });
  const [showBestPractices, setShowBestPractices] = useState(false);
  const [activePreviewMode, setActivePreviewMode] = useState('split'); // 'full', 'split', 'minimal'

  const { formCode } = useAddEditFormGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);
  const { modelCode } = useModelGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);
  const { viewCode } = useViewGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);
  const { controllerCode } = useControllerGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);

  const { showCopiedMessage, copyToClipboard, downloadCode } = useClipboardAndDownload(activeTable);

  // Mark as seen when the component loads for first time
  useEffect(() => {
    if (firstTimeUser) {
      localStorage.setItem('hasUsedMvcGenerator', 'true');
    }
  }, [firstTimeUser]);

  // Loading text animation
  useEffect(() => {
    if (isGenerating) {
      const loadingMessages = [
        'Analyzing database schema...',
        'Generating models...',
        'Creating controllers...',
        'Building views...',
        'Finalizing code...'
      ];
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingMessages[currentIndex]);
        currentIndex = (currentIndex + 1) % loadingMessages.length;
      }, 1200);
      
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Mark as used when generating code
  const handleGenerate = () => {
    if (!activeTable) {
      toast.warning('Please select a table first');
      return;
    }
    
    setIsGenerating(true);
    localStorage.setItem('hasUsedMvcGenerator', 'true');
    
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
      setGeneratedCode(getActiveTabCode());
      toast.success('Code generated successfully!');
    }, 2000);
  };

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

  // Generate a sample code when no table is selected
  const getSampleCode = () => {
    switch (activeTab) {
      case 'model':
        return `// Sample Model Class
using System;
using System.ComponentModel.DataAnnotations;

namespace YourApp.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [DataType(DataType.MultilineText)]
        public string Description { get; set; }
        
        [Range(0, 9999.99)]
        public decimal Price { get; set; }
        
        [Display(Name = "In Stock")]
        public bool IsAvailable { get; set; }
        
        [Display(Name = "Date Added")]
        [DataType(DataType.Date)]
        public DateTime CreatedDate { get; set; }
    }
}`;
      case 'controller':
        return `// Sample Controller
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using YourApp.Data;
using YourApp.Models;

namespace YourApp.Controllers
{
    public class ProductsController : Controller
    {
        private readonly ApplicationDbContext _context;
        
        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: Products
        public async Task<IActionResult> Index()
        {
            return View(await _context.Products.ToListAsync());
        }
        
        // GET: Products/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();
            
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            
            return View(product);
        }
    }
}`;
      case 'view':
        return `@model IEnumerable<YourApp.Models.Product>

@{
    ViewData["Title"] = "Products";
}

<div class="container">
    <h2>Products List</h2>
    <p>
        <a asp-action="Create" class="btn btn-primary">Create New</a>
    </p>
    
    <table class="table table-striped">
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>In Stock</th>
                <th>Date Added</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var item in Model) {
                <tr>
                    <td>@item.Name</td>
                    <td>@item.Price.ToString("C")</td>
                    <td>@(item.IsAvailable ? "Yes" : "No")</td>
                    <td>@item.CreatedDate.ToShortDateString()</td>
                    <td>
                        <a asp-action="Edit" asp-route-id="@item.Id">Edit</a> |
                        <a asp-action="Details" asp-route-id="@item.Id">Details</a> |
                        <a asp-action="Delete" asp-route-id="@item.Id">Delete</a>
                    </td>
                </tr>
            }
        </tbody>
    </table>
</div>`;
      case 'form':
        return `@model YourApp.Models.Product

@{
    ViewData["Title"] = Model == null ? "Create Product" : "Edit Product";
}

<div class="container">
    <h2>@ViewData["Title"]</h2>
    
    <div class="row">
        <div class="col-md-8">
            <form asp-action="@(Model == null ? "Create" : "Edit")" method="post">
                <div asp-validation-summary="ModelOnly" class="text-danger"></div>
                
                @if (Model != null) {
                    <input type="hidden" asp-for="Id" />
                }
                
                <div class="form-group mb-3">
                    <label asp-for="Name" class="control-label"></label>
                    <input asp-for="Name" class="form-control" />
                    <span asp-validation-for="Name" class="text-danger"></span>
                </div>
                
                <div class="form-group mb-3">
                    <label asp-for="Description" class="control-label"></label>
                    <textarea asp-for="Description" class="form-control" rows="3"></textarea>
                    <span asp-validation-for="Description" class="text-danger"></span>
                </div>
                
                <div class="form-group mb-3">
                    <label asp-for="Price" class="control-label"></label>
                    <input asp-for="Price" class="form-control" />
                    <span asp-validation-for="Price" class="text-danger"></span>
                </div>
                
                <div class="form-check mb-3">
                    <input asp-for="IsAvailable" class="form-check-input" />
                    <label asp-for="IsAvailable" class="form-check-label"></label>
                </div>
                
                <div class="form-group mb-3">
                    <label asp-for="CreatedDate" class="control-label"></label>
                    <input asp-for="CreatedDate" class="form-control" type="date" />
                    <span asp-validation-for="CreatedDate" class="text-danger"></span>
                </div>
                
                <div class="form-group mt-4">
                    <button type="submit" class="btn btn-primary me-2">Save</button>
                    <a asp-action="Index" class="btn btn-secondary">Back to List</a>
                </div>
            </form>
        </div>
    </div>
</div>`;
      default:
        return '// Select a table and component to generate code';
    }
  };

  // Helper function to get the code for the active tab
  const getActiveTabCode = () => {
    if (!activeTable) {
      return getSampleCode();
    }
    
    switch (activeTab) {
      case 'model':
        return modelCode;
      case 'view':
        return viewCode;
      case 'controller':
        return controllerCode;
      case 'form':
        return formCode;
      default:
        return '';
    }
  };

  // Function to render the tutorial panel similar to SP Generator
  const renderTutorialPanel = () => {
    const tutorialSteps = [
      {
        title: "Welcome to MVC Generator",
        content: "This tool helps you quickly create ASP.NET MVC components based on your database schema. Follow this quick guide to get started.",
        icon: <FaLightbulb className="text-yellow-500 text-2xl" />
      },
      {
        title: "1. Choose Architecture Pattern",
        content: "Select your preferred architecture: Traditional MVC, Clean Architecture, or Onion Architecture for better separation of concerns.",
        icon: <FaLayerGroup className="text-blue-500 text-2xl" />
      },
      {
        title: "2. Configure Framework & Patterns",
        content: "Choose .NET version, enable Repository pattern, Async/Await, validation, logging, and other modern features.",
        icon: <FaCogs className="text-purple-500 text-2xl" />
      },
      {
        title: "3. Select Components & Columns",
        content: "Choose which components to generate and select specific columns for your models.",
        icon: <FaColumns className="text-green-500 text-2xl" />
      },
      {
        title: "4. Generate & Use",
        content: "Click 'Generate' to create your code. You can preview, copy to clipboard, or download the generated code.",
        icon: <FaFileCode className="text-red-500 text-2xl" />
      }
    ];

    const currentStepData = tutorialSteps[currentStep - 1] || tutorialSteps[0];

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
            MVC Generator Tutorial
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                if (currentStep < tutorialSteps.length) {
                  setCurrentStep(currentStep + 1);
                } else {
                  setCurrentStep(1);
                }
              }}
              className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-2 rounded"
            >
              {currentStep < tutorialSteps.length ? "Next" : "Restart"}
            </button>
            <button
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('mvc-generator-tutorial-dismissed', 'true');
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded"
              aria-label="Dismiss tutorial"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-4 mt-4">
          <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-sm">
            {currentStepData.icon}
          </div>
          <div>
            <h4 className="font-medium text-indigo-900 mb-1">{currentStepData.title}</h4>
            <p className="text-sm text-slate-600">{currentStepData.content}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-1 mt-4">
          {tutorialSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full ${index < currentStep ? 'bg-indigo-500' : 'bg-indigo-200'}`}
              style={{ width: `${100 / tutorialSteps.length}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${100 / tutorialSteps.length}%` }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  const glowVariants = {
    initial: { boxShadow: "0 0 0 rgba(59, 130, 246, 0)" },
    animate: { 
      boxShadow: [
        "0 0 0 rgba(59, 130, 246, 0)",
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 0 rgba(59, 130, 246, 0)"
      ],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  // Generate code for different component types
  const generateCode = async (componentType) => {
    if (!activeTable) {
      // Still show the preview but with a helpful message
      toast.info('Please select a table from the sidebar first');
      setGeneratedCode('// No table selected. Please choose a table from the sidebar.');
      setShowPreview(true);
      return;
    }
    
    if (!metadata[activeTable]) {
      toast.error('Unable to retrieve metadata for selected table');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      let code = '';
      
      if (componentType === 'all') {
        // Generate all components
        code = `// ===== MODEL CLASS =====\n${modelCode}\n\n` +
               `// ===== CONTROLLER =====\n${controllerCode}\n\n` +
               `// ===== LIST VIEW =====\n${viewCode}\n\n` +
               `// ===== EDIT FORM =====\n${formCode}`;
      } else {
        switch (componentType) {
          case 'model':
            code = modelCode;
            break;
          case 'controller':
            code = controllerCode;
            break;
          case 'view':
            code = viewCode;
            break;
          case 'form':
            code = formCode;
            break;
          default:
            code = modelCode;
        }
      }
      
      setGeneratedCode(code);
      setShowPreview(true);
      
      // Show success notification
      toast.success(
        `${componentType === 'all' ? 'All MVC components' : `${componentType} component`} generated successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
          }
        }
      );
      
    } catch (err) {
      setError('Failed to generate code. Please try again.');
      toast.error('Code generation failed!', {
        position: "top-right",
        autoClose: 3000,
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px'
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle copy functionality
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          borderRadius: '12px'
        }
      });
    } catch (err) {
      toast.error('Failed to copy code!', {
        position: "top-right",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px'
        }
      });
    }
  };

  // Enhanced download function
  const handleDownload = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([generatedCode], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      
      const fileName = activeTab === 'all' 
        ? `${activeTable}_MVC_Complete.txt`
        : `${activeTable}_${activeTab}.${activeTab === 'view' || activeTab === 'form' ? 'cshtml' : 'cs'}`;
      
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`${fileName} downloaded successfully!`, {
        position: "top-right",
        autoClose: 3000,
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '12px'
        }
      });
    } catch (err) {
      toast.error('Download failed!', {
        position: "top-right",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px'
        }
      });
    }
  };

  // Render generated code with copy and download options
  const renderGeneratedCode = () => (
    <div className="generated-code-container">
      <h3>Generated Code</h3>
      <div className="code-preview">
        <pre>{generatedCode}</pre>
      </div>
      <div className="actions">
        <button
          className={`btn ${!activeTable || !generatedCode ? 'btn-outline-secondary disabled' : 'btn-outline-primary'}`}
          onClick={() => activeTable && generatedCode ? copyToClipboard(generatedCode, activeTable) : null}
          disabled={!activeTable || !generatedCode}
        >
          <FaCopy /> Copy
        </button>
        <button
          className={`btn ${!activeTable || !generatedCode ? 'btn-outline-secondary disabled' : 'btn-outline-success'}`}
          onClick={() => activeTable && generatedCode ? downloadCode(generatedCode, activeTable) : null}
          disabled={!activeTable || !generatedCode}
        >
          <FaDownload /> Download
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'model', label: 'Model', icon: FaCode, color: 'blue' },
    { id: 'controller', label: 'Controller', icon: FaServer, color: 'purple' },
    { id: 'view', label: 'List View', icon: FaColumns, color: 'emerald' },
    { id: 'form', label: 'Edit Form', icon: FaFileCode, color: 'orange' }
  ];

  const handleBackToEditor = () => {
    setShowPreview(false);
    setGeneratedCode('');
    setError('');
    
    if (onBackToEditor && typeof onBackToEditor === 'function') {
      try {
        onBackToEditor();
      } catch (err) {
        console.warn('Error in onBackToEditor:', err.message);
      }
    } else {
      console.warn('onBackToEditor function is not provided or invalid');
    }
  };

  // Update content when activeTable changes, but keep the active tab
  useEffect(() => {
    setGeneratedCode(getActiveTabCode());
  }, [activeTable]);

  return (
    <>
      {/* Tutorial Panel - similar to SP Generator */}
      <AnimatePresence>
        {showTutorial && renderTutorialPanel()}
      </AnimatePresence>
      
      <motion.div 
        className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-white overflow-auto' : 'relative'} transition-all duration-500`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className={`${isFullscreen ? 'min-h-screen' : ''} bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl overflow-hidden border border-slate-200`}>
          
          {/* Modern Header with v2.0 Styling */}
          <motion.div 
            className="relative bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-6 rounded-b-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <motion.div 
                className="absolute top-10 right-10 w-40 h-40 bg-blue-400 rounded-full opacity-10"
                animate={{ 
                  scale: [1, 1.2, 1], 
                  x: [0, 10, 0], 
                  y: [0, -10, 0] 
                }} 
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  x: [0, -15, 0],
                  y: [0, 10, 0]
                }} 
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
            </div>

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-5">
                {/* Logo */}
                <motion.div 
                  className="flex items-center justify-center w-14 h-14 bg-indigo-600/50 backdrop-blur-sm rounded-2xl border border-indigo-400/30 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <FaFileCode className="text-3xl text-yellow-100" />
                    <motion.div 
                      className="absolute -right-2 -top-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                {/* Title Section */}
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="text-3xl font-extrabold tracking-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                        MVC Generator
                      </span>
                    </h3>
                    <div className="relative ml-3">
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                      <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                    </div>
                  </div>
                  <p className="text-blue-100 font-light">
                    {activeTable ? 
                      `Building enterprise components for ${activeTable} table` : 
                      'Select a database table to begin code generation'}
                  </p>
                </div>
              </div>

            <div className="flex items-center space-x-3">
              {/* Action buttons with modern design */}
              <motion.button
                onClick={() => setShowTutorial(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/40 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-white hover:bg-indigo-500/50 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                data-tooltip-id="mvc-tooltip"
                data-tooltip-content="Show Tutorial"
              >
                <FaLightbulb className="text-yellow-300" />
                <span className="text-sm font-medium">Tutorial</span>
              </motion.button>
              
              {showPreview && (
                <motion.button
                  onClick={() => {
                    setShowPreview(false);
                    setGeneratedCode('');
                    setError('');
                    // Call the parent callback to switch back to columns tab only if we have a table
                    if (activeTable && onBackToEditor) {
                      onBackToEditor();
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl border border-blue-400/30 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCodeBranch className="text-blue-200" />
                  <span className="font-medium">Back to Editor</span>
                </motion.button>
              )}
              <motion.button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center justify-center w-9 h-9 bg-indigo-600/40 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-white hover:bg-indigo-500/50 transition-all duration-200"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <FaCompress className="text-yellow-100" /> : <FaExpand className="text-yellow-100" />}
              </motion.button>
            </div>
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
          
          {/* No Table Selected Message */}
          <AnimatePresence>
            {!activeTable && (
              <motion.div 
                className="mb-6 p-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-lg text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-blue-100 p-5 rounded-full mb-6">
                    <FaTable className="text-blue-600 text-4xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">Select a Table</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Choose a table from the sidebar to generate MVC components for it
                  </p>
                  <div className="flex items-center justify-center bg-blue-100 p-4 rounded-lg">
                    <FaArrowRight className="text-blue-500 mr-3 animate-pulse" />
                    <span className="text-blue-700 font-medium">Click on any table name in the left sidebar</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!activeTable && !showPreview ? null : !showPreview ? (
            <motion.div
              variants={itemVariants}
              className="space-y-8"
            >
              {/* Configuration Panel */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
                whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-slate-800 flex items-center">
                    <FaCogs className="mr-3 text-blue-600" />
                    Configuration
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data Access Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Data Access Pattern</label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => setDataAccessType('ef')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          dataAccessType === 'ef'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaDatabase className="mx-auto mb-2 text-lg" />
                        <div className="text-sm font-medium">Entity Framework</div>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => setDataAccessType('sp')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          dataAccessType === 'sp'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaTerminal className="mx-auto mb-2 text-lg" />
                        <div className="text-sm font-medium">Stored Procedures</div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Strongly Typed Views */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">View Type</label>
                    <motion.div 
                      className="flex items-center p-4 bg-slate-50 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <input
                        type="checkbox"
                        id="stronglyTyped"
                        checked={useStronglyTyped}
                        onChange={(e) => setUseStronglyTyped(e.target.checked)}
                        className="mr-3 h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="stronglyTyped" className="flex-1 cursor-pointer">
                        <div className="font-medium text-slate-800">Strongly Typed Views</div>
                        <div className="text-sm text-slate-600">Generate type-safe Razor views</div>
                      </label>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Component Selection */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
                variants={itemVariants}
                whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              >
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <FaLayerGroup className="mr-3 text-purple-600" />
                  Component Selection
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative overflow-hidden p-6 rounded-xl transition-all duration-300 transform ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg scale-105`
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-102'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div className="flex flex-col items-center space-y-3">
                        <motion.div
                          animate={activeTab === tab.id ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <tab.icon className="text-2xl" />
                        </motion.div>
                        <span className="font-semibold">{tab.label}</span>
                      </motion.div>
                      
                      {activeTab === tab.id && (
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

              {/* Generation Actions */}
              <motion.div 
                className="bg-gradient-to-br from-slate-100 via-white to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-lg"
                variants={itemVariants}
                whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              >
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <FaRocket className="mr-3 text-orange-500" />
                  Generate Code
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <FaFileCode className="text-white text-xl" />
                      </motion.div>
                      <h5 className="font-bold text-slate-800 mb-2">Single Component</h5>
                      <p className="text-sm text-slate-600 mb-4">Generate the selected component type.</p>
                      <motion.button
                        onClick={() => generateCode(activeTab)}
                        disabled={isGenerating || !activeTable}
                        className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isGenerating ? (
                          <>
                            <motion.div 
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="ml-2">{loadingText || 'Generating...'}</span>
                          </>
                        ) : (
                          <>
                            <FaFileCode />
                            <span>Generate {activeTab}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="group bg-white rounded-xl border-2 border-purple-200 p-6 hover:border-purple-400 transition-all duration-300 hover:shadow-lg"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <motion.div 
                        className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <FaLayerGroup className="text-white text-xl" />
                      </motion.div>
                      <h5 className="font-bold text-slate-800 mb-2">Complete MVC</h5>
                      <p className="text-sm text-slate-600 mb-4">Generate all MVC components at once.</p>
                      <motion.button
                        onClick={() => generateCode('all')}
                        disabled={isGenerating || !activeTable}
                        className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isGenerating ? (
                          <>
                            <motion.div 
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="ml-2">{loadingText || 'Generating all components...'}</span>
                          </>
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
                    className="group bg-white rounded-xl border-2 border-emerald-200 p-6 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <motion.div 
                        className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <FaDownload className="text-white text-xl" />
                      </motion.div>
                      <h5 className="font-bold text-slate-800 mb-2">Download Package</h5>
                      <p className="text-sm text-slate-600 mb-4">Download all components as a zip file.</p>
                      <motion.button
                        onClick={() => {
                          generateCode('all');
                          setTimeout(() => handleDownload(), 1000);
                        }}
                        disabled={isGenerating || !activeTable}
                        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaDownload />
                        <span>Package & Download</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Configuration Panel */}
                <motion.div
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mt-6"
                  variants={itemVariants}
                >
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <FaCogs className="mr-3 text-purple-500" />
                    Advanced Configuration
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Architecture Pattern Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Architecture Pattern</label>
                      <div className="space-y-2">
                        {[
                          { value: 'mvc', label: 'Traditional MVC', desc: 'Classic Model-View-Controller pattern' },
                          { value: 'clean', label: 'Clean Architecture', desc: 'Dependency inversion with layers' },
                          { value: 'onion', label: 'Onion Architecture', desc: 'Domain-centric layered approach' }
                        ].map(pattern => (
                          <motion.label
                            key={pattern.value}
                            className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                              architecturePattern === pattern.value
                                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 text-purple-800'
                                : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="radio"
                              name="architecture"
                              value={pattern.value}
                              checked={architecturePattern === pattern.value}
                              onChange={(e) => setArchitecturePattern(e.target.value)}
                              className="mr-3 h-4 w-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                            />
                            <div>
                              <div className="font-medium text-sm">{pattern.label}</div>
                              <div className="text-xs text-slate-600">{pattern.desc}</div>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Framework & Features */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Framework Version</label>
                      <select
                        value={frameworkVersion}
                        onChange={(e) => setFrameworkVersion(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
                      >
                        <option value="net6">.NET 6 LTS</option>
                        <option value="net7">.NET 7</option>
                        <option value="net8">.NET 8 LTS (Recommended)</option>
                      </select>
                      
                      <div className="space-y-2">
                        {[
                          { key: 'useRepositoryPattern', label: 'Repository Pattern', desc: 'Data access abstraction' },
                          { key: 'useAsyncPatterns', label: 'Async/Await', desc: 'Non-blocking operations' },
                          { key: 'includeValidation', label: 'Data Validation', desc: 'Model validation attributes' },
                          { key: 'includeLogging', label: 'Logging', desc: 'ILogger integration' },
                          { key: 'useAutoMapper', label: 'AutoMapper', desc: 'Object-to-object mapping' },
                          { key: 'includeCaching', label: 'Caching', desc: 'Response caching' },
                          { key: 'useSwagger', label: 'Swagger/OpenAPI', desc: 'API documentation' }
                        ].map(feature => (
                          <motion.label
                            key={feature.key}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                            whileHover={{ x: 2 }}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={codeTemplates[feature.key]}
                                onChange={(e) => setCodeTemplates(prev => ({...prev, [feature.key]: e.target.checked}))}
                                className="mr-3 h-4 w-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                              />
                              <div>
                                <div className="text-sm font-medium text-slate-700">{feature.label}</div>
                                <div className="text-xs text-slate-500">{feature.desc}</div>
                              </div>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                    <motion.button
                      onClick={() => setShowArchitectureGuide(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-purple-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaQuestion />
                      <span className="text-sm">Architecture Guide</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setShowBestPractices(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaLightbulb />
                      <span className="text-sm">Best Practices</span>
                    </motion.button>
                    
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <FaChartLine className="text-green-500" />
                      <span>Code Quality: {codeMetrics.maintainability}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Column Selection Panel */}
                {metadata[activeTable]?.Columns && (
                  <motion.div
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mt-6"
                    variants={itemVariants}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-bold text-slate-800 flex items-center">
                        <FaColumns className="mr-3 text-teal-500" />
                        Column Selection
                      </h4>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => {
                            const allColumns = metadata[activeTable].Columns.map(col => col.Name);
                            setSelectedColumns(selectedColumns.length === allColumns.length ? [] : allColumns);
                          }}
                          className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          {selectedColumns.length === metadata[activeTable].Columns.length ? 'Deselect All' : 'Select All'}
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {metadata[activeTable].Columns.map((column, index) => (
                        <motion.label
                          key={column.Name}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedColumns.includes(column.Name)
                              ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 text-teal-800'
                              : 'bg-white border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(column.Name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedColumns([...selectedColumns, column.Name]);
                              } else {
                                setSelectedColumns(selectedColumns.filter(col => col !== column.Name));
                              }
                            }}
                            className="mr-3 h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{column.Name}</div>
                            <div className="text-xs text-slate-500 truncate">
                              {column.Type}{column.IsPrimaryKey && ' (PK)'}{column.IsNullable === false && ' *'}
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* Enhanced Preview Section */
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
                  <FaTerminal className="mr-3 text-blue-500" />
                  Generated {activeTab === 'all' ? 'MVC Components' : `${activeTab} Code`}
                </motion.h4>
                
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ x: 20 }}
                  animate={{ x: 0 }}
                >
                  <motion.button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCopy />
                    <span>Copy</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaDownload />
                    <span>Download</span>
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
                    <span className="text-slate-300 text-sm font-medium">MVC Code Generator</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <FaFileCode />
                    <span>{activeTable ? `${activeTable}_${activeTab}.${activeTab === 'view' || activeTab === 'form' ? 'cshtml' : 'cs'}` : 'example_code.cs'}</span>
                  </div>
                </div>

                {/* Code Content */}
                <div className="relative">
                  {!activeTable ? (
                    <div className="p-6 bg-slate-900 min-h-96 flex flex-col items-center justify-center">
                      <div className="bg-slate-800 p-5 rounded-lg shadow-lg border border-slate-700 max-w-lg">
                        <div className="flex items-center mb-3">
                          <FaInfoCircle className="text-blue-400 mr-2 text-xl" />
                          <h3 className="text-blue-300 text-lg font-semibold">No Table Selected</h3>
                        </div>
                        <p className="text-slate-400 mb-4">
                          Please select a table from the sidebar to generate MVC components. 
                          The preview will show sample code for the selected table.
                        </p>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700 mb-4">
                          <pre className="text-green-400 font-mono text-xs">
                            <code>{"// Sample Model Code:\npublic class SampleModel\n{\n    public int Id { get; set; }\n    public string Name { get; set; }\n    public DateTime CreatedDate { get; set; }\n    \n    // More properties will be generated based on your selected table\n}\n\n// A complete model, controller, view, and form will be generated\n// when you select a table from the sidebar and click \"Generate\""}</code>
                          </pre>
                        </div>
                        <div className="flex items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800/50">
                          <FaArrowRight className="text-blue-500 mr-2 animate-pulse" />
                          <span className="text-blue-300 text-sm">Select a table from the sidebar to continue</span>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                        {generatedCode}
                      </motion.code>
                    </motion.pre>
                  )}
                  
                  {/* Animated Cursor - only show when a table is selected */}
                  {activeTable && (
                    <motion.div
                      className="absolute bottom-6 left-6 w-2 h-5 bg-green-400"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent pointer-events-none"></div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Tooltips */}
      <Tooltip id="mvc-tooltip" />
    </motion.div>
    </>
  );
};

export default MvcGenerator;