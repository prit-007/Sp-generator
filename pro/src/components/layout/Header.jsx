import React from 'react';
import { FaDatabase, FaSync, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = ({ onRefresh }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white shadow-md p-4">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <FaDatabase className="text-teal-600 text-xl mr-2" />
          <h1 className="text-xl font-semibold text-teal-800">Database SP Generator</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onRefresh} 
            className="flex items-center px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition duration-200"
          >
            <FaSync className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition duration-200"
          >
            <FaCog className="mr-2" />
            Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;