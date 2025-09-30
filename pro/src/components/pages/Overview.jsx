import React from 'react';
import { motion } from 'framer-motion';
import { FaDatabase, FaTable, FaCode, FaFileCode, FaChartLine } from 'react-icons/fa';
import { BsDiagram3Fill } from 'react-icons/bs';

const Overview = ({ metadata = {}, setActivePage }) => {
  // Ensure metadata is an object and has valid structure
  const safeMetadata = metadata || {};

  const databaseStats = {
    tables: Object.keys(safeMetadata).length,
    columns: Object.values(safeMetadata).reduce((acc, table) => {
      return acc + (table && table.Columns ? table.Columns.length : 0);
    }, 0),
    primaryKeys: Object.values(safeMetadata).reduce((acc, table) => {
      return acc + (table && table.PrimaryKeys ? table.PrimaryKeys.length : 0);
    }, 0),
    foreignKeys: Object.values(safeMetadata).reduce((acc, table) => {
      return acc + (table && table.ForeignKeys ? table.ForeignKeys.length : 0);
    }, 0),
  };

  const cards = [
    {
      id: 'database-explorer',
      title: 'Database Explorer',
      description: 'Browse tables, columns, and relationships',
      icon: <FaTable className="text-4xl text-teal-500" />,
      color: 'from-teal-500 to-teal-600',
    },
    {
      id: 'stored-procedures',
      title: 'Stored Procedures',
      description: 'Generate SQL stored procedures with various options',
      icon: <FaCode className="text-4xl text-indigo-500" />,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      id: 'mvc-generator',
      title: 'MVC Generator',
      description: 'Create ASP.NET MVC models, views, and controllers',
      icon: <FaFileCode className="text-4xl text-blue-500" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Visualize database statistics and relationships',
      icon: <FaChartLine className="text-4xl text-purple-500" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'diagram',
      title: 'ER Diagram',
      description: 'Interactive entity relationship diagrams',
      icon: <BsDiagram3Fill className="text-4xl text-green-500" />,
      color: 'from-green-500 to-green-600',
    },
  ];

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
                <FaDatabase className="text-3xl text-yellow-100" />
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
                    Dashboard Overview
                  </span>
                </h3>
                <div className="relative ml-3">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-md blur-sm"></span>
                  <span className="relative px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-md border border-white/30">v2.0</span>
                </div>
              </div>
              <p className="text-blue-100 font-light">
                Database structure summary and feature navigation
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="overflow-y-auto p-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-teal-800 mb-2">Welcome to SP Generator</h1>
          <p className="text-gray-600 mb-8">
            A comprehensive toolkit for database management, stored procedure generation, and code scaffolding
          </p>
        </motion.div>

          {/* Database Stats */}
          <motion.div
            className="grid grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Tables</h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-teal-700">{databaseStats.tables}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Columns</h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-teal-700">{databaseStats.columns}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Primary Keys</h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-teal-700">{databaseStats.primaryKeys}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Foreign Keys</h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-teal-700">{databaseStats.foreignKeys}</span>
              </div>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => typeof setActivePage === 'function' ? setActivePage(card.id) : console.warn('setActivePage is not a function')}
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                <div className="p-6">
                  <div className="mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-4">
                  <span className="text-teal-700 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Select a table</h3>
                  <p className="text-gray-600 text-sm">Choose a table from the sidebar to view its structure</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-4">
                  <span className="text-teal-700 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Explore table details</h3>
                  <p className="text-gray-600 text-sm">View columns, data types, relationships, and more</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-4">
                  <span className="text-teal-700 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Generate code</h3>
                  <p className="text-gray-600 text-sm">Create stored procedures or MVC components with a few clicks</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-4">
                  <span className="text-teal-700 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Export or copy</h3>
                  <p className="text-gray-600 text-sm">Use the generated code in your projects</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
