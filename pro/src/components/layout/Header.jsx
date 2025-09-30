import React from 'react';
import { FaDatabase, FaSync, FaCog, FaLink } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = ({ onRefresh, onChangeConnection }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white shadow-md py-3 px-4">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-teal-600 text-white p-2 rounded-lg mr-3">
            <FaDatabase className="text-xl" />
          </div>
          <h1 className="text-xl font-semibold text-teal-800">Database SP Generator</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onRefresh} 
            className="flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition duration-200 shadow-sm"
          >
            <FaSync className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={onChangeConnection || (() => navigate('/'))}
            className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition duration-200 shadow-sm"
          >
            <FaLink className="mr-2" />
            Change Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;