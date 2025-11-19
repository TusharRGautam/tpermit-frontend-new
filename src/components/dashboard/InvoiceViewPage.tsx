import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Dashboard.css';

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  carModel: string;
  variant: string;
  totalAmount: string;
  showroomCost: string;
  registration: string;
  insurance: string;
  noPlate: string;
  cts: string;
  gps: string;
  fastag: string;
  speedGovernor: string;
  accessories: string;
  loanAmount: string;
  margin: string;
  processFee: string;
  stampDuty: string;
  handlingCharge: string;
  loanInsurance: string;
  customerPhone: string;
  customerAddress: string;
  [key: string]: string;
}

const InvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      try {
        const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const foundInvoice = storedInvoices.find((inv: Invoice) => inv.id === id);
        
        if (foundInvoice) {
          setInvoice(foundInvoice);
        } else {
          setError(`Invoice ${id} not found`);
        }
      } catch (err) {
        setError('Error loading invoice data');
      }
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleDownload = () => {
    if (!invoice) return;
    
    // In a real app, this would generate a PDF
    // For demo, we'll just show an alert
    alert(`Downloading invoice ${invoice.id}...`);
    
    // Alternatively, we could prepare a basic PDF with jsPDF or similar library
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Invoice not found'}</p>
          <Link to="/dashboard/invoices" className="back-link">Back to Invoices</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div className="header-flex">
          <div>
            <h1>Invoice {invoice.id}</h1>
            <p>Created on {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div className="invoice-preview-actions">
            <button className="invoice-preview-btn download" onClick={handleDownload}>
              <span>📥</span> Download PDF
            </button>
            <Link to={`/dashboard/invoice/edit/${invoice.id}`} className="invoice-preview-btn edit">
              <span>✏️</span> Edit Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="invoice-preview">
        <div className="invoice-preview-header">
          <div className="invoice-preview-company">
            <h2>GAUTAM MOTORS</h2>
            <p>123 Auto Street, Mumbai, Maharashtra</p>
            <p>GSTIN: 27AABCS1234Z1Z5</p>
          </div>
          <div className="invoice-preview-details">
            <h3>Invoice #{invoice.id}</h3>
            <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="invoice-customer-details">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> {invoice.customerName}</p>
          <p><strong>Phone:</strong> {invoice.customerPhone}</p>
          {invoice.customerAddress && <p><strong>Address:</strong> {invoice.customerAddress}</p>}
        </div>

        <div className="invoice-car-details">
          <h3>Vehicle Details</h3>
          <p><strong>Model:</strong> {invoice.carModel} {invoice.variant}</p>
        </div>
        
        <div className="invoice-table-container">
          <table className="invoice-detail-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="amount-column">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cost of the vehicle Ex-Showroom</td>
                <td className="amount-column">{parseInt(invoice.showroomCost).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Registration</td>
                <td className="amount-column">{parseInt(invoice.registration).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Insurance</td>
                <td className="amount-column">{parseInt(invoice.insurance).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Number Plate + CRTM + Autocard</td>
                <td className="amount-column">{parseInt(invoice.noPlate).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>CTS 1%</td>
                <td className="amount-column">{parseInt(invoice.cts).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>GPS</td>
                <td className="amount-column">{parseInt(invoice.gps).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Fastag</td>
                <td className="amount-column">{parseInt(invoice.fastag).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Speed Governor</td>
                <td className="amount-column">{parseInt(invoice.speedGovernor).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Accessories</td>
                <td className="amount-column">{parseInt(invoice.accessories).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="total-row">
                <td><strong>On the Road Price</strong></td>
                <td className="amount-column"><strong>{invoice.totalAmount}</strong></td>
              </tr>
              <tr>
                <td>Loan Amount</td>
                <td className="amount-column">{parseInt(invoice.loanAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Margin (Downpayment)</td>
                <td className="amount-column">{parseInt(invoice.margin).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Process Fee</td>
                <td className="amount-column">{parseInt(invoice.processFee).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Stamp Duty</td>
                <td className="amount-column">{parseInt(invoice.stampDuty).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Handling Loan Services and Document Charge</td>
                <td className="amount-column">{parseInt(invoice.handlingCharge).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Loan Suraksha Insurance</td>
                <td className="amount-column">{parseInt(invoice.loanInsurance).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="invoice-footer">
          <p><strong>Note:</strong> This is a computer-generated invoice and requires no signature.</p>
        </div>
      </div>

      <div className="page-actions">
        <Link to="/dashboard/invoices" className="back-link">Back to Invoices</Link>
      </div>
    </div>
  );
};

export default InvoiceViewPage; 