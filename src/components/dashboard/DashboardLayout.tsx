import React from 'react';
import { Link, useLocation, Routes, Route, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import DashboardHome from './DashboardHome';
import QuotationCreationPage from './QuotationCreationPage';
import QuotationList from './QuotationList';
import apiService from '../../services/apiService';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      // Call logout endpoint using API service
      await apiService.logout();
      console.log('Logout API call successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('aswSessionToken');
      localStorage.removeItem('aswUser');
      
      console.log('Cleared session data, redirecting to login...');
      // Redirect to login
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>ASW Admin</h2>
        </div>
        <nav className="dashboard-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/quotation" className={`nav-item ${isActive('/dashboard/quotation')}`}>
            <span className="nav-icon">📝</span>
            <span>Create Quotation</span>
          </Link>
          <Link to="/dashboard/quotations" className={`nav-item ${isActive('/dashboard/quotations')}`}>
            <span className="nav-icon">📄</span>
            <span>Manage Quotations</span>
          </Link>
          <Link to="/dashboard/cars" className={`nav-item ${isActive('/dashboard/cars')}`}>
            <span className="nav-icon">🚗</span>
            <span>Cars</span>
          </Link>
          <Link to="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>Back to Site</span>
          </Link>
        </nav>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <span>Admin</span>
            <button className="logout-button" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
        <div className="dashboard-main-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/quotation" element={<QuotationCreationPage />} />
            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/quotation/edit/:id" element={<QuotationCreationPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 