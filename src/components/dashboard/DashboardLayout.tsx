import React from 'react';
import { Link, useLocation, Routes, Route, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './DashboardSidebar.css';
import './DashboardFullWidth.css';
import DashboardHome from './DashboardHome';
import QuotationCreationPage from './QuotationCreationPage';
import QuotationList from './QuotationList';
import ShowroomManagement from './ShowroomManagement';
import BookingRelations from './BookingRelations';
import PaymentReceipt from './PaymentReceipt';
import ReceiptList from './ReceiptList';
import BookingOrder from './BookingOrder';
import BookingOrderList from './BookingOrderList';
import AllDocuments from './AllDocuments';
import ProformaInvoice from './ProformaInvoice';
import UnifiedBookingFlow from './UnifiedBookingFlow';
import AllLeads from './AllLeads';
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
    <div className="dashboard-layout no-sidebar">
      {/* Sidebar hidden - all navigation in Quick Actions */}

      <div className="dashboard-content full-width">
        <div className="dashboard-header">
          <div className="header-left">
            <Link to="/" className="dashboard-logo-header" style={{ textDecoration: 'none' }}>
              <span className="logo-icon">🚗</span>
              <div className="logo-text">
                <h2>GAUTAM MOTORS</h2>
                <span className="logo-subtitle">Admin Portal</span>
              </div>
            </Link>
          </div>
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
            <Route path="/all-documents" element={<AllDocuments />} />
            <Route path="/quotation" element={<QuotationCreationPage />} />
            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/quotation/edit/:id" element={<QuotationCreationPage />} />
            <Route path="/unified-entry" element={<UnifiedBookingFlow />} />
            <Route path="/booking-order" element={<BookingOrder />} />
            <Route path="/receipt" element={<PaymentReceipt />} />
            <Route path="/showrooms" element={<ShowroomManagement />} />
            <Route path="/booking-relations" element={<BookingRelations />} />
            <Route path="/reciept/proforma-invoice" element={<ProformaInvoice />} />
            <Route path="/leads" element={<AllLeads />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 