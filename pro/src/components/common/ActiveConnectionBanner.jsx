import React from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useConnection } from '../../contexts/ConnectionContext';
import { useNavigate } from 'react-router-dom';

const ActiveConnectionBanner = ({ onClose }) => {
  const { activeConnection, clearActiveConnection } = useConnection();
  const navigate = useNavigate();

  if (!activeConnection) {
    return null;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4"
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <FaLink className="mr-3 text-xl" />
          <div>
            <h2 className="text-lg font-semibold">Active Connection</h2>
            <p className="text-sm text-blue-100 truncate max-w-md">{activeConnection}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              clearActiveConnection();
              toast.success("Disconnected from database successfully");
              navigate('/connect');
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
          >
            Disconnect
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600/40 hover:bg-blue-700/40 text-white p-2 rounded-md transition-colors duration-150"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveConnectionBanner;