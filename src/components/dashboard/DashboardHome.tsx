import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

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
      {/* Welcome banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-content">
          <h1>Gautam Motors Admin Portal</h1>
          <p>Commercial T-Permit fleet management, quotations, bookings, leads and invoicing</p>
        </div>
        <div className="welcome-quick-links">
          <Link to="/dashboard/cars" className="btn-welcome-action">
            Show Cars
          </Link>
          <Link to="/dashboard/leads" className="btn-welcome-action secondary">
            Meta Leads
          </Link>
        </div>
      </div>

      {/* Meta Campaign Leads Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Meta Campaign Leads</h2>
          <span className="section-description">Manage incoming ad campaign leads in real-time</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/leads" className="action-card featured">
            <div className="featured-badge">CRM</div>
            <div className="card-info">
              <h3>All Leads Management</h3>
              <p>View, filter, update status, and manage all Meta ad campaign leads</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>

      {/* Vehicles / Show Cars Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Vehicle Inventory</h2>
          <span className="section-description">Commercial T-Permit cars, models, and pricing</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/cars" className="action-card primary">
            <div className="featured-badge">Fleet</div>
            <div className="card-info">
              <h3>Show Cars</h3>
              <p>View all T-Permit commercial vehicles, down payments, and EMI structures</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>

      {/* Quotations Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quotations</h2>
          <span className="section-description">Create and manage vehicle quotations</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/quotation" className="action-card primary">
            <div className="card-info">
              <h3>New Quotation</h3>
              <p>Create a customized vehicle quotation with loan terms</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/quotations" className="action-card primary">
            <div className="card-info">
              <h3>All Quotations</h3>
              <p>View and manage all generated quotations</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>

      {/* Document Downloads & Records Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Document Downloads & Records</h2>
          <span className="section-description">Search, view, and directly download official signed PDFs</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/booking-orders" className="action-card featured">
            <div className="featured-badge">PDF</div>
            <div className="card-info">
              <h3>Booking Orders Download</h3>
              <p>View all commercial vehicle bookings and download signed order PDFs</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/receipts" className="action-card featured">
            <div className="featured-badge">PDF</div>
            <div className="card-info">
              <h3>Payment Receipts Download</h3>
              <p>Browse payment records and download official stamped receipts</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/proforma-invoices" className="action-card primary">
            <div className="featured-badge">PDF</div>
            <div className="card-info">
              <h3>Proforma Invoices Download</h3>
              <p>Download official Velox Motors & Modi Hyundai proforma PDFs</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/all-documents" className="action-card secondary">
            <div className="card-info">
              <h3>All Documents (Unified View)</h3>
              <p>Tabbed records overview of orders, receipts, and proformas</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>

      {/* Single Document Generation */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Individual Documents</h2>
          <span className="section-description">Generate specific forms and receipts</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/booking-order" className="action-card secondary">
            <div className="card-info">
              <h3>Create Booking Order</h3>
              <p>Individual booking order creation</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/receipt" className="action-card secondary">
            <div className="card-info">
              <h3>Create Payment Receipt</h3>
              <p>Generate customer payment receipt</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/reciept/proforma-invoice?company=Velox" className="action-card secondary">
            <div className="card-info">
              <h3>Velox Motors Proforma</h3>
              <p>Generate Velox Motors proforma invoice</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/reciept/proforma-invoice?company=Modi" className="action-card secondary">
            <div className="card-info">
              <h3>Modi Hyundai Proforma</h3>
              <p>Generate Modi Hyundai proforma invoice</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>

      {/* Administration & Relations */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Administration</h2>
          <span className="section-description">Manage partners and relation tracking</span>
        </div>
        <div className="action-cards-row">
          <Link to="/dashboard/showrooms" className="action-card success">
            <div className="card-info">
              <h3>Showroom Partners</h3>
              <p>Manage partner showroom addresses and locations</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
          <Link to="/dashboard/booking-relations" className="action-card success">
            <div className="card-info">
              <h3>Document Relations</h3>
              <p>View linked relationships between orders and invoices</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>

      {/* Public Site Link */}
      <div className="dashboard-section">
        <div className="action-cards-row single">
          <Link to="/" className="action-card website">
            <div className="card-info">
              <h3>Visit Public Website</h3>
              <p>Return to Gautam Motors public homepage</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;