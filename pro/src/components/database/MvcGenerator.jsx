import React, { useState } from 'react';
import { FaCode, FaCopy, FaDownload, FaReact, FaServer, FaFileCode, FaColumns, FaExchangeAlt, FaDatabase } from 'react-icons/fa';
import useAddEditFormGenerator from '../custom-hooks/useAddEditFormGenerator';
import useModelGenerator from '../custom-hooks/useModelGenerator';
import useViewGenerator from '../custom-hooks/useViewGenerator';
import useControllerGenerator from '../custom-hooks/useControllerGenerator';
import useClipboardAndDownload from '../custom-hooks/useClipboardAndDownload';

const MvcGenerator = ({ activeTable, metadata }) => {
  const [activeTab, setActiveTab] = useState('model');
  const [useStronglyTyped, setUseStronglyTyped] = useState(true);
  const [dataAccessType, setDataAccessType] = useState('ef'); // 'ef' or 'sp'

  const { formCode } = useAddEditFormGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);
  const { modelCode } = useModelGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);
  const { viewCode } = useViewGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);
  const { controllerCode } = useControllerGenerator(activeTable,metadata,useStronglyTyped,dataAccessType);

  const { showCopiedMessage, copyToClipboard, downloadCode } = useClipboardAndDownload(activeTable);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-teal-100 mb-8">
      <div className="border-b border-teal-100 bg-teal-50 px-6 py-4 flex justify-between items-center">
        <h3 className="font-semibold text-teal-800 text-lg flex items-center">
          <FaReact className="mr-2 text-blue-500" />
          ASP.NET Core MVC Generator
        </h3>
        
        {/* Options section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-teal-700">Data Access:</span>
            <div className="relative">
              <select 
                value={dataAccessType}
                onChange={(e) => setDataAccessType(e.target.value)}
                className="bg-white border border-teal-200 text-teal-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 py-1 pl-3 pr-8"
              >
                <option value="ef">Entity Framework</option>
                <option value="sp">Stored Procedures</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-teal-700">
                <FaExchangeAlt className="text-xs" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                checked={useStronglyTyped}
                onChange={() => setUseStronglyTyped(!useStronglyTyped)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              <span className="ms-3 text-sm font-medium text-teal-700">Strongly Typed</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-teal-100">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('model')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'model' 
                ? 'border-b-2 border-teal-600 text-teal-800' 
                : 'text-teal-600 hover:text-teal-800'
            }`}
          >
            <FaCode className="mr-2" />
            Model Class
          </button>
          <button 
            onClick={() => setActiveTab('controller')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'controller' 
                ? 'border-b-2 border-teal-600 text-teal-800' 
                : 'text-teal-600 hover:text-teal-800'
            }`}
          >
            <FaServer className="mr-2" />
            Controller
          </button>
          <button 
            onClick={() => setActiveTab('view')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'view' 
                ? 'border-b-2 border-teal-600 text-teal-800' 
                : 'text-teal-600 hover:text-teal-800'
            }`}
          >
            <FaColumns className="mr-2" />
            List View
          </button>
          <button 
            onClick={() => setActiveTab('form')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'form' 
                ? 'border-b-2 border-teal-600 text-teal-800' 
                : 'text-teal-600 hover:text-teal-800'
            }`}
          >
            <FaFileCode className="mr-2" />
            Edit Form
          </button>
        </div>
      </div>
      
      {/* Code display area */}
      <div className="relative">
        <div className="p-4 bg-slate-50 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-slate-700">
              {activeTab === 'model' && `${activeTable}.cs`}
              {activeTab === 'controller' && `${activeTable}Controller.cs`}
              {activeTab === 'view' && 'Index.cshtml'}
              {activeTab === 'form' && 'Edit.cshtml'}
            </h4>
            <div className="flex space-x-2">
              <button 
                onClick={() => copyToClipboard(
                  activeTab === 'model' ? modelCode : 
                  activeTab === 'controller' ? controllerCode : 
                  activeTab === 'view' ? viewCode : formCode, 
                  activeTab
                )}
                className="text-xs px-3 py-1 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md flex items-center transition-colors"
              >
                <FaCopy className="mr-1" />
                Copy
              </button>
              <button 
                onClick={() => downloadCode(
                  activeTab === 'model' ? modelCode : 
                  activeTab === 'controller' ? controllerCode : 
                  activeTab === 'view' ? viewCode : formCode, 
                  activeTab
                )}
                className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md flex items-center transition-colors"
              >
                <FaDownload className="mr-1" />
                Download
              </button>
            </div>
          </div>
          
          {/* Code preview with syntax highlighting */}
          <div className="bg-slate-800 rounded-md overflow-auto max-h-[500px] relative">
            <pre className="p-4 text-sm text-slate-100 font-mono">
              <code>
                {activeTab === 'model' && modelCode}
                {activeTab === 'controller' && controllerCode}
                {activeTab === 'view' && viewCode}
                {activeTab === 'form' && formCode}
              </code>
            </pre>
            
            {/* Copied message notification */}
            {showCopiedMessage && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-md border border-green-400">
                Copied!
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Database schema summary */}
      <div className="p-4 border-t border-teal-100">
        <div className="flex items-center mb-2">
          <FaDatabase className="text-slate-500 mr-2" />
          <h4 className="text-sm font-medium text-slate-700">Table Schema: {activeTable}</h4>
        </div>
        
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Column</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nullable</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Primary Key</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Foreign Key</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {metadata[activeTable].Columns.map((column, idx) => (
                <tr key={column.Name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700">{column.Name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700">{column.Type}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {column.IsNullable ? 
                      <span className="text-yellow-600">Yes</span> : 
                      <span className="text-slate-700">No</span>
                    }
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {metadata[activeTable].PrimaryKeys.includes(column.Name) ? 
                      <span className="text-blue-600">Yes</span> : 
                      <span className="text-slate-700">No</span>
                    }
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {metadata[activeTable].ForeignKeys.some(fk => fk.Column === column.Name) ? 
                      <span className="text-green-600">
                        {metadata[activeTable].ForeignKeys.find(fk => fk.Column === column.Name).ReferenceTable}
                      </span> : 
                      <span className="text-slate-700">No</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Help guide section */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-5 w-5 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium text-blue-800">Tips</h5>
            <div className="mt-1 text-xs text-blue-700">
              <p>• Generated code uses Bootstrap 5 for styling and jQuery for basic interactions.</p>
              <p>• Entity Framework mode generates code that works with DbContext.</p>
              <p>• Stored Procedure mode uses Dapper and assumes matching SP names (e.g., SP_Select_{activeTable}, SP_Insert_{activeTable}, SP_Update_{activeTable}, SP_Delete_{activeTable}).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MvcGenerator;