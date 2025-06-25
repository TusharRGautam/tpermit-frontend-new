import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
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
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Dashboard</h1>
        <p>Welcome to ASW Dashboard. Here's an overview of your business.</p>
      </div>
      
      <div className="dashboard-section main-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="dashboard-cards">
          <Link to="/dashboard/quotation" className="dashboard-card">
            <div className="card-content">
              <span className="card-icon">📝</span>
              <h3>Create Invoice</h3>
              <p>Generate a new vehicle invoice</p>
            </div>
          </Link>
          <Link to="/dashboard/cars" className="dashboard-card">
            <div className="card-content">
              <span className="card-icon">🚗</span>
              <h3>Manage Cars</h3>
              <p>Update inventory and details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 