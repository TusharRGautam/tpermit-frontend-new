import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home-container">
      <div className="dashboard-welcome-banner">
        <div className="welcome-content">
          <h1>Welcome to T-Permit Dashboard</h1>
          <p>Manage your leads, quotations, bookings, payments, and more from one central place</p>
        </div>
      </div>

      {/* Meta Campaign Leads Card */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📢 Meta Campaign Leads</h2>
          <span className="section-description">Manage incoming ad campaign leads in real-time</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/leads" className="action-card featured">
            <div className="featured-badge">🔥 CRM</div>
            <div className="card-icon-large">📢</div>
            <div className="card-info">
              <h3>All Leads</h3>
              <p>View and manage all Meta ad campaign leads</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Quotations Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📝 Quotations</h2>
          <span className="section-description">Create and manage vehicle quotations</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/quotation" className="action-card primary">
            <div className="card-icon-large">✏️</div>
            <div className="card-info">
              <h3>New Quotation</h3>
              <p>Create a new vehicle quotation</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/quotations" className="action-card primary">
            <div className="card-icon-large">📄</div>
            <div className="card-info">
              <h3>All Quotations</h3>
              <p>View and manage all quotations</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Booking & Payments Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📋 Bookings & Payments</h2>
          <span className="section-description">Comprehensive booking and payment management</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/unified-entry" className="action-card featured">
            <div className="featured-badge">⭐ Unified</div>
            <div className="card-icon-large">✨</div>
            <div className="card-info">
              <h3>Create All Documents</h3>
              <p>Order, Receipt & Proforma in one flow</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/all-documents" className="action-card secondary">
            <div className="card-icon-large">📁</div>
            <div className="card-info">
              <h3>View All Documents</h3>
              <p>Browse all orders, receipts & proformas</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Single Document Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📄 Single Document</h2>
          <span className="section-description">Create individual documents separately</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/booking-order" className="action-card secondary">
            <div className="card-icon-large">📋</div>
            <div className="card-info">
              <h3>Create Booking Order</h3>
              <p>Individual booking order creation</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/receipt" className="action-card secondary">
            <div className="card-icon-large">🧾</div>
            <div className="card-info">
              <h3>Create Receipt</h3>
              <p>Generate payment receipt</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/reciept/proforma-invoice?company=Velox" className="action-card secondary">
            <div className="card-icon-large">📄</div>
            <div className="card-info">
              <h3>Create Velox Motors Proforma</h3>
              <p>Create proforma invoice</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/reciept/proforma-invoice?company=Modi" className="action-card secondary">
            <div className="card-icon-large">📄</div>
            <div className="card-info">
              <h3>Create Modi Hyundai Proforma</h3>
              <p>Create proforma invoice</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Management Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>⚙️ Management</h2>
          <span className="section-description">Manage your inventory and relationships</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/showrooms" className="action-card success">
            <div className="card-icon-large">🏢</div>
            <div className="card-info">
              <h3>Showrooms</h3>
              <p>Manage showroom locations</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/cars" className="action-card success">
            <div className="card-icon-large">🚙</div>
            <div className="card-info">
              <h3>Vehicles</h3>
              <p>Manage vehicle inventory</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          <Link to="/dashboard/booking-relations" className="action-card success">
            <div className="card-icon-large">🔗</div>
            <div className="card-info">
              <h3>Booking Relations</h3>
              <p>View booking relationships</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Website Link */}
      <div className="dashboard-section">
        <div className="action-cards-row single">
          <Link to="/" className="action-card website">
            <div className="card-icon-large">🌐</div>
            <div className="card-info">
              <h3>Visit Website</h3>
              <p>Go to main T-Permit website</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;