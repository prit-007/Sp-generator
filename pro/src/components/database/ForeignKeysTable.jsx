import React from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaArrowRight, FaDatabase, FaKey, FaExternalLinkAlt } from "react-icons/fa";

const ForeignKeysTable = ({ activeTable, metadata }) => {
    if (!metadata[activeTable].ForeignKeys.length) {
        return (
            <motion.div 
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg border border-slate-200 p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                >
                    <FaLink className="text-3xl text-slate-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Foreign Key Relationships</h3>
                <p className="text-slate-500">This table doesn't have any foreign key constraints defined.</p>
            </motion.div>
        );
    }
    
    return (
        <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <motion.div 
                className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <motion.div 
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FaLink className="text-2xl" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold">Foreign Key Relationships</h3>
                            <p className="text-purple-200 text-sm">External table connections for {activeTable}</p>
                        </div>
                    </div>
                    <motion.div 
                        className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="text-lg font-bold">{metadata[activeTable].ForeignKeys.length}</span>
                        <span className="text-sm text-purple-200 ml-1">relations</span>
                    </motion.div>
                </div>
            </motion.div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <FaKey className="text-purple-500" />
                                    <span>Local Column</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                <div className="flex items-center justify-center space-x-2">
                                    <FaArrowRight className="text-slate-400" />
                                    <span>Relationship</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <FaDatabase className="text-indigo-500" />
                                    <span>Referenced Table</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <FaExternalLinkAlt className="text-teal-500" />
                                    <span>Referenced Column</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {metadata[activeTable].ForeignKeys.map((fk, index) => (
                            <motion.tr 
                                key={index} 
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-purple-50 transition-all duration-300`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                whileHover={{ x: 5, scale: 1.01 }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <motion.div 
                                            className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <FaKey className="text-purple-600 text-sm" />
                                        </motion.div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{fk.ColumnName}</div>
                                            <div className="text-xs text-slate-500">Local key</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <motion.div 
                                        className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FaArrowRight className="text-purple-500 text-xs" />
                                        <span className="text-xs font-medium text-purple-700">REFERENCES</span>
                                    </motion.div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <motion.div 
                                            className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center"
                                            whileHover={{ scale: 1.1, rotate: -5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <FaDatabase className="text-indigo-600 text-sm" />
                                        </motion.div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{fk.ReferencedTable}</div>
                                            <div className="text-xs text-slate-500">External table</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <motion.div 
                                            className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <FaExternalLinkAlt className="text-teal-600 text-sm" />
                                        </motion.div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{fk.ReferencedColumn}</div>
                                            <div className="text-xs text-slate-500">Target column</div>
                                        </div>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <motion.div 
                className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>These relationships enable data integrity and join operations</span>
                    </div>
                    <div className="text-xs text-slate-500">
                        {metadata[activeTable].ForeignKeys.length} foreign key{metadata[activeTable].ForeignKeys.length !== 1 ? 's' : ''} defined
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ForeignKeysTable;  