import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ConnectionStringModal = ({ isOpen, onClose, onConnect }) => {
  const [activeTab, setActiveTab] = useState("full");
  const [connectionString, setConnectionString] = useState("");
  
  // Component-wise state
  const [server, setServer] = useState("");
  const [database, setDatabase] = useState("");
  const [useIntegratedSecurity, setUseIntegratedSecurity] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [trustServerCertificate, setTrustServerCertificate] = useState(true);
  const [additionalParams, setAdditionalParams] = useState("");

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle full connection string input change
  const handleInputChange = (e) => {
    setConnectionString(e.target.value);
  };

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Determine which connection string to use
    const finalConnectionString = 
      activeTab === "full" ? connectionString : buildConnectionString();
    
    if (!finalConnectionString || 
        (activeTab === "component" && (!server || !database))) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter the required connection information!",
      });
      return;
    }

    try {
      // Connect using the onConnect prop
      onConnect(finalConnectionString);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while checking the connection.",
      });
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-teal-800">
          Connect to Database
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex mb-4 border-b border-teal-100">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "full"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-teal-500"
            }`}
            onClick={() => handleTabChange("full")}
          >
            Full Connection String
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "component"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-teal-500"
            }`}
            onClick={() => handleTabChange("component")}
          >
            Component Builder
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {activeTab === "full" ? (
            <div className="mb-4">
              <label
                htmlFor="connectionString"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your SQL Connection String:
              </label>
              <textarea
                id="connectionString"
                value={connectionString}
                onChange={handleInputChange}
                placeholder="e.g., Data Source=myServerAddress;Initial Catalog=myDataBase;User Id=myUsername;Password=myPassword;"
                className="w-full px-4 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="3"
              />
              <p className="mt-2 text-sm text-gray-500">
                Example: Data Source=PRITS-LEGION;Initial Catalog=RidingApp;Integrated Security=true;TrustServerCertificate=True
              </p>
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
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-teal-700 hover:text-teal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200"
              onClick={handleSubmit}
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionStringModal;