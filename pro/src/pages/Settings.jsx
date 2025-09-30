import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaDatabase, FaServer, FaKey, FaTable, FaCodeBranch, FaSave, FaUndo } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    connectionStrings: [],
    defaultConnection: '',
    theme: 'teal',
    codeGeneration: {
      includeComments: true,
      errorHandling: true,
      includeTimestamps: true,
      namingConvention: 'pascal'
    },
    storedProcedures: {
      prefixName: 'sp_',
      includeTry: true,
      enableLogging: false
    },
    advanced: {
      timeout: 30,
      enableCaching: true,
      cacheExpiration: 15,
      enableMetrics: false
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isModified, setIsModified] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setOriginalSettings(parsedSettings);
    } else {
      setOriginalSettings(settings);
    }
  }, []);

  // Compare current settings with original to detect changes
  useEffect(() => {
    if (originalSettings) {
      const isChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setIsModified(isChanged);
    }
  }, [settings, originalSettings]);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleMainSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = () => {
    // Save to localStorage or API
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setOriginalSettings(settings);
    setIsModified(false);
    // Show success notification
    alert('Settings saved successfully');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset to the last saved settings?')) {
      setSettings(originalSettings);
      setIsModified(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-screen-xl mx-auto p-6"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaCog className="mr-3 text-teal-600" />
            Application Settings
          </h1>
          <p className="mt-2 text-gray-600">Configure your database connections and application preferences</p>
        </div>

        <div className="flex min-h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-1">
              <NavItem 
                active={activeTab === 'general'} 
                icon={<FaCog />} 
                onClick={() => setActiveTab('general')}
              >
                General
              </NavItem>
              <NavItem 
                active={activeTab === 'connections'} 
                icon={<FaDatabase />} 
                onClick={() => setActiveTab('connections')}
              >
                Database Connections
              </NavItem>
              <NavItem 
                active={activeTab === 'code'} 
                icon={<FaCodeBranch />} 
                onClick={() => setActiveTab('code')}
              >
                Code Generation
              </NavItem>
              <NavItem 
                active={activeTab === 'stored'} 
                icon={<FaServer />} 
                onClick={() => setActiveTab('stored')}
              >
                Stored Procedures
              </NavItem>
              <NavItem 
                active={activeTab === 'advanced'} 
                icon={<FaKey />} 
                onClick={() => setActiveTab('advanced')}
              >
                Advanced
              </NavItem>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-4">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                    <select 
                      className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                      value={settings.theme}
                      onChange={(e) => handleMainSettingChange('theme', e.target.value)}
                    >
                      <option value="teal">Teal (Default)</option>
                      <option value="blue">Blue</option>
                      <option value="indigo">Indigo</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Connection</label>
                    <select 
                      className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                      value={settings.defaultConnection}
                      onChange={(e) => handleMainSettingChange('defaultConnection', e.target.value)}
                    >
                      <option value="">Select a connection</option>
                      {settings.connectionStrings.map((conn, index) => (
                        <option key={index} value={conn.name}>{conn.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'connections' && (
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-4">Database Connections</h2>
                <div className="space-y-4 mb-6">
                  {settings.connectionStrings.map((conn, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-800">{conn.name}</h3>
                        <button 
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => {
                            const newConns = [...settings.connectionStrings];
                            newConns.splice(index, 1);
                            handleMainSettingChange('connectionStrings', newConns);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 truncate">{conn.connectionString}</div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  onClick={() => {
                    const name = prompt('Enter connection name');
                    const connectionString = prompt('Enter connection string');
                    if (name && connectionString) {
                      handleMainSettingChange('connectionStrings', [
                        ...settings.connectionStrings, 
                        { name, connectionString }
                      ]);
                    }
                  }}
                >
                  Add New Connection
                </button>
              </div>
            )}

            {activeTab === 'code' && (
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-4">Code Generation Settings</h2>
                <div className="space-y-6">
                  <CheckboxSetting 
                    label="Include Comments" 
                    description="Add descriptive comments to generated code"
                    checked={settings.codeGeneration.includeComments}
                    onChange={(value) => handleChange('codeGeneration', 'includeComments', value)}
                  />
                  
                  <CheckboxSetting 
                    label="Error Handling" 
                    description="Include try/catch blocks and error handling"
                    checked={settings.codeGeneration.errorHandling}
                    onChange={(value) => handleChange('codeGeneration', 'errorHandling', value)}
                  />
                  
                  <CheckboxSetting 
                    label="Include Timestamps" 
                    description="Add creation timestamps to generated files"
                    checked={settings.codeGeneration.includeTimestamps}
                    onChange={(value) => handleChange('codeGeneration', 'includeTimestamps', value)}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Naming Convention</label>
                    <select 
                      className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                      value={settings.codeGeneration.namingConvention}
                      onChange={(e) => handleChange('codeGeneration', 'namingConvention', e.target.value)}
                    >
                      <option value="pascal">Pascal Case (MyVariableName)</option>
                      <option value="camel">Camel Case (myVariableName)</option>
                      <option value="snake">Snake Case (my_variable_name)</option>
                      <option value="kebab">Kebab Case (my-variable-name)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stored' && (
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-4">Stored Procedure Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procedure Name Prefix</label>
                    <input 
                      type="text" 
                      className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                      value={settings.storedProcedures.prefixName}
                      onChange={(e) => handleChange('storedProcedures', 'prefixName', e.target.value)}
                      placeholder="e.g., sp_"
                    />
                  </div>
                  
                  <CheckboxSetting 
                    label="Include TRY-CATCH Blocks" 
                    description="Wrap procedures in TRY-CATCH blocks for error handling"
                    checked={settings.storedProcedures.includeTry}
                    onChange={(value) => handleChange('storedProcedures', 'includeTry', value)}
                  />
                  
                  <CheckboxSetting 
                    label="Enable Logging" 
                    description="Include logging statements in generated procedures"
                    checked={settings.storedProcedures.enableLogging}
                    onChange={(value) => handleChange('storedProcedures', 'enableLogging', value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-4">Advanced Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Connection Timeout (seconds)</label>
                    <input 
                      type="number" 
                      className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                      value={settings.advanced.timeout}
                      onChange={(e) => handleChange('advanced', 'timeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </div>
                  
                  <CheckboxSetting 
                    label="Enable Caching" 
                    description="Cache database metadata to improve performance"
                    checked={settings.advanced.enableCaching}
                    onChange={(value) => handleChange('advanced', 'enableCaching', value)}
                  />
                  
                  {settings.advanced.enableCaching && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cache Expiration (minutes)</label>
                      <input 
                        type="number" 
                        className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
                        value={settings.advanced.cacheExpiration}
                        onChange={(e) => handleChange('advanced', 'cacheExpiration', parseInt(e.target.value))}
                        min="1"
                        max="60"
                      />
                    </div>
                  )}
                  
                  <CheckboxSetting 
                    label="Enable Performance Metrics" 
                    description="Collect and display performance metrics for database operations"
                    checked={settings.advanced.enableMetrics}
                    onChange={(value) => handleChange('advanced', 'enableMetrics', value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with save button */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between">
          <div>
            {isModified && (
              <span className="text-sm text-yellow-600 font-medium">You have unsaved changes</span>
            )}
          </div>
          <div className="flex space-x-3">
            {isModified && (
              <button
                onClick={resetSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <FaUndo className="mr-2" />
                Reset Changes
              </button>
            )}
            <button
              onClick={saveSettings}
              disabled={!isModified}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${isModified ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-400 cursor-not-allowed'}`}
            >
              <FaSave className="mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NavItem = ({ active, icon, children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'}`}
    >
      <span className={active ? 'text-white' : 'text-gray-500'}>{icon}</span>
      <span>{children}</span>
    </button>
  );
};

const CheckboxSetting = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={label.replace(/\s+/g, '')}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={label.replace(/\s+/g, '')} className="font-medium text-gray-700">{label}</label>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default Settings;
