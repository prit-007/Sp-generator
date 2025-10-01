import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaDatabase, FaTable, FaFileCode, FaCode, FaChartBar, 
         FaNetworkWired, FaChevronRight } from 'react-icons/fa';

/**
 * Breadcrumbs component that displays the navigation path
 * 
 * @param {Object} props - The component props
 * @param {Array} props.items - Array of breadcrumb items with label and icon properties
 * @param {Function} props.onNavigate - Function to call when a breadcrumb item is clicked
 */
const Breadcrumbs = ({ items = [], onNavigate }) => {
  // Icon mapping to use appropriate icons for each page/tab
  const getIcon = (icon) => {
    switch(icon) {
      case 'home': return <FaHome className="text-blue-500" />;
      case 'database': return <FaDatabase className="text-blue-500" />;
      case 'table': return <FaTable className="text-blue-500" />;
      case 'file': return <FaFileCode className="text-blue-500" />;
      case 'code': return <FaCode className="text-blue-500" />;
      case 'chart': return <FaChartBar className="text-blue-500" />;
      case 'diagram': return <FaNetworkWired className="text-blue-500" />;
      default: return null;
    }
  };

  return (
    <nav className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm mb-4 backdrop-blur-sm bg-opacity-80">
      <div className="flex items-center space-x-2 px-1 py-1 overflow-x-auto no-scrollbar">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <FaChevronRight className="text-gray-400 text-xs flex-shrink-0" />}
            
            {index === items.length - 1 ? (
              // Last item (current location) - not clickable
              <motion.span 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-blue-600 text-sm font-medium flex items-center bg-blue-50 px-2 py-1 rounded-md flex-shrink-0"
              >
                {item.icon && <span className="mr-1">{getIcon(item.icon)}</span>}
                {item.label}
              </motion.span>
            ) : (
              // Clickable breadcrumb
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate && onNavigate(item.path)}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium flex items-center px-2 py-1 rounded-md transition-colors flex-shrink-0"
              >
                {item.icon && <span className="mr-1">{getIcon(item.icon)}</span>}
                {item.label}
              </motion.button>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;