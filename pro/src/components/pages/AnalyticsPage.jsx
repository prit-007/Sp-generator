import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaChartBar, FaChartArea, FaChartPie, FaTable } from 'react-icons/fa';

const AnalyticsPage = ({ metadata, activeTable }) => {
  if (!activeTable) {
    return (
      <div className="h-full flex flex-col">
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
                  <FaChartLine className="text-3xl text-yellow-100" />
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
                      Analytics Dashboard
                    </span>
                  </h3>
                  <div className="relative ml-3">
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                    <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                  </div>
                </div>
                <p className="text-blue-100 font-light">
                  Choose a table from the sidebar to analyze its data
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <FaChartLine className="mx-auto text-5xl text-teal-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Select a Table</h2>
            <p className="text-gray-500">
              Choose a table from the sidebar to analyze its data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder data for demonstration
  const columnStats = metadata[activeTable].Columns.map(col => ({
    name: col.Name,
    type: col.Type,
    nullPercentage: Math.floor(Math.random() * 30),
    distinctValues: Math.floor(Math.random() * 100) + 1,
    avgLength: col.Type.includes('char') ? Math.floor(Math.random() * col.MaxLength) + 1 : null
  }));

  return (
    <div className="h-full flex flex-col">
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
                <FaChartLine className="text-3xl text-yellow-100" />
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
                    {activeTable} Analytics
                  </span>
                </h3>
                <div className="relative ml-3">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                  <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                </div>
              </div>
              <p className="text-blue-100 font-light">
                Statistical insights and analysis for the {activeTable} table
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="p-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-teal-800 flex items-center">
          <FaChartLine className="mr-2 text-teal-600" />
          Data Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Table: <span className="font-medium text-teal-600">{activeTable}</span>
        </p>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-purple-100">Columns</h3>
                <FaTable className="text-2xl text-purple-200" />
              </div>
              <p className="text-3xl font-bold mt-2">{metadata[activeTable].Columns.length}</p>
              <p className="text-sm text-purple-200 mt-1">Total columns in table</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-sm p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-teal-100">Data Types</h3>
                <FaChartPie className="text-2xl text-teal-200" />
              </div>
              <p className="text-3xl font-bold mt-2">{new Set(metadata[activeTable].Columns.map(col => col.Type)).size}</p>
              <p className="text-sm text-teal-200 mt-1">Unique data types</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-indigo-100">Nullable</h3>
                <FaChartBar className="text-2xl text-indigo-200" />
              </div>
              <p className="text-3xl font-bold mt-2">{metadata[activeTable].Columns.filter(col => col.IsNullable).length}</p>
              <p className="text-sm text-indigo-200 mt-1">Columns allowing NULL values</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-sm p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-rose-100">Relations</h3>
                <FaChartArea className="text-2xl text-rose-200" />
              </div>
              <p className="text-3xl font-bold mt-2">{metadata[activeTable].ForeignKeys ? metadata[activeTable].ForeignKeys.length : 0}</p>
              <p className="text-sm text-rose-200 mt-1">Foreign key relationships</p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Column Statistics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NULL %</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distinct Values</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Length</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {columnStats.map((stat, index) => (
                    <tr key={stat.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${stat.nullPercentage > 20 ? 'bg-yellow-500' : 'bg-teal-500'}`} 
                              style={{ width: `${stat.nullPercentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-gray-500">{stat.nullPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.distinctValues}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.avgLength !== null ? stat.avgLength : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-700">
              This feature is coming soon with real data analysis. The statistics shown are placeholders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
