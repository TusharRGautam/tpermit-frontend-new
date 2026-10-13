import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import veloxReceiptService, { VeloxReceiptData } from '../../services/veloxReceiptService';
import { generateVeloxReceiptPDF } from '../../utils/veloxReceiptPdfGenerator';
import './VeloxReceipt.css';
import './Dashboard.css';

const VeloxReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<VeloxReceiptData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<VeloxReceiptData | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await veloxReceiptService.getAllReceipts();
      setReceipts(data);
    } catch (err) {
      console.error('Failed to load Velox receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (receipt: VeloxReceiptData) => {
    try {
      setDownloadingId(receipt.id);
      await generateVeloxReceiptPDF(receipt);
    } catch (err) {
      console.error('Error generating Velox PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (receipt: VeloxReceiptData) => {
    if (window.confirm(`Are you sure you want to delete Velox Receipt #${receipt.receipt_no}?`)) {
      await veloxReceiptService.deleteReceipt(receipt.id);
      loadReceipts();
      if (selectedReceipt?.id === receipt.id) setSelectedReceipt(null);
    }
  };

  // Filter receipts
  const filteredReceipts = receipts.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.receipt_no && r.receipt_no.toLowerCase().includes(term)) ||
      (r.name && r.name.toLowerCase().includes(term)) ||
      (r.customer_id && r.customer_id.toLowerCase().includes(term)) ||
      (r.financer_name && r.financer_name.toLowerCase().includes(term)) ||
      (r.hypothecated_to && r.hypothecated_to.toLowerCase().includes(term)) ||
      (r.remarks && r.remarks.toLowerCase().includes(term))
    );
  });

  const totalAmount = receipts.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

  return (
    <div className="velox-container">
      {/* Header Bar */}
      <div className="velox-header-bar">
        <div className="velox-header-title">
          <div className="velox-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="15" x2="15" y2="15"></line>
              <line x1="9" y1="11" x2="15" y2="11"></line>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Velox Bank Receipts
              </h1>
              <span style={{
                background: '#ede9fe',
                color: '#6366f1',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                VELOX MOTORS PVT LTD
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              Official Velox Motors Pvt Ltd bank receipts with authorized stamp & signature
            </p>
          </div>
        </div>

        <div className="velox-header-actions">
          <Link to="/dashboard/velox-receipt" className="velox-btn-primary">
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Create Velox Receipt
          </Link>
          <button onClick={loadReceipts} className="velox-btn-secondary" title="Refresh list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6 5.67"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="velox-stats-strip">
        <div className="velox-stat-card">
          <div className="velox-stat-icon" style={{ background: '#ede9fe', color: '#6366f1' }}>
            📄
          </div>
          <div>
            <div className="velox-stat-val">{receipts.length}</div>
            <div className="velox-stat-lbl">Total Velox Receipts</div>
          </div>
        </div>

        <div className="velox-stat-card">
          <div className="velox-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            ₹
          </div>
          <div>
            <div className="velox-stat-val">₹{totalAmount.toLocaleString('en-IN')}</div>
            <div className="velox-stat-lbl">Total Receipt Amount</div>
          </div>
        </div>

        <div className="velox-stat-card">
          <div className="velox-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            🏦
          </div>
          <div>
            <div className="velox-stat-val">HDFC Bank Ltd.</div>
            <div className="velox-stat-lbl">Primary Financer</div>
          </div>
        </div>

        <div className="velox-stat-card">
          <div className="velox-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            🔏
          </div>
          <div>
            <div className="velox-stat-val">Active</div>
            <div className="velox-stat-lbl">Velox Motors Stamp & Sign</div>
          </div>
        </div>
      </div>

      {/* Search & Records Table */}
      <div className="velox-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.65rem' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '420px' }}>
            <input
              type="text"
              placeholder="Search by receipt no, customer name, financer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="velox-input"
              style={{ paddingLeft: '2rem' }}
            />
            <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              🔍
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredReceipts.length} of {receipts.length} records
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading Velox receipts...
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ margin: '0 0 0.35rem 0', color: '#334155' }}>No Velox Receipts Found</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              {searchTerm ? 'No results match your search term.' : 'Click below to create your first Velox Motors bank receipt.'}
            </p>
            <Link to="/dashboard/velox-receipt" className="velox-btn-primary">
              + Create Velox Receipt
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Receipt No.</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Customer / Firm Name</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Financer / Bank</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Payment Mode</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => {
                  const mode = (receipt.items && receipt.items[0]?.mode) || 'CASH';
                  return (
                    <tr
                      key={receipt.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#4338ca' }}>
                        {receipt.receipt_no}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>
                        {receipt.receipt_date}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>
                        {receipt.name}
                        {receipt.customer_id && (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8' }}>
                            ID: {receipt.customer_id}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#334155' }}>
                        {receipt.hypothecated_to || receipt.financer_name || '-'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{
                          background: mode === 'CASH' ? '#dcfce7' : '#e0f2fe',
                          color: mode === 'CASH' ? '#15803d' : '#0369a1',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {mode}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        ₹{(Number(receipt.total_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleDownload(receipt)}
                            disabled={downloadingId === receipt.id}
                            style={{
                              background: '#4f46e5',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Download official PDF matching the printed design"
                          >
                            {downloadingId === receipt.id ? '...' : '📥 Download PDF'}
                          </button>
                          <button
                            onClick={() => setSelectedReceipt(receipt)}
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Preview receipt"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/velox-receipt/edit/${receipt.id}`)}
                            style={{
                              background: '#f8fafc',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Edit receipt"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(receipt)}
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Delete receipt"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
        onClick={() => setSelectedReceipt(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  Preview: Velox Receipt #{selectedReceipt.receipt_no}
                </span>
                <span style={{ fontSize: '0.7rem', background: '#ede9fe', color: '#6366f1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  A4 Landscape
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleDownload(selectedReceipt)}
                  className="velox-btn-primary"
                  style={{ fontSize: '0.78rem' }}
                >
                  📥 Download Official PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body: The Authentic Document View */}
            <div style={{ padding: '1rem', background: '#e2e8f0', overflowX: 'auto' }}>
              <div className="velox-mobile-scroll-hint" style={{ maxWidth: '850px', margin: '0 auto 0.6rem auto' }}>
                <span>👉 Swipe horizontally to view full document & stamp 👈</span>
              </div>
              <div className="velox-paper-scroll-wrapper" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div className="velox-paper-preview" style={{ margin: '0 auto' }}>
                {/* Header */}
                <div className="velox-paper-header">
                  <h2 className="velox-paper-title">RECEIPT</h2>
                  <span className="velox-paper-rel">{selectedReceipt.rel_version || 'Rel 2.0.12'}</span>
                </div>

                {/* Metadata 2 Columns */}
                <div className="velox-paper-grid">
                  <div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">Receipt No.</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.receipt_no}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">Name</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val" style={{ fontWeight: 700 }}>{selectedReceipt.name}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">Address</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val" style={{ whiteSpace: 'pre-line' }}>{selectedReceipt.address}</span>
                    </div>
                    <div className="velox-meta-row" style={{ marginTop: '0.45rem' }}>
                      <span className="velox-meta-label">Remarks</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.remarks}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">Order/Inv No.</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.order_inv_no || ''}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">Model</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.model || ''}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">TL Name</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.tl_name || ''}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label">DSE Name</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.dse_name || ''}</span>
                    </div>
                  </div>

                  <div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label" style={{ width: '120px' }}>Receipt Date</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.receipt_date}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label" style={{ width: '120px' }}>Customer ID</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.customer_id}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label" style={{ width: '120px' }}>Receipt Amount</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{Number(selectedReceipt.receipt_amount || selectedReceipt.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label" style={{ width: '120px' }}>Hypothecated To</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.hypothecated_to}</span>
                    </div>
                    <div className="velox-meta-row">
                      <span className="velox-meta-label" style={{ width: '120px' }}>Financer Name</span>
                      <span className="velox-meta-colon">:</span>
                      <span className="velox-meta-val">{selectedReceipt.financer_name}</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <table className="velox-paper-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>Srl.</th>
                      <th style={{ width: '10%' }}>Mode</th>
                      <th style={{ width: '14%' }}>DD/CC/CHQ No.</th>
                      <th style={{ width: '12%' }}>Date</th>
                      <th style={{ width: '14%' }}>Favouring</th>
                      <th style={{ width: '10%' }}>Drawn On</th>
                      <th style={{ width: '20%' }}>Deposit Bank Name</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedReceipt.items && selectedReceipt.items.length > 0 ? selectedReceipt.items : []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>{item.srl || idx + 1}</td>
                        <td>{item.mode}</td>
                        <td>{item.dd_chq_no || '.'}</td>
                        <td>{item.date}</td>
                        <td>{item.favouring || ''}</td>
                        <td>{item.drawn_on || '.'}</td>
                        <td>{item.deposit_bank}</td>
                        <td style={{ textAlign: 'right' }}>{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={8} className="border-bottom" style={{ padding: 0, height: '1px' }}></td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ fontWeight: 700, paddingTop: '0.5rem' }}>Total</td>
                      <td style={{ fontWeight: 700, paddingTop: '0.5rem' }}>:</td>
                      <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700, paddingTop: '0.5rem' }}>
                        {Number(selectedReceipt.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="border-bottom" style={{ padding: 0, height: '1px' }}></td>
                    </tr>
                  </tbody>
                </table>

                {/* Amount in Words */}
                <div style={{ margin: '0.65rem 0', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 700 }}>Amount in words</span>
                  <span style={{ margin: '0 0.5rem', fontWeight: 700 }}>:</span>
                  <span style={{ fontWeight: 600 }}>{selectedReceipt.amount_in_words}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: '0.5rem' }}>
                  Terms and Conditions
                </div>

                {/* Bottom Signature & Stamp */}
                <div className="velox-sign-block">
                  <div className="velox-sign-container">
                    <div className="velox-sign-header">
                      For VELOX MOTORS PVT LTD
                    </div>
                    <div className="velox-stamp-sign-wrap">
                      <img
                        src="/Website-Images/velox_official_stamp.png"
                        alt="Velox Motors Stamp & Sign"
                        className="velox-stamp-sign-overlay"
                      />
                      <div className="velox-signatory-text">
                        (Authorized Signatory)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default VeloxReceiptsPage;
