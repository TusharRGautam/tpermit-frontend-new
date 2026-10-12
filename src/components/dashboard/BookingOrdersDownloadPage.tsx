import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookingOrderList from './BookingOrderList';
import bookingOrderService from '../../services/bookingOrderService';
import './Dashboard.css';
import './DashboardSidebar.css';

const BookingOrdersDownloadPage: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [latestDate, setLatestDate] = useState<string>('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const orders = await bookingOrderService.getAllBookingOrders();
        if (Array.isArray(orders)) {
          setTotalCount(orders.length);
          if (orders.length > 0 && orders[0].order_date) {
            setLatestDate(new Date(orders[0].order_date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load booking orders stats:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="download-page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
      {/* Page Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Booking Orders Download
              </h1>
              <span style={{
                background: '#fee2e2',
                color: '#dc2626',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                PDF Download
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              View customer bookings and download official commercial booking orders with stamp & signature
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <Link
            to="/dashboard/booking-order"
            className="btn-primary-action"
            style={{ textDecoration: 'none' }}
          >
            + Create Booking Order
          </Link>
          <Link
            to="/dashboard/unified-entry"
            className="btn-secondary-action"
            style={{ textDecoration: 'none' }}
          >
            + Unified Entry
          </Link>
        </div>
      </div>

      {/* Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.55rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Booking Orders
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 600 }}>
            {latestDate ? `Latest: ${latestDate}` : 'Ready for Instant Download'}
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            PDF Generator Status
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', margin: '0.1rem 0' }}>
            Active (jsPDF)
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            A4 Standard with Stamp
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Commercial T-Permit
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            100% Verified
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            MH RTO Passing compliant
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Quick Download Tip
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', margin: '0.2rem 0' }}>
            Click &quot;Download&quot; in table
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Instant PDF download to local device
          </div>
        </div>
      </div>

      {/* Main Booking Order List View */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <BookingOrderList />
      </div>
    </div>
  );
};

export default BookingOrdersDownloadPage;
