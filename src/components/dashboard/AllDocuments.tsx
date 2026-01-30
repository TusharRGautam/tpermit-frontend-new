import React, { useState } from 'react';
import BookingOrderList from './BookingOrderList';
import ReceiptList from './ReceiptList';
import ProformaInvoiceList from './ProformaInvoiceList';
import './Dashboard.css';

const AllDocuments = () => {
    const [activeTab, setActiveTab] = useState('booking');

    const tabs = [
        { id: 'booking', label: 'Booking Orders', icon: '📋', color: '#667eea' },
        { id: 'receipt', label: 'Payment Receipts', icon: '🧾', color: '#10b981' },
        { id: 'proforma', label: 'Proforma Invoices', icon: '📄', color: '#f59e0b' }
    ];

    const activeTabData = tabs.find(t => t.id === activeTab);

    return (
        <div className="dashboard-container" style={{ maxWidth: '100%', margin: '0 auto', padding: '1.5rem' }}>
            {/* Enhanced Header */}
            <div style={{
                background: `linear-gradient(135deg, ${activeTabData?.color || '#667eea'} 0%, ${activeTabData?.color || '#764ba2'}dd 100%)`,
                borderRadius: '16px',
                padding: '2rem 2.5rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '300px',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>{activeTabData?.icon}</span>
                            <div>
                                <h1 style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    color: 'white',
                                    margin: 0,
                                    letterSpacing: '-0.02em'
                                }}>All Documents</h1>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: 'rgba(255, 255, 255, 0.95)',
                                    margin: '0.25rem 0 0 0'
                                }}>View and manage all your business documents</p>
                            </div>
                        </div>

                        <a href="/dashboard"
                            onClick={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                                padding: '0.75rem 1.25rem',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <span>🏠</span> Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>

            {/* Enhanced Tab Navigation */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: '1',
                            minWidth: '200px',
                            padding: '1rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: activeTab === tab.id ? '600' : '500',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            background: activeTab === tab.id ? `linear-gradient(135deg, ${tab.color} 0%, ${tab.color}dd 100%)` : 'transparent',
                            border: activeTab === tab.id ? 'none' : '2px solid #e2e8f0',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: activeTab === tab.id ? `0 4px 12px ${tab.color}40` : 'none',
                            transform: activeTab === tab.id ? 'translateY(-2px)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.borderColor = tab.color;
                                e.currentTarget.style.color = tab.color;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.color = '#64748b';
                                e.currentTarget.style.transform = 'none';
                            }
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <span style={{
                                marginLeft: 'auto',
                                background: 'rgba(255, 255, 255, 0.3)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>Active</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area with Card Design */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                minHeight: '500px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f1f5f9'
            }}>
                {/* Tab Content Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${activeTabData?.color || '#667eea'}20, ${activeTabData?.color || '#667eea'}10)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem'
                        }}>
                            {activeTabData?.icon}
                        </div>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#1e293b'
                            }}>{activeTabData?.label}</h2>
                            <p style={{
                                margin: '0.25rem 0 0 0',
                                fontSize: '0.875rem',
                                color: '#64748b'
                            }}>
                                {activeTab === 'booking' && 'Manage customer vehicle booking orders'}
                                {activeTab === 'receipt' && 'Track payment receipts and transactions'}
                                {activeTab === 'proforma' && 'Review proforma invoice quotations'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                    {activeTab === 'booking' && <BookingOrderList />}
                    {activeTab === 'receipt' && <ReceiptList />}
                    {activeTab === 'proforma' && <ProformaInvoiceList />}
                </div>
            </div>

            {/* Add fade-in animation */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default AllDocuments;
