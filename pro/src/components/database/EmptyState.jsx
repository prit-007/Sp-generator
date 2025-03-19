import { FaTable } from "react-icons/fa";
import { motion } from "framer-motion";

const EmptyState = () => (
  <div className="flex flex-col items-center bg-gradient-to-b5r from-white to-teal-50">

    <motion.div
      className=" justify-center h-full text-teal-800 bg-gradient-to-b5r from-teal-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-12 rounded-xl shadow-lg text-center max-w-md border border-teal-100 transform transition-all hover:scale-105 hover:shadow-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="text-7xl mb-6 text-teal-400 mx-auto"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaTable />
        </motion.div>
        <h3 className="text-2xl font-semibold mb-3 text-teal-900">
          Select a table to view details
        </h3>
        <p className="text-teal-600 mb-6">
          Choose a table from the list on the left to explore its structure
        </p>
        <motion.button
          className="bg-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Refresh Tables
        </motion.button>
      </motion.div>
    </motion.div>
  </div>
);

export default EmptyState;