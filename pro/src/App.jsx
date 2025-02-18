import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
// Pages
import DatabaseMetadataPage from './pages/DatabaseMetadataPage';
import ConnectionPage from './pages/ConnectionPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main connection/home page */}
        <Route path="/" element={<ConnectionPage />} />
        
        {/* Database explorer and SP generator */}
        <Route path="/database" element={<DatabaseMetadataPage />} />
        
        {/* Redirect legacy routes if any */}
        <Route path="/explorer" element={<Navigate to="/database" replace />} />
        
        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
