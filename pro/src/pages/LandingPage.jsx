import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaDatabase, FaCode, FaList, FaCubes, FaBolt, 
  FaLaptopCode, FaRocket, FaUserShield, FaGlobe,
  FaSave, FaFileCode, FaCogs
} from 'react-icons/fa';

const LandingPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  const fadeInUpVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  // Features data
  const features = [
    {
      title: "Smart Stored Procedures",
      description: "Generate optimized CRUD stored procedures with just a few clicks",
      icon: <FaCode className="text-indigo-500" />
    },
    {
      title: "Model Generation",
      description: "Create C# models from your database tables automatically",
      icon: <FaCubes className="text-green-500" />
    },
    {
      title: "MVC Scaffolding",
      description: "Build controllers and views to match your database structure",
      icon: <FaLaptopCode className="text-blue-500" />
    },
    {
      title: "SQL Optimization",
      description: "Generate highly optimized SQL code with proper indexing",
      icon: <FaBolt className="text-yellow-500" />
    },
    {
      title: "Secure By Design",
      description: "All connection strings are properly encrypted for security",
      icon: <FaUserShield className="text-red-500" />
    },
    {
      title: "Cross Database Support",
      description: "Works with SQL Server databases of all sizes",
      icon: <FaDatabase className="text-purple-500" />
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50">
      {/* Hero Section */}
      <motion.div 
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="mx-auto max-w-3xl"
          variants={itemVariants}
        >
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          >
            <div className="p-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg">
              <FaDatabase className="text-white text-5xl" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4 sm:text-6xl"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
              SQL Generator Tool
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
            variants={itemVariants}
          >
            Streamline your database development workflow with powerful, automated code generation for stored procedures, models, and more.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={itemVariants}
          >
            <Link to="/connect">
              <motion.button 
                className="px-8 py-4 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-200 flex items-center justify-center font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaRocket className="mr-2" /> Get Started
              </motion.button>
            </Link>
            <a href="https://github.com/your-username/sp-generator-tool" target="_blank" rel="noopener noreferrer">
              <motion.button 
                className="px-8 py-4 bg-white text-teal-600 border border-teal-200 rounded-lg shadow-sm hover:bg-teal-50 transition duration-200 flex items-center justify-center font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGlobe className="mr-2" /> Learn More
              </motion.button>
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Features Section */}
      <motion.div 
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUpVariants}
      >
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            variants={fadeInUpVariants}
          >
            Powerful Features to <span className="text-teal-600">Accelerate Your Workflow</span>
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-xl text-gray-600"
            variants={fadeInUpVariants}
          >
            Our SQL Generator Tool offers everything you need to work with databases efficiently.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      
      {/* How It Works Section */}
      <motion.div 
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl my-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUpVariants}
      >
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            variants={fadeInUpVariants}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-xl text-gray-600"
            variants={fadeInUpVariants}
          >
            Simple, efficient, and powerful in just three steps
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 mx-auto mb-4">
              <FaDatabase className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">Connect to your SQL Server database with a secure connection string</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4">
              <FaList className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select</h3>
            <p className="text-gray-600">Choose tables and customize the code generation options</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <FaFileCode className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generate</h3>
            <p className="text-gray-600">Get your stored procedures, models, and controllers instantly</p>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* CTA Section */}
      <motion.div 
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUpVariants}
      >
        <motion.div 
          className="py-12 px-8 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-xl"
          variants={fadeInUpVariants}
        >
          <motion.h2 
            className="text-3xl font-bold text-white mb-4 sm:text-4xl"
            variants={fadeInUpVariants}
          >
            Ready to supercharge your database workflow?
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-xl text-teal-100 mb-8"
            variants={fadeInUpVariants}
          >
            Stop writing repetitive database code. Start using our powerful generator today.
          </motion.p>
          <Link to="/database">
            <motion.button 
              className="px-8 py-4 bg-white text-teal-600 rounded-lg shadow-md hover:bg-teal-50 transition duration-200 flex items-center justify-center font-medium mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeInUpVariants}
            >
              <FaCogs className="mr-2" /> Start Generating Code
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <FaDatabase className="text-teal-400 text-2xl mr-2" />
                <span className="text-xl font-bold">SQL Generator Tool</span>
              </div>
              <p className="text-gray-400 mt-2">Streamline your database development workflow</p>
            </div>
            <div className="flex flex-col space-y-2">
              <a href="#" className="text-gray-300 hover:text-teal-400 transition duration-200">Documentation</a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition duration-200">GitHub Repository</a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition duration-200">Report Issues</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SQL Generator Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;