import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  carModel: string;
  variant: string;
  totalAmount: string;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Mocked data - in a real app, this would come from API
  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      const mockInvoices: Invoice[] = [
        {
          id: 'INV-2023-042',
          date: '2023-05-25',
          customerName: 'Rahul Sharma',
          carModel: 'Maruti Ertiga',
          variant: 'ZXI+',
          totalAmount: '₹11,25,500'
        },
        {
          id: 'INV-2023-041',
          date: '2023-05-23',
          customerName: 'Priya Patel',
          carModel: 'Maruti WagonR',
          variant: 'VXI',
          totalAmount: '₹6,75,300'
        },
        {
          id: 'INV-2023-040',
          date: '2023-05-20',
          customerName: 'Amit Singh',
          carModel: 'Hyundai Aura',
          variant: 'SX+',
          totalAmount: '₹8,45,000'
        }
      ];
      setInvoices(mockInvoices);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort invoices based on selected criteria
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortBy === 'carModel') {
      comparison = a.carModel.localeCompare(b.carModel);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Handle download invoice
  const handleDownload = (invoiceId: string) => {
    // In a real app, this would generate and download a PDF
    alert(`Downloading invoice ${invoiceId}...`);
  };

  // Sort handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Invoice Management</h1>
        <p>View, download, and edit previously generated invoices</p>
      </div>

      <div className="invoice-actions">
        <div className="invoice-search">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <Link to="/dashboard/invoice" className="create-invoice-btn">
          Create New Invoice
        </Link>
      </div>

      {sortedInvoices.length === 0 ? (
        <div className="no-invoices">
          <p>No invoices found. Create your first invoice to get started.</p>
        </div>
      ) : (
        <div className="invoice-list-container">
          <table className="invoice-list-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>
                  Invoice # {sortBy === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('date')}>
                  Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('customerName')}>
                  Customer {sortBy === 'customerName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('carModel')}>
                  Vehicle {sortBy === 'carModel' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{new Date(invoice.date).toLocaleDateString()}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.carModel} {invoice.variant}</td>
                  <td>{invoice.totalAmount}</td>
                  <td className="invoice-actions-cell">
                    <button 
                      className="invoice-action-btn view"
                      onClick={() => window.open(`/dashboard/invoice/view/${invoice.id}`, '_blank')}
                    >
                      View
                    </button>
                    <button 
                      className="invoice-action-btn download"
                      onClick={() => handleDownload(invoice.id)}
                    >
                      Download
                    </button>
                    <Link 
                      to={`/dashboard/invoice/edit/${invoice.id}`} 
                      className="invoice-action-btn edit"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList; 