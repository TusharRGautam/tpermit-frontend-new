import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReceiptList from './ReceiptList';
import receiptService from '../../services/receiptService';
import './Dashboard.css';
import './DashboardSidebar.css';

const ReceiptsDownloadPage: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const receipts = await receiptService.getAllReceipts();
        if (Array.isArray(receipts)) {
          setTotalCount(receipts.length);
          const sum = receipts.reduce((acc, curr) => {
            const amt = parseFloat(curr.receipt_amount) || 0;
            return acc + amt;
          }, 0);
          setTotalAmount(sum);
        }
      } catch (err) {
        console.error('Failed to load receipts stats:', err);
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
            background: 'rgba(22, 163, 74, 0.1)',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <path d="M12 14v4M10 16l2 2 2-2"></path>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Payment Receipts Download
              </h1>
              <span style={{
                background: '#dcfce7',
                color: '#16a34a',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                Receipts PDF
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              View customer transactions and download official payment receipts with authorized sign & stamp
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <Link
            to="/dashboard/receipt"
            className="btn-primary-action"
            style={{ textDecoration: 'none' }}
          >
            + Create Receipt
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
            Total Receipts Issued
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 600 }}>
            Ready for Instant PDF Download
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Collected Amount
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', margin: '0.1rem 0' }}>
            ₹{totalAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Recorded Across All Modes
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Signature & Stamp
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            Authorized
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Official Gautam Motors Seal
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Format & Download
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', margin: '0.2rem 0' }}>
            Click &quot;Download&quot; in Table
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Generates Receipt_{'{Number}'}.pdf
          </div>
        </div>
      </div>

      {/* Main Receipts List View */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <ReceiptList />
      </div>
    </div>
  );
};

export default ReceiptsDownloadPage;
