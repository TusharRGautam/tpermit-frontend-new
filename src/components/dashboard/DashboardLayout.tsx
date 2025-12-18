import React from 'react';
import { Link, useLocation, Routes, Route, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import DashboardHome from './DashboardHome';
import QuotationCreationPage from './QuotationCreationPage';
import QuotationList from './QuotationList';
import ShowroomManagement from './ShowroomManagement';
import BookingRelations from './BookingRelations';
import PaymentReceipt from './PaymentReceipt';
import ReceiptList from './ReceiptList';
import BookingOrder from './BookingOrder';
import BookingOrderList from './BookingOrderList';
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
          <div className="logo-icon">🚗</div>
          <div className="logo-text">
            <h2>GAUTAM MOTORS</h2>
            <span className="logo-subtitle">Admin Portal</span>
          </div>
        </div>
        <nav className="dashboard-nav">
          <div className="nav-section">
            <div className="nav-section-title">MAIN</div>
            <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
              <span className="nav-icon">📊</span>
              <span className="nav-text">Overview</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">QUOTATIONS</div>
            <Link to="/dashboard/quotation" className={`nav-item ${isActive('/dashboard/quotation')}`}>
              <span className="nav-icon">✏️</span>
              <span className="nav-text">New Quotation</span>
            </Link>
            <Link to="/dashboard/quotations" className={`nav-item ${isActive('/dashboard/quotations')}`}>
              <span className="nav-icon">📄</span>
              <span className="nav-text">All Quotations</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">PAYMENTS</div>
            <Link to="/dashboard/receipt/new" className={`nav-item ${isActive('/dashboard/receipt/new')}`}>
              <span className="nav-icon">💳</span>
              <span className="nav-text">New Receipt</span>
            </Link>
            <Link to="/dashboard/receipts" className={`nav-item ${isActive('/dashboard/receipts')}`}>
              <span className="nav-icon">📋</span>
              <span className="nav-text">All Receipts</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">BOOKING ORDERS</div>
            <Link to="/dashboard/booking-order/new" className={`nav-item ${isActive('/dashboard/booking-order/new')}`}>
              <span className="nav-icon">📝</span>
              <span className="nav-text">New Booking Order</span>
            </Link>
            <Link to="/dashboard/booking-orders" className={`nav-item ${isActive('/dashboard/booking-orders')}`}>
              <span className="nav-icon">📋</span>
              <span className="nav-text">All Booking Orders</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">MANAGEMENT</div>
            <Link to="/dashboard/showrooms" className={`nav-item ${isActive('/dashboard/showrooms')}`}>
              <span className="nav-icon">🏢</span>
              <span className="nav-text">Showrooms</span>
            </Link>
            <Link to="/dashboard/cars" className={`nav-item ${isActive('/dashboard/cars')}`}>
              <span className="nav-icon">🚙</span>
              <span className="nav-text">Vehicles</span>
            </Link>
            <Link to="/dashboard/booking-relations" className={`nav-item ${isActive('/dashboard/booking-relations')}`}>
              <span className="nav-icon">🔗</span>
              <span className="nav-text">Booking Relations</span>
            </Link>
          </div>

          <div className="nav-section nav-section-bottom">
            <Link to="/" className="nav-item">
              <span className="nav-icon">🌐</span>
              <span className="nav-text">Visit Website</span>
            </Link>
          </div>
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
            <Route path="/receipt/new" element={<PaymentReceipt />} />
            <Route path="/receipts" element={<ReceiptList />} />
            <Route path="/booking-order/new" element={<BookingOrder />} />
            <Route path="/booking-orders" element={<BookingOrderList />} />
            <Route path="/showrooms" element={<ShowroomManagement />} />
            <Route path="/booking-relations" element={<BookingRelations />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 