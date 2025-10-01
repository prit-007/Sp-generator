import React, { Fragment } from 'react';
import { FaDatabase, FaSync, FaCog, FaLink, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../contexts/ConnectionContext';
import { Menu, Transition } from '@headlessui/react';

const Header = ({ onRefresh, onChangeConnection }) => {
  const navigate = useNavigate();
  const { activeConnection, clearActiveConnection } = useConnection();
  
  return (
    <div className="bg-white shadow-md py-3 px-4">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-teal-600 text-white p-2 rounded-lg mr-3">
            <FaDatabase className="text-xl" />
          </div>
          <h1 className="text-xl font-title tracking-wider text-teal-800">
            <span>Database </span>
            <span className="text-teal-600 font-bold">SP</span>
            <span className="text-orange-500 italic">Generator</span>
          </h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onRefresh} 
            className="flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition duration-200 shadow-sm"
          >
            <FaSync className="mr-2" />
            Refresh
          </button>
          
          {/* Connection dropdown menu */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition duration-200 shadow-sm">
                <FaLink className="mr-2" />
                Connection
                <FaChevronDown className="ml-2 -mr-1 h-3 w-3" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onChangeConnection || (() => navigate('/connect'))}
                        className={`${
                          active ? 'bg-teal-500 text-white' : 'text-gray-900'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <FaLink className="mr-2 h-4 w-4" />
                        Change Connection
                      </button>
                    )}
                  </Menu.Item>
                  {activeConnection && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            clearActiveConnection();
                            navigate('/connect');
                          }}
                          className={`${
                            active ? 'bg-red-500 text-white' : 'text-gray-900'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          <FaSignOutAlt className="mr-2 h-4 w-4" />
                          Disconnect
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;