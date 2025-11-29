import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import receiptService from '../../services/receiptService';
import { generateReceiptPDF } from '../../utils/receiptPdfGenerator';

interface Receipt {
  id: string;
  receipt_number: string;
  receipt_date: string;
  customer_name: string;
  customer_address: string;
  mobile_number: string;
  remarks?: string;
  car_model: string;
  sales_executive_name: string;
  receipt_amount: number;
  hypothecated_to?: string;
  payment_mode: string;
  created_at: string;
  updated_at: string;
}

const ReceiptList: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    carModel: '',
    paymentMode: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    filterReceipts();
  }, [searchTerm, filters, receipts]);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const data = await receiptService.getAllReceipts();
      setReceipts(data);
      setFilteredReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReceipts = () => {
    let filtered = [...receipts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.mobile_number.includes(searchTerm) ||
        receipt.car_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Car model filter
    if (filters.carModel) {
      filtered = filtered.filter(receipt =>
        receipt.car_model.toLowerCase().includes(filters.carModel.toLowerCase())
      );
    }

    // Payment mode filter
    if (filters.paymentMode) {
      filtered = filtered.filter(receipt =>
        receipt.payment_mode === filters.paymentMode
      );
    }

    // Date range filter
    if (filters.fromDate) {
      filtered = filtered.filter(receipt =>
        new Date(receipt.receipt_date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(receipt =>
        new Date(receipt.receipt_date) <= new Date(filters.toDate)
      );
    }

    setFilteredReceipts(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      carModel: '',
      paymentMode: '',
      fromDate: '',
      toDate: ''
    });
  };

  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailModalOpen(true);
  };

  const handleDownloadReceipt = async (receipt: Receipt) => {
    const receiptData = {
      receiptNumber: receipt.receipt_number,
      receiptDate: receipt.receipt_date,
      customerName: receipt.customer_name,
      customerAddress: receipt.customer_address,
      remarks: receipt.remarks || '',
      carModel: receipt.car_model,
      salesExecutiveName: receipt.sales_executive_name,
      receiptAmount: receipt.receipt_amount.toString(),
      hypothecatedTo: receipt.hypothecated_to || '',
      paymentMode: receipt.payment_mode,
      mobileNumber: receipt.mobile_number
    };
    try {
      await generateReceiptPDF(receiptData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDeleteClick = (receipt: Receipt) => {
    setReceiptToDelete(receipt);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!receiptToDelete) return;

    try {
      await receiptService.deleteReceipt(receiptToDelete.id);
      await fetchReceipts();
      setIsDeleteModalOpen(false);
      setReceiptToDelete(null);
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Failed to delete receipt');
    }
  };

  const formatCurrency = (amount: number): string => {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading receipts...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Payment Receipts</h1>
        <p>View, search, and manage all payment receipts</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/receipt/new')}
          style={{ marginTop: '1rem' }}
        >
          + Create New Receipt
        </button>
      </div>

      {/* Search and Filters */}
      <div className="quotation-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by customer name, mobile, car model, or receipt number..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            name="carModel"
            value={filters.carModel}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Car Models</option>
            <option value="Wagon-R">Wagon-R</option>
            <option value="ERTIGA">ERTIGA</option>
            <option value="RUMION">RUMION</option>
            <option value="AURA">AURA</option>
            <option value="Dzire">Dzire</option>
            <option value="Innova">Innova Crysta</option>
          </select>

          <select
            name="paymentMode"
            value={filters.paymentMode}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Online Transfer">Online Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="RTGS/NEFT">RTGS/NEFT</option>
          </select>

          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className="filter-input"
            placeholder="From Date"
          />

          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className="filter-input"
            placeholder="To Date"
          />

          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {filteredReceipts.length} of {receipts.length} receipts
          {filteredReceipts.length > 0 && (
            <span> | Total Amount: {formatCurrency(filteredReceipts.reduce((sum, r) => sum + r.receipt_amount, 0))}</span>
          )}
        </p>
      </div>

      {/* Receipts Table - Desktop View */}
      <div className="quotations-table-container desktop-table-view">
        {filteredReceipts.length === 0 ? (
          <div className="no-data-message">
            <p>No receipts found. {searchTerm || Object.values(filters).some(v => v) ? 'Try adjusting your filters.' : 'Create your first receipt!'}</p>
          </div>
        ) : (
          <table className="quotations-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Car Model</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map(receipt => (
                <tr key={receipt.id}>
                  <td className="receipt-number">{receipt.receipt_number}</td>
                  <td>{formatDate(receipt.receipt_date)}</td>
                  <td>{receipt.customer_name}</td>
                  <td>{receipt.mobile_number}</td>
                  <td>{receipt.car_model}</td>
                  <td className="amount">{formatCurrency(receipt.receipt_amount)}</td>
                  <td>
                    <span className={`payment-mode-badge ${receipt.payment_mode.toLowerCase().replace(/\s+/g, '-')}`}>
                      {receipt.payment_mode}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleViewDetails(receipt)}
                      className="btn-action btn-view"
                      title="View Details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadReceipt(receipt)}
                      className="btn-action btn-download"
                      title="Download PDF"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteClick(receipt)}
                      className="btn-action btn-delete"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Receipts Cards - Mobile View */}
      <div className="receipts-cards-container mobile-card-view">
        {filteredReceipts.length === 0 ? (
          <div className="no-data-message">
            <p>No receipts found. {searchTerm || Object.values(filters).some(v => v) ? 'Try adjusting your filters.' : 'Create your first receipt!'}</p>
          </div>
        ) : (
          <div className="receipts-cards-grid">
            {filteredReceipts.map(receipt => (
              <div key={receipt.id} className="receipt-card">
                <div className="receipt-card-header">
                  <div className="receipt-card-number">
                    <span className="label">Receipt #</span>
                    <span className="receipt-number">{receipt.receipt_number}</span>
                  </div>
                  <div className="receipt-card-date">
                    {formatDate(receipt.receipt_date)}
                  </div>
                </div>

                <div className="receipt-card-body">
                  <div className="receipt-card-row">
                    <span className="label">Customer:</span>
                    <span className="value">{receipt.customer_name}</span>
                  </div>
                  <div className="receipt-card-row">
                    <span className="label">Mobile:</span>
                    <span className="value">{receipt.mobile_number}</span>
                  </div>
                  <div className="receipt-card-row">
                    <span className="label">Car Model:</span>
                    <span className="value">{receipt.car_model}</span>
                  </div>
                  <div className="receipt-card-row amount-row">
                    <span className="label">Amount:</span>
                    <span className="value amount">{formatCurrency(receipt.receipt_amount)}</span>
                  </div>
                  <div className="receipt-card-row">
                    <span className="label">Payment:</span>
                    <span className={`payment-mode-badge ${receipt.payment_mode.toLowerCase().replace(/\s+/g, '-')}`}>
                      {receipt.payment_mode}
                    </span>
                  </div>
                </div>

                <div className="receipt-card-actions">
                  <button
                    onClick={() => handleViewDetails(receipt)}
                    className="btn-card-action btn-view"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleDownloadReceipt(receipt)}
                    className="btn-card-action btn-download"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => handleDeleteClick(receipt)}
                    className="btn-card-action btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedReceipt && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Receipt Details - {selectedReceipt.receipt_number}</h2>
              <button className="close-btn" onClick={() => setIsDetailModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Receipt Number:</label>
                  <span>{selectedReceipt.receipt_number}</span>
                </div>
                <div className="detail-item">
                  <label>Receipt Date:</label>
                  <span>{formatDate(selectedReceipt.receipt_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Customer Name:</label>
                  <span>{selectedReceipt.customer_name}</span>
                </div>
                <div className="detail-item">
                  <label>Mobile Number:</label>
                  <span>{selectedReceipt.mobile_number}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Customer Address:</label>
                  <span>{selectedReceipt.customer_address}</span>
                </div>
                <div className="detail-item">
                  <label>Car Model:</label>
                  <span>{selectedReceipt.car_model}</span>
                </div>
                <div className="detail-item">
                  <label>Sales Executive:</label>
                  <span>{selectedReceipt.sales_executive_name}</span>
                </div>
                <div className="detail-item">
                  <label>Receipt Amount:</label>
                  <span className="amount-highlight">{formatCurrency(selectedReceipt.receipt_amount)}</span>
                </div>
                <div className="detail-item">
                  <label>Payment Mode:</label>
                  <span>{selectedReceipt.payment_mode}</span>
                </div>
                {selectedReceipt.hypothecated_to && (
                  <div className="detail-item">
                    <label>Hypothecated To:</label>
                    <span>{selectedReceipt.hypothecated_to}</span>
                  </div>
                )}
                {selectedReceipt.remarks && (
                  <div className="detail-item full-width">
                    <label>Remarks:</label>
                    <span>{selectedReceipt.remarks}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => handleDownloadReceipt(selectedReceipt)}
              >
                Download PDF
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && receiptToDelete && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={() => setIsDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete receipt <strong>{receiptToDelete.receipt_number}</strong>?</p>
              <p>Customer: <strong>{receiptToDelete.customer_name}</strong></p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptList;
