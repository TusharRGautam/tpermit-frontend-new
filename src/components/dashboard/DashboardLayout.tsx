import React, { useState, useEffect } from 'react';
import { Link, useLocation, Routes, Route, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './DashboardSidebar.css';
import './DashboardFullWidth.css';
import DashboardHome from './DashboardHome';
import CarsManagement from './CarsManagement';
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
import BookingOrdersDownloadPage from './BookingOrdersDownloadPage';
import ReceiptsDownloadPage from './ReceiptsDownloadPage';
import ProformaInvoicesDownloadPage from './ProformaInvoicesDownloadPage';
import apiService from '../../services/apiService';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('aswSessionToken');
      localStorage.removeItem('aswUser');
      navigate('/login');
    }
  };

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="dashboard-backdrop" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Main Professional Sidebar */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand">
            <span className="brand-badge">GM</span>
            <div className="brand-text">
              <span className="brand-title">GAUTAM MOTORS</span>
              <span className="brand-sub">Admin Portal</span>
            </div>
          </Link>
          <button 
            type="button" 
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Sidebar"
          >
            &times;
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-group-title">MAIN</span>
            <Link 
              to="/dashboard" 
              className={`sidebar-nav-item ${location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/dashboard/cars" 
              className={`sidebar-nav-item ${location.pathname === '/dashboard/cars' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2M7 11h.01M17 11h.01"></path>
              </svg>
              <span>Show Cars</span>
              <span className="sidebar-pill">Fleet</span>
            </Link>

            <Link 
              to="/dashboard/leads" 
              className={`sidebar-nav-item ${isActive('/dashboard/leads')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Meta Leads</span>
              <span className="sidebar-pill crm">CRM</span>
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">QUOTATIONS</span>
            <Link 
              to="/dashboard/quotation" 
              className={`sidebar-nav-item ${location.pathname === '/dashboard/quotation' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>New Quotation</span>
            </Link>

            <Link 
              to="/dashboard/quotations" 
              className={`sidebar-nav-item ${location.pathname === '/dashboard/quotations' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>All Quotations</span>
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">DOWNLOADS & RECORDS</span>
            <Link 
              to="/dashboard/booking-orders" 
              className={`sidebar-nav-item ${isActive('/dashboard/booking-orders')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>Booking Orders</span>
              <span className="sidebar-pill">PDF</span>
            </Link>

            <Link 
              to="/dashboard/receipts" 
              className={`sidebar-nav-item ${isActive('/dashboard/receipts')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
                <path d="M12 14v4M10 16l2 2 2-2"></path>
              </svg>
              <span>Payment Receipts</span>
              <span className="sidebar-pill">PDF</span>
            </Link>

            <Link 
              to="/dashboard/proforma-invoices" 
              className={`sidebar-nav-item ${isActive('/dashboard/proforma-invoices')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Proforma Invoices</span>
              <span className="sidebar-pill">PDF</span>
            </Link>

            <Link 
              to="/dashboard/all-documents" 
              className={`sidebar-nav-item ${isActive('/dashboard/all-documents')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>All Documents</span>
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">CREATE FORMS</span>
            <Link 
              to="/dashboard/unified-entry" 
              className={`sidebar-nav-item ${isActive('/dashboard/unified-entry')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Create All Documents</span>
            </Link>

            <Link 
              to="/dashboard/booking-order" 
              className={`sidebar-nav-item ${location.pathname === '/dashboard/booking-order' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>New Booking Order</span>
            </Link>

            <Link 
              to="/dashboard/receipt" 
              className={`sidebar-nav-item ${location.pathname === '/dashboard/receipt' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              <span>New Payment Receipt</span>
            </Link>

            <Link 
              to="/dashboard/reciept/proforma-invoice" 
              className={`sidebar-nav-item ${isActive('/dashboard/reciept/proforma-invoice')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>New Proforma Invoice</span>
            </Link>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">SETTINGS</span>
            <Link 
              to="/dashboard/showrooms" 
              className={`sidebar-nav-item ${isActive('/dashboard/showrooms')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Showroom Partners</span>
            </Link>

            <Link 
              to="/dashboard/booking-relations" 
              className={`sidebar-nav-item ${isActive('/dashboard/booking-relations')}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>Document Relations</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-footer-link" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>Live Website</span>
          </Link>
          <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Top Header Bar */}
        <header className="dashboard-top-navbar">
          <div className="top-nav-left">
            <button 
              type="button" 
              className="sidebar-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="current-section-badge">
              <span>ADMIN DASHBOARD</span>
            </div>
          </div>

          <div className="top-nav-right">
            <Link to="/dashboard/booking-orders" className="nav-action-pill">
              Orders PDF
            </Link>
            <Link to="/dashboard/receipts" className="nav-action-pill">
              Receipts PDF
            </Link>
            <Link to="/dashboard/proforma-invoices" className="nav-action-pill">
              Proforma PDF
            </Link>
            <Link to="/dashboard/leads" className="nav-action-pill highlight">
              Leads CRM
            </Link>
            <div className="admin-user-pill">
              <span className="user-initials">A</span>
              <span className="user-name-text">Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <main className="dashboard-main-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/cars" element={<CarsManagement />} />
            <Route path="/all-documents" element={<AllDocuments />} />
            <Route path="/booking-orders" element={<BookingOrdersDownloadPage />} />
            <Route path="/booking-orders-download" element={<BookingOrdersDownloadPage />} />
            <Route path="/receipts" element={<ReceiptsDownloadPage />} />
            <Route path="/receipts-download" element={<ReceiptsDownloadPage />} />
            <Route path="/proforma-invoices" element={<ProformaInvoicesDownloadPage />} />
            <Route path="/proforma-invoices-download" element={<ProformaInvoicesDownloadPage />} />
            <Route path="/quotation" element={<QuotationCreationPage />} />
            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/quotation/edit/:id" element={<QuotationCreationPage />} />
            <Route path="/unified-entry" element={<UnifiedBookingFlow />} />
            <Route path="/booking-order" element={<BookingOrder />} />
            <Route path="/booking-order/new" element={<BookingOrder />} />
            <Route path="/receipt" element={<PaymentReceipt />} />
            <Route path="/receipt/new" element={<PaymentReceipt />} />
            <Route path="/showrooms" element={<ShowroomManagement />} />
            <Route path="/booking-relations" element={<BookingRelations />} />
            <Route path="/reciept/proforma-invoice" element={<ProformaInvoice />} />
            <Route path="/leads" element={<AllLeads />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;