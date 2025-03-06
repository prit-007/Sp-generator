import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDatabase, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ConnectionPage = () => {
  const [connections, setConnections] = useState([]);
  const [newConnectionString, setNewConnectionString] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('full'); // 'full' or 'component'
  const [server, setServer] = useState('');
  const [database, setDatabase] = useState('');
  const [useIntegratedSecurity, setUseIntegratedSecurity] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [trustServerCertificate, setTrustServerCertificate] = useState(true);
  const [additionalParams, setAdditionalParams] = useState('');
  const navigate = useNavigate();

  // Load saved connections from localStorage on component mount
  useEffect(() => {
    const savedConnections = localStorage.getItem('dbConnections');
    if (savedConnections) {
      setConnections(JSON.parse(savedConnections));
    }
  }, []);

  // Save connections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dbConnections', JSON.stringify(connections));
  }, [connections]);

  // Build connection string from components
  const buildConnectionString = () => {
    let connStr = `Data Source=${server};Initial Catalog=${database};`;
    
    if (useIntegratedSecurity) {
      connStr += "Integrated Security=true;";
    } else if (userId) {
      connStr += `User Id=${userId};Password=${password};`;
    }
    
    connStr += `TrustServerCertificate=${trustServerCertificate};`;
    
    if (additionalParams) {
      connStr += additionalParams;
    }
    
    return connStr;
  };

  const handleAddConnection = () => {
    let finalConnectionString = newConnectionString;

    if (activeTab === 'component') {
      if (!server || !database) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Server and Database are required!',
        });
        return;
      }
      finalConnectionString = buildConnectionString();
    }

    if (!finalConnectionString || !connectionName) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Connection name and connection string are required!',
      });
      return;
    }

    const newConnection = {
      name: connectionName,
      connectionString: finalConnectionString,
    };

    if (editIndex >= 0) {
      // Update existing connection
      const updatedConnections = [...connections];
      updatedConnections[editIndex] = newConnection;
      setConnections(updatedConnections);
      setEditIndex(-1);
    } else {
      // Add new connection
      setConnections([...connections, newConnection]);
    }

    // Reset form
    setNewConnectionString('');
    setConnectionName('');
    setServer('');
    setDatabase('');
    setUseIntegratedSecurity(false);
    setUserId('');
    setPassword('');
    setAdditionalParams('');
  };

  const handleEditConnection = (index) => {
    const connection = connections[index];
    setConnectionName(connection.name);
    setNewConnectionString(connection.connectionString);
    setEditIndex(index);
  };

  const handleDeleteConnection = (index) => {
    const updatedConnections = connections.filter((_, i) => i !== index);
    setConnections(updatedConnections);
  };

  const handleConnect =async (connectionString) => {
    try{
      const connection = await axios.post(`${API_URL}/Database/connect`,{connectionString: connectionString})
      if (connection.status === 200){
        console.log(connection.data.message)
        Swal.fire({
          title:'Connection established',
          text:connection.data.message,
          timer: 2000,
        })
        navigate(`/database`);
      }
    }
    catch(ex){
      console.log(ex)
    }
  };

  return (
    <div className="min-h-screen bg-teal-50">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <div className="flex items-center mb-8">
          <FaDatabase className="text-teal-600 text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-teal-800">Database SP Generator</h1>
        </div>

        {/* Connection form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">
            {editIndex >= 0 ? 'Edit Connection' : 'Add New Connection'}
          </h2>

          {/* Tab Navigation */}
          <div className="flex mb-4 border-b border-teal-100">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'full'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-teal-500'
              }`}
              onClick={() => setActiveTab('full')}
            >
              Full Connection String
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'component'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-teal-500'
              }`}
              onClick={() => setActiveTab('component')}
            >
              Component Builder
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-teal-700 font-medium mb-1">Connection Name</label>
              <input
                type="text"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Production DB"
              />
            </div>

            {activeTab === 'full' ? (
              <div>
                <label className="block text-teal-700 font-medium mb-1">Connection String</label>
                <textarea
                  value={newConnectionString}
                  onChange={(e) => setNewConnectionString(e.target.value)}
                  className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-20"
                  placeholder="e.g., Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Server/Data Source*
                    </label>
                    <input
                      type="text"
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                      placeholder="e.g., PRITS-LEGION"
                      className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Database/Initial Catalog*
                    </label>
                    <input
                      type="text"
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                      placeholder="e.g., RidingApp"
                      className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <input
                    id="integratedSecurity"
                    type="checkbox"
                    checked={useIntegratedSecurity}
                    onChange={(e) => setUseIntegratedSecurity(e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="integratedSecurity" className="ml-2 block text-sm text-gray-700">
                    Use Integrated Security
                  </label>
                </div>

                {!useIntegratedSecurity && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Username"
                        className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center mb-2">
                  <input
                    id="trustCertificate"
                    type="checkbox"
                    checked={trustServerCertificate}
                    onChange={(e) => setTrustServerCertificate(e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trustCertificate" className="ml-2 block text-sm text-gray-700">
                    Trust Server Certificate
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Parameters
                  </label>
                  <input
                    type="text"
                    value={additionalParams}
                    onChange={(e) => setAdditionalParams(e.target.value)}
                    placeholder="e.g., Encrypt=True;Connection Timeout=30;"
                    className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Generated Connection String:</p>
                  <div className="mt-1 p-2 bg-gray-100 rounded-lg text-sm font-mono break-all">
                    {buildConnectionString()}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAddConnection}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" />
              {editIndex >= 0 ? 'Update Connection' : 'Add Connection'}
            </button>
          </div>
        </div>

        {/* Saved connections */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Saved Connections</h2>
          
          {connections.length === 0 ? (
            <p className="text-teal-600 italic">No saved connections yet.</p>
          ) : (
            <div className="space-y-3">
              {connections.map((conn, index) => (
                <div 
                  key={index}
                  className="border border-teal-100 rounded-lg p-4 hover:bg-teal-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-teal-800">{conn.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditConnection(index)}
                        className="p-2 text-teal-600 hover:text-teal-800 transition-colors"
                        title="Edit connection"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(index)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete connection"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="text-teal-600 text-sm truncate mt-1">{conn.connectionString}</p>
                  <button
                    onClick={() => handleConnect(conn.connectionString)}
                    className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionPage;