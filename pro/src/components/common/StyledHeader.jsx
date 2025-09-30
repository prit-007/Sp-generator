import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCog, FaDatabase, FaHome, FaSignOutAlt } from 'react-icons/fa';

const StyledHeader = ({ title, subtitle, icon }) => {
  console.log('Rendering StyledHeader with title:', title);
  console.log('Rendering StyledHeader with subtitle:', subtitle);
  console.log('Rendering StyledHeader with icon:', icon);

  return (
    <motion.header 
      className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-5 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <motion.h1 
            className="text-3xl font-bold flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {icon || <FaDatabase className="mr-3 text-teal-300" />} {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className="text-teal-100 mt-2 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/"
            className="text-teal-100 hover:text-white flex items-center"
          >
            <FaHome className="mr-1" />
            <span className="hidden md:inline">Home</span>
          </Link>
          
          <Link 
            to="/settings"
            className="text-teal-100 hover:text-white flex items-center"
          >
            <FaCog className="mr-1" />
            <span className="hidden md:inline">Settings</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default StyledHeader;
