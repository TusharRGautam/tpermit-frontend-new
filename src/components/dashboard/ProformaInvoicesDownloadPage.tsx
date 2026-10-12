import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProformaInvoiceList from './ProformaInvoiceList';
import proformaService from '../../services/proformaService';
import './Dashboard.css';
import './DashboardSidebar.css';

const ProformaInvoicesDownloadPage: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const invoices = await proformaService.getAllProformaInvoices();
        if (Array.isArray(invoices)) {
          setTotalCount(invoices.length);
        }
      } catch (err) {
        console.error('Failed to load proforma invoices stats:', err);
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
            background: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Proforma Invoices Download
              </h1>
              <span style={{
                background: '#dbeafe',
                color: '#2563eb',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                Proforma PDF
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              View quotations and download official Velox Motors & Modi Hyundai proforma invoice PDFs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <Link
            to="/dashboard/reciept/proforma-invoice"
            className="btn-primary-action"
            style={{ textDecoration: 'none' }}
          >
            + Create Proforma Invoice
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
            Total Proforma Invoices
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 600 }}>
            Available for PDF Download
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Partner Templates
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', margin: '0.1rem 0' }}>
            Velox & Modi
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Auto-detected format
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Bank Finance Support
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            Full Breakdown
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            EMI, Loan, Margin Money & RTO
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '0.55rem 0.8rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Download Action
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', margin: '0.2rem 0' }}>
            Click &quot;Download&quot; in Table
          </div>
          <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
            Direct jsPDF rendering to device
          </div>
        </div>
      </div>

      {/* Main Proforma Invoice List View */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <ProformaInvoiceList />
      </div>
    </div>
  );
};

export default ProformaInvoicesDownloadPage;
