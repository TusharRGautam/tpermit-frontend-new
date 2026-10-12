import React, { useState } from 'react';
import BookingOrderList from './BookingOrderList';
import ReceiptList from './ReceiptList';
import ProformaInvoiceList from './ProformaInvoiceList';
import './Dashboard.css';

const AllDocuments = () => {
    const [activeTab, setActiveTab] = useState('booking');

    const tabs = [
        { id: 'booking', label: 'Booking Orders', color: '#dc2626' },
        { id: 'receipt', label: 'Payment Receipts', color: '#16a34a' },
        { id: 'proforma', label: 'Proforma Invoices', color: '#2563eb' }
    ];

    const activeTabData = tabs.find(t => t.id === activeTab);

    const renderTabIcon = (tabId: string, strokeColor = 'currentColor', size = 20) => {
        if (tabId === 'booking') {
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
            );
        }
        if (tabId === 'receipt') {
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
            );
        }
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
        );
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '100%', margin: '0 auto', padding: '0.25rem 0' }}>
            {/* Enhanced Compact Header */}
            <div style={{
                background: '#0f172a',
                borderRadius: '8px',
                padding: '0.65rem 1.15rem',
                marginBottom: '0.65rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #1e293b',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '1.10rem',
                                    fontWeight: '800',
                                    color: '#ffffff',
                                    margin: 0,
                                    lineHeight: 1.2,
                                    background: 'none',
                                    WebkitTextFillColor: '#ffffff'
                                }}>All Documents</h1>
                                <p style={{
                                    fontSize: '0.68rem',
                                    color: '#94a3b8',
                                    margin: '0.1rem 0 0 0'
                                }}>View and manage all booking orders, payment receipts, and proformas</p>
                            </div>
                        </div>

                        <a href="/dashboard"
                            onClick={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '5px',
                                padding: '0.35rem 0.75rem',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.74rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>

            {/* Compact Tab Navigation */}
            <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '0.4rem',
                marginBottom: '0.65rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '0.4rem',
                flexWrap: 'wrap'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: '1',
                            minWidth: '150px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: activeTab === tab.id ? '700' : '500',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            background: activeTab === tab.id ? tab.color : 'transparent',
                            border: activeTab === tab.id ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            {renderTabIcon(tab.id, activeTab === tab.id ? 'white' : '#64748b', 15)}
                        </span>
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <span style={{
                                marginLeft: 'auto',
                                background: 'rgba(255, 255, 255, 0.3)',
                                padding: '1px 5px',
                                borderRadius: '6px',
                                fontSize: '0.62rem',
                                fontWeight: '700'
                            }}>Active</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area with Compact Card Design */}
            <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                border: '1px solid #e2e8f0'
            }}>
                {/* Tab Content Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: `${activeTabData?.color || '#dc2626'}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: activeTabData?.color || '#dc2626'
                        }}>
                            {renderTabIcon(activeTab, activeTabData?.color || '#dc2626', 16)}
                        </div>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '0.92rem',
                                fontWeight: '700',
                                color: '#0f172a'
                            }}>{activeTabData?.label}</h2>
                            <p style={{
                                margin: '0.1rem 0 0 0',
                                fontSize: '0.68rem',
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
                <div>
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
