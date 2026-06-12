import React from 'react';
import './BookCarsSection.css';

const BookCarsSection: React.FC = () => {
  return (
    <section className="book-cars-section">
      <div className="book-cars-container">
        {/* Left brand strip */}
        <div className="book-cars-brand">
          <div className="book-cars-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h2 className="book-cars-title">BOOK CARS</h2>
        </div>

        {/* Feature badges */}
        <div className="book-cars-features">
          <div className="feature-badge">
            <span className="feature-badge-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/></svg>
            </span>
            <div className="feature-badge-text">
              <strong>100% Safe</strong>
              <span>Secure Booking</span>
            </div>
          </div>

          <div className="feature-divider"></div>

          <div className="feature-badge">
            <span className="feature-badge-icon token">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            </span>
            <div className="feature-badge-text">
              <strong>₹5,000 Token</strong>
              <span>Book Your Car</span>
            </div>
          </div>

          <div className="feature-divider"></div>

          <div className="feature-badge">
            <span className="feature-badge-icon fast">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.72L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5v-5l-2.28 2.28C7.81 18 6 15.21 6 12c0-4.08 3.05-7.44 7-7.93V2.05z"/></svg>
            </span>
            <div className="feature-badge-text">
              <strong>Instant Online</strong>
              <span>2-Min Process</span>
            </div>
          </div>

          <div className="feature-divider"></div>

          <div className="feature-badge">
            <span className="feature-badge-icon emi">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            </span>
            <div className="feature-badge-text">
              <strong>Easy EMI</strong>
              <span>Flexible Plans</span>
            </div>
          </div>
        </div>

        {/* Trust tagline */}
        <div className="book-cars-tagline">
          <span>भरोसेमंद • विश्वसनीय • 100% सुरक्षित</span>
        </div>
      </div>
    </section>
  );
};

export default BookCarsSection;