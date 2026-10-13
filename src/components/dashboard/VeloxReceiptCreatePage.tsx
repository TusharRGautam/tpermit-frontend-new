import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import veloxReceiptService, { VeloxReceiptData, VeloxPaymentItem } from '../../services/veloxReceiptService';
import { generateVeloxReceiptPDF } from '../../utils/veloxReceiptPdfGenerator';
import { numberToIndianWords } from '../../utils/numberToWords';
import './VeloxReceipt.css';
import './Dashboard.css';

const DEFAULT_STAMP_URL = '/Website-Images/velox_official_stamp.png';

const formatTodayDate = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const VeloxReceiptCreatePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  // Form State
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>(formatTodayDate());
  const [customerId, setCustomerId] = useState<string>('');
  const [relVersion, setRelVersion] = useState<string>('Rel 2.0.12');

  const [customerName, setCustomerName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [hypothecatedTo, setHypothecatedTo] = useState<string>('HDFC BANK LTD.');
  const [financerName, setFinancerName] = useState<string>('HDFC BANK LTD.');
  const [remarks, setRemarks] = useState<string>('');

  const [orderInvNo, setOrderInvNo] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [tlName, setTlName] = useState<string>('');
  const [dseName, setDseName] = useState<string>('');

  const [items, setItems] = useState<VeloxPaymentItem[]>([
    {
      id: 'item-1',
      srl: 1,
      mode: 'CASH',
      dd_chq_no: '.',
      date: formatTodayDate(),
      favouring: '',
      drawn_on: '.',
      deposit_bank: 'Sbi Bank',
      amount: 60000
    }
  ]);

  const [amountInWords, setAmountInWords] = useState<string>('Rupees Sixty Thousand Only');
  const [manualWordsOverride, setManualWordsOverride] = useState<boolean>(false);
  const [termsConditions, setTermsConditions] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Total amount computed from items
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Recalculate amount in words whenever totalAmount changes (unless manually overridden)
  useEffect(() => {
    if (!manualWordsOverride) {
      setAmountInWords(numberToIndianWords(totalAmount));
    }
  }, [totalAmount, manualWordsOverride]);

  // Load existing receipt if editing, or init new
  useEffect(() => {
    const initReceipt = async () => {
      if (id) {
        const existing = await veloxReceiptService.getReceiptById(id);
        if (existing) {
          setReceiptNo(existing.receipt_no);
          setReceiptDate(existing.receipt_date || formatTodayDate());
          setCustomerId(existing.customer_id || '');
          setRelVersion(existing.rel_version || 'Rel 2.0.12');
          setCustomerName(existing.name || '');
          setAddress(existing.address || '');
          setHypothecatedTo(existing.hypothecated_to || 'HDFC BANK LTD.');
          setFinancerName(existing.financer_name || 'HDFC BANK LTD.');
          setRemarks(existing.remarks || '');
          setOrderInvNo(existing.order_inv_no || '');
          setModel(existing.model || '');
          setTlName(existing.tl_name || '');
          setDseName(existing.dse_name || '');
          setItems(existing.items && existing.items.length > 0 ? existing.items : [
            {
              id: 'item-1',
              srl: 1,
              mode: 'CASH',
              dd_chq_no: '.',
              date: existing.receipt_date || formatTodayDate(),
              favouring: '',
              drawn_on: '.',
              deposit_bank: 'Sbi Bank',
              amount: existing.total_amount || 0
            }
          ]);
          setAmountInWords(existing.amount_in_words || numberToIndianWords(existing.total_amount));
          setTermsConditions(existing.terms_conditions || '');
        }
      } else {
        // New receipt initialization
        const nextNo = await veloxReceiptService.getNextReceiptNumber();
        setReceiptNo(nextNo);
        setCustomerId(`${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      }
    };

    initReceipt();
  }, [id]);

  // Load photo sample quickly
  const loadPhotoSample = () => {
    setReceiptNo('REC26003365');
    setReceiptDate('09/10/2026');
    setCustomerId('2671206942');
    setRelVersion('Rel 2.0.12');
    setCustomerName('M/S Zubiya Tours And Travels');
    setAddress('S No 59 Adarsh Nagar, Tungaershwar Road Sativall, Vasai Road Vasai (E) Palghar\nPalghar\nPin:401404');
    setHypothecatedTo('HDFC BANK LTD.');
    setFinancerName('HDFC BANK LTD.');
    setRemarks('Payment received from Mohammad H (through CASH) Proprietor of Zubiya T&T.');
    setOrderInvNo('');
    setModel('');
    setTlName('');
    setDseName('');
    setItems([
      {
        id: 'item-1',
        srl: 1,
        mode: 'CASH',
        dd_chq_no: '.',
        date: '09/10/2026',
        favouring: '',
        drawn_on: '.',
        deposit_bank: 'Sbi Bank',
        amount: 60000
      }
    ]);
    setAmountInWords('Rupees Sixty Thousand Only');
    setManualWordsOverride(true);
    setTermsConditions('');
  };

  // Add Item Row
  const addItemRow = () => {
    const newSrl = items.length + 1;
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        srl: newSrl,
        mode: 'CASH',
        dd_chq_no: '.',
        date: receiptDate || formatTodayDate(),
        favouring: '',
        drawn_on: '.',
        deposit_bank: 'Sbi Bank',
        amount: 0
      }
    ]);
  };

  // Update Item Row
  const updateItemRow = (index: number, field: keyof VeloxPaymentItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? (parseFloat(value) || 0) : value
    };
    setItems(updated);
  };

  // Remove Item Row
  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      alert('At least one payment row is required.');
      return;
    }
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      srl: idx + 1
    }));
    setItems(updated);
  };

  // Prepare full data payload
  const buildReceiptData = (): VeloxReceiptData => {
    return {
      id: id || `velox-${Date.now()}`,
      receipt_no: receiptNo || 'REC26003365',
      receipt_date: receiptDate || formatTodayDate(),
      customer_id: customerId || '2671206942',
      name: customerName || 'Customer Name',
      address,
      receipt_amount: totalAmount,
      hypothecated_to: hypothecatedTo || 'HDFC BANK LTD.',
      financer_name: financerName || 'HDFC BANK LTD.',
      remarks,
      order_inv_no: orderInvNo,
      model,
      tl_name: tlName,
      dse_name: dseName,
      items,
      total_amount: totalAmount,
      amount_in_words: amountInWords || numberToIndianWords(totalAmount),
      terms_conditions: termsConditions,
      rel_version: relVersion || 'Rel 2.0.12'
    };
  };

  // Save receipt
  const handleSave = async (redirectToList: boolean = true) => {
    if (!customerName.trim()) {
      alert('Please enter Customer Name');
      return null;
    }
    if (!receiptNo.trim()) {
      alert('Please enter Receipt Number');
      return null;
    }

    try {
      setSaving(true);
      const data = buildReceiptData();
      if (isEditing && id) {
        await veloxReceiptService.updateReceipt(id, data);
        setSuccessMsg('Velox receipt updated successfully!');
      } else {
        await veloxReceiptService.createReceipt(data);
        setSuccessMsg('Velox receipt created successfully!');
      }

      setTimeout(() => setSuccessMsg(''), 3000);

      if (redirectToList) {
        navigate('/dashboard/velox-receipts');
      }
      return data;
    } catch (err) {
      console.error('Failed to save receipt:', err);
      alert('Failed to save receipt. Please check details.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Download PDF directly from builder
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      // Auto-save first
      const savedData = await handleSave(false);
      const targetData = savedData || buildReceiptData();
      await generateVeloxReceiptPDF(targetData);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="velox-container">
      {/* Top Header Bar */}
      <div className="velox-header-bar">
        <div className="velox-header-title">
          <div className="velox-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {isEditing ? `Edit Velox Receipt: ${receiptNo}` : 'Create Velox Bank Receipt'}
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
              Fill details below. Live paper preview updates in real time on the right.
            </p>
          </div>
        </div>

        <div className="velox-header-actions">
          <button
            type="button"
            onClick={loadPhotoSample}
            className="velox-btn-secondary"
            title="Load Zubiya Tours sample data from photo"
          >
            📋 Load Photo Sample
          </button>
          <Link to="/dashboard/velox-receipts" className="velox-btn-secondary">
            ← All Receipts
          </Link>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="velox-btn-primary"
          >
            {saving ? 'Saving...' : '💾 Save Receipt'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="velox-btn-secondary"
            style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}
          >
            {downloading ? 'Generating...' : '📥 Download PDF'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✓</span> {successMsg}
        </div>
      )}

      {/* Main Grid: Form on Left (1.1fr), Live Paper on Right (0.9fr) */}
      <div className="velox-create-grid">
        {/* LEFT COLUMN: BUILDER FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header Metadata Section */}
          <div className="velox-card">
            <div className="velox-section-title">
              <span>1. Receipt Header & Identification</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                Top Row Metadata
              </span>
            </div>

            <div className="velox-form-grid">
              <div className="velox-field">
                <label>Receipt No. *</label>
                <input
                  type="text"
                  className="velox-input"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="e.g. REC26003365"
                  required
                />
              </div>

              <div className="velox-field">
                <label>Receipt Date *</label>
                <input
                  type="text"
                  className="velox-input"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  required
                />
              </div>

              <div className="velox-field">
                <label>Customer ID *</label>
                <input
                  type="text"
                  className="velox-input"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="e.g. 2671206942"
                  required
                />
              </div>

              <div className="velox-field">
                <label>System Release / Version</label>
                <input
                  type="text"
                  className="velox-input"
                  value={relVersion}
                  onChange={(e) => setRelVersion(e.target.value)}
                  placeholder="e.g. Rel 2.0.12"
                />
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="velox-card">
            <div className="velox-section-title">
              <span>2. Customer & Address Information</span>
            </div>

            <div className="velox-form-grid cols-1">
              <div className="velox-field">
                <label>Customer Name / M/S *</label>
                <input
                  type="text"
                  className="velox-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. M/S Zubiya Tours And Travels"
                  style={{ fontWeight: 600 }}
                  required
                />
              </div>

              <div className="velox-field">
                <label>Full Customer Address</label>
                <textarea
                  className="velox-textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder={`S No 59 Adarsh Nagar, Tungaershwar Road Sativall, Vasai Road Vasai (E) Palghar\nPalghar\nPin:401404`}
                />
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Use Enter for new lines (Address, City, Pin Code)
                </span>
              </div>
            </div>
          </div>

          {/* Financer & Remarks */}
          <div className="velox-card">
            <div className="velox-section-title">
              <span>3. Financer, Bank & Remarks</span>
            </div>

            <div className="velox-form-grid">
              <div className="velox-field">
                <label>Hypothecated To</label>
                <input
                  type="text"
                  className="velox-input"
                  value={hypothecatedTo}
                  onChange={(e) => setHypothecatedTo(e.target.value)}
                  placeholder="e.g. HDFC BANK LTD."
                />
              </div>

              <div className="velox-field">
                <label>Financer Name</label>
                <input
                  type="text"
                  className="velox-input"
                  value={financerName}
                  onChange={(e) => setFinancerName(e.target.value)}
                  placeholder="e.g. HDFC BANK LTD."
                />
              </div>
            </div>

            <div className="velox-field" style={{ marginTop: '0.75rem' }}>
              <label>Remarks</label>
              <textarea
                className="velox-textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="Payment received from Mohammad H (through CASH) Proprietor of Zubiya T&T."
              />
            </div>
          </div>

          {/* Optional Meta fields */}
          <div className="velox-card">
            <div className="velox-section-title">
              <span>4. Additional Order References (Optional)</span>
            </div>

            <div className="velox-form-grid">
              <div className="velox-field">
                <label>Order / Inv No.</label>
                <input
                  type="text"
                  className="velox-input"
                  value={orderInvNo}
                  onChange={(e) => setOrderInvNo(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="velox-field">
                <label>Vehicle Model</label>
                <input
                  type="text"
                  className="velox-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Ertiga VXI CNG"
                />
              </div>

              <div className="velox-field">
                <label>TL Name</label>
                <input
                  type="text"
                  className="velox-input"
                  value={tlName}
                  onChange={(e) => setTlName(e.target.value)}
                  placeholder="Team Leader Name"
                />
              </div>

              <div className="velox-field">
                <label>DSE Name</label>
                <input
                  type="text"
                  className="velox-input"
                  value={dseName}
                  onChange={(e) => setDseName(e.target.value)}
                  placeholder="Executive Name"
                />
              </div>
            </div>
          </div>

          {/* Payment Items Table */}
          <div className="velox-card">
            <div className="velox-section-title">
              <span>5. Payment Line Items (Table)</span>
              <button
                type="button"
                onClick={addItemRow}
                className="velox-btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                + Add Payment Row
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="velox-items-table">
                <thead>
                  <tr>
                    <th style={{ width: '38px', textAlign: 'center' }}>Srl.</th>
                    <th style={{ minWidth: '95px' }}>Mode</th>
                    <th style={{ minWidth: '95px' }}>DD/CC/CHQ No.</th>
                    <th style={{ minWidth: '95px' }}>Date</th>
                    <th style={{ minWidth: '80px' }}>Favouring</th>
                    <th style={{ minWidth: '80px' }}>Drawn On</th>
                    <th style={{ minWidth: '100px' }}>Deposit Bank</th>
                    <th style={{ minWidth: '100px' }}>Amount (₹)</th>
                    <th style={{ width: '35px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.srl}</td>
                      <td>
                        <select
                          className="velox-select"
                          style={{ padding: '0.25rem 0.35rem', fontSize: '0.78rem' }}
                          value={item.mode}
                          onChange={(e) => updateItemRow(index, 'mode', e.target.value)}
                        >
                          <option value="CASH">CASH</option>
                          <option value="CHEQUE">CHEQUE</option>
                          <option value="DD">DD</option>
                          <option value="NEFT">NEFT</option>
                          <option value="RTGS">RTGS</option>
                          <option value="UPI">UPI</option>
                          <option value="CARD">CARD</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.dd_chq_no}
                          onChange={(e) => updateItemRow(index, 'dd_chq_no', e.target.value)}
                          placeholder="."
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => updateItemRow(index, 'date', e.target.value)}
                          placeholder="DD/MM/YYYY"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.favouring}
                          onChange={(e) => updateItemRow(index, 'favouring', e.target.value)}
                          placeholder="."
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.drawn_on}
                          onChange={(e) => updateItemRow(index, 'drawn_on', e.target.value)}
                          placeholder="."
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.deposit_bank}
                          onChange={(e) => updateItemRow(index, 'deposit_bank', e.target.value)}
                          placeholder="Sbi Bank"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateItemRow(index, 'amount', e.target.value)}
                          placeholder="0.00"
                          style={{ fontWeight: 700, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              color: '#ef4444',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              lineHeight: '1'
                            }}
                            title="Remove Row"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Strip */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem',
              padding: '0.65rem 0.85rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Total Receipt Amount:</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Amount In Words */}
            <div className="velox-field" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Amount in words</label>
                <label style={{ fontSize: '0.68rem', fontWeight: 500, color: '#6366f1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={manualWordsOverride}
                    onChange={(e) => setManualWordsOverride(e.target.checked)}
                    style={{ marginRight: '4px', verticalAlign: 'middle' }}
                  />
                  Manual Edit
                </label>
              </div>
              <input
                type="text"
                className="velox-input"
                value={amountInWords}
                onChange={(e) => {
                  setAmountInWords(e.target.value);
                  setManualWordsOverride(true);
                }}
                placeholder="e.g. Rupees Sixty Thousand Only"
              />
            </div>
          </div>

          {/* Action Buttons Bottom */}
          <div className="velox-form-actions-bottom">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="velox-btn-primary"
              style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', fontSize: '0.9rem' }}
            >
              {saving ? 'Saving...' : '💾 Save Velox Receipt'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="velox-btn-secondary"
              style={{ padding: '0.65rem 1.25rem', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}
            >
              {downloading ? 'Generating...' : '📥 Download PDF'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: 1:1 AUTHENTIC LIVE PAPER PREVIEW */}
        <div className="velox-preview-sticky-col">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            padding: '0 0.25rem'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Live Document Preview (As-It-Is Design)
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
              A4 Landscape Replica
            </span>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="velox-mobile-scroll-hint">
            <span>👉 Swipe horizontally on the receipt below to view full document & stamp 👈</span>
          </div>

          {/* Authentic Paper Container with Horizontal Scroll Support */}
          <div className="velox-paper-scroll-wrapper">
            <div className="velox-paper-preview">
            {/* Header */}
            <div className="velox-paper-header">
              <h2 className="velox-paper-title">RECEIPT</h2>
              <span className="velox-paper-rel">{relVersion || 'Rel 2.0.12'}</span>
            </div>

            {/* Two-column metadata */}
            <div className="velox-paper-grid">
              {/* Left Meta Column */}
              <div>
                <div className="velox-meta-row">
                  <span className="velox-meta-label">Receipt No.</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val" style={{ fontWeight: 600 }}>{receiptNo || '-'}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label">Name</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val" style={{ fontWeight: 800 }}>
                    {customerName || '-'}
                  </span>
                </div>

                <div className="velox-meta-row" style={{ alignItems: 'flex-start' }}>
                  <span className="velox-meta-label">Address</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val" style={{ whiteSpace: 'pre-line', lineHeight: '1.35' }}>
                    {address || '-'}
                  </span>
                </div>

                <div className="velox-meta-row" style={{ marginTop: '0.45rem' }}>
                  <span className="velox-meta-label">Remarks</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">
                    {remarks || '-'}
                  </span>
                </div>

                <div className="velox-meta-row" style={{ marginTop: '0.35rem' }}>
                  <span className="velox-meta-label">Order/Inv No.</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{orderInvNo || ''}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label">Model</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{model || ''}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label">TL Name</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{tlName || ''}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label">DSE Name</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{dseName || ''}</span>
                </div>
              </div>

              {/* Right Meta Column */}
              <div>
                <div className="velox-meta-row">
                  <span className="velox-meta-label" style={{ width: '130px' }}>Receipt Date</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{receiptDate || '-'}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label" style={{ width: '130px' }}>Customer ID</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{customerId || '-'}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label" style={{ width: '130px' }}>Receipt Amount</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">
                    {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label" style={{ width: '130px' }}>Hypothecated To</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{hypothecatedTo || '-'}</span>
                </div>

                <div className="velox-meta-row">
                  <span className="velox-meta-label" style={{ width: '130px' }}>Financer Name</span>
                  <span className="velox-meta-colon">:</span>
                  <span className="velox-meta-val">{financerName || '-'}</span>
                </div>
              </div>
            </div>

            {/* Payment Items Table */}
            <table className="velox-paper-table">
              <thead>
                <tr>
                  <th style={{ width: '35px' }}>Srl.</th>
                  <th style={{ width: '70px' }}>Mode</th>
                  <th style={{ width: '110px' }}>DD/CC/CHQ No.</th>
                  <th style={{ width: '85px' }}>Date</th>
                  <th style={{ width: '85px' }}>Favouring</th>
                  <th style={{ width: '85px' }}>Drawn On</th>
                  <th>Deposit Bank Name</th>
                  <th style={{ textAlign: 'right', width: '90px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.srl}</td>
                    <td>{item.mode}</td>
                    <td>{item.dd_chq_no || '.'}</td>
                    <td>{item.date}</td>
                    <td>{item.favouring || ''}</td>
                    <td>{item.drawn_on || '.'}</td>
                    <td>{item.deposit_bank || ''}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={8} style={{ borderBottom: '1px solid #0f172a', padding: 0 }}></td>
                </tr>
              </tbody>
            </table>

            {/* Total Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '0.86rem',
              margin: '0.5rem 0'
            }}>
              <div>
                <span>Total</span>
                <span style={{ marginLeft: '4.5rem' }}>:</span>
              </div>
              <div>
                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Amount In Words Row */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: '0.82rem',
              margin: '0.5rem 0 1rem 0'
            }}>
              <span style={{ fontWeight: 700, width: '130px', flexShrink: 0 }}>Amount in words</span>
              <span style={{ fontWeight: 700, margin: '0 0.5rem' }}>:</span>
              <span>{amountInWords}</span>
            </div>

            {/* Terms and Conditions & Stamp Sign Block */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginTop: '1.25rem'
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Terms and Conditions</span>
              </div>

              {/* Sign and Stamp Block */}
              <div className="velox-sign-container">
                <div className="velox-sign-header">
                  For VELOX MOTORS PVT LTD
                </div>

                <div className="velox-stamp-sign-wrap">
                  {/* Stamp & Ink Signature Graphic from attached image */}
                  <img
                    src={DEFAULT_STAMP_URL}
                    alt="Velox Motors Stamp & Sign"
                    className="velox-stamp-sign-overlay"
                    onError={(e) => {
                      // Fallback to inline text if image not reachable
                      (e.target as HTMLElement).style.display = 'none';
                    }}
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
  );
};

export default VeloxReceiptCreatePage;
