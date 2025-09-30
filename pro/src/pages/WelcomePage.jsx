import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDatabase, FaCode, FaFileCode, FaChartLine } from 'react-icons/fa';
import { BsDiagram3Fill } from 'react-icons/bs';

// Tailwind CSS
const styles = {
  wrapper: "bg-gradient-to-br from-teal-600 to-teal-800 text-white min-h-screen p-8",
  container: "max-w-screen-xl mx-auto",
  header: "text-4xl font-bold mb-8 text-center text-white",
  subheader: "text-xl text-teal-100 mb-12 text-center max-w-2xl mx-auto",
  section: "mb-16",
  sectionTitle: "text-2xl font-bold mb-6 text-teal-100 border-b border-teal-500 pb-2",
  card: "bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-lg hover:bg-opacity-15 transition-all duration-300 flex items-start",
  cardTitle: "text-xl font-medium mb-2 text-teal-100",
  cardContent: "text-teal-100 opacity-80",
  cardIcon: "text-teal-300 mr-4 mt-1",
  button: "mt-2 text-teal-300 hover:text-white transition-colors duration-200 inline-flex items-center",
  footer: "text-center text-teal-400 text-sm mt-12 pt-6 border-t border-teal-700",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  highlight: "font-semibold text-yellow-300",
  gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-green-200 font-bold",
};

const WelcomePage = ({ onStart }) => {
  return (
    <motion.div 
      className={styles.wrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.container}>
        <motion.h1 
          className={styles.header}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to <span className={styles.gradientText}>SP Generator Pro</span>
        </motion.h1>
        
        <motion.p 
          className={styles.subheader}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          A powerful tool for database developers to generate high-quality stored procedures, 
          explore database schemas, and simplify database development workflows.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mb-16"
        >
          <button 
            onClick={onStart}
            className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started
          </button>
        </motion.div>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.grid}>
            <FeatureCard 
              title="Advanced Stored Procedures"
              icon={<FaCode className="text-3xl" />}
              delay={0.8}
            >
              Generate complex stored procedures with support for analytics, reporting, dynamic searches, and more.
            </FeatureCard>
            
            <FeatureCard 
              title="Visual Database Explorer"
              icon={<FaDatabase className="text-3xl" />}
              delay={1.0}
            >
              Explore your database schema, relationships, and table structures with an intuitive visual interface.
            </FeatureCard>
            
            <FeatureCard 
              title="Code Generation"
              icon={<FaFileCode className="text-3xl" />}
              delay={1.2}
            >
              Generate ASP.NET MVC controllers, views, and models directly from your database structure.
            </FeatureCard>
            
            <FeatureCard 
              title="Analytical Insights"
              icon={<FaChartLine className="text-3xl" />}
              delay={1.4}
            >
              Gain insights into your database structure, identify optimization opportunities, and visualize relationships.
            </FeatureCard>
          </div>
        </div>
        
        <motion.div 
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          SP Generator Pro — Making database development more efficient
        </motion.div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ title, children, icon, delay }) => {
  return (
    <motion.div
      className={styles.card}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className={styles.cardIcon}>
        {icon}
      </div>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardContent}>{children}</p>
      </div>
    </motion.div>
  );
};

export default WelcomePage;
