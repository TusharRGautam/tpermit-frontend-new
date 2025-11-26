import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import receiptService from '../../services/receiptService';
import { generateReceiptPDF } from '../../utils/receiptPdfGenerator';

interface ReceiptFormData {
  receiptNumber: string;
  receiptDate: string;
  customerName: string;
  customerAddress: string;
  remarks: string;
  carModel: string;
  variant: string;
  salesExecutiveName: string;
  receiptAmount: string;
  hypothecatedTo: string;
  paymentMode: string;
  mobileNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

// Car variants data from GAUTAM MOTORS inventory
const carVariants = {
  'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
  'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
  'TOYOTA RUMION': ['S CNG 1.5 MT'],
  'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
  'Maruti Suzuki Dzire': ['Tour\'s CNG'],
  'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
};

// Car models list
const carModels = Object.keys(carVariants);

// Payment modes
const paymentModes = [
  'Cash',
  'Cheque',
  'Online Transfer',
  'UPI',
  'Card',
  'RTGS/NEFT'
];

const PaymentReceipt: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [nextReceiptNumber, setNextReceiptNumber] = useState<string>('GM500');

  const [formData, setFormData] = useState<ReceiptFormData>({
    receiptNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    remarks: '',
    carModel: '',
    variant: '',
    salesExecutiveName: '',
    receiptAmount: '',
    hypothecatedTo: '',
    paymentMode: '',
    mobileNumber: ''
  });

  // Fetch next receipt number
  useEffect(() => {
    fetchNextReceiptNumber();
  }, []);

  const fetchNextReceiptNumber = async () => {
    try {
      const number = await receiptService.getNextReceiptNumber();
      setNextReceiptNumber(number);
      setFormData(prev => ({ ...prev, receiptNumber: number }));
    } catch (error) {
      console.error('Error fetching receipt number:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // If car model changes, reset variant
    if (name === 'carModel') {
      setFormData({
        ...formData,
        [name]: value,
        variant: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Customer address is required';
    }

    if (!formData.carModel) {
      newErrors.carModel = 'Car model is required';
    }

    if (!formData.salesExecutiveName.trim()) {
      newErrors.salesExecutiveName = 'Sales executive name is required';
    }

    if (!formData.receiptAmount || parseFloat(formData.receiptAmount) <= 0) {
      newErrors.receiptAmount = 'Valid receipt amount is required';
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = 'Payment mode is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const receiptData = {
        receipt_number: formData.receiptNumber,
        receipt_date: formData.receiptDate,
        customer_name: formData.customerName,
        customer_address: formData.customerAddress,
        remarks: formData.remarks,
        car_model: formData.carModel,
        variant: formData.variant,
        sales_executive_name: formData.salesExecutiveName,
        receipt_amount: parseFloat(formData.receiptAmount),
        hypothecated_to: formData.hypothecatedTo,
        payment_mode: formData.paymentMode,
        mobile_number: formData.mobileNumber
      };

      await receiptService.createReceipt(receiptData);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate('/dashboard/receipts');
      }, 2000);

    } catch (error) {
      console.error('Error creating receipt:', error);
      setErrors({ submit: 'Failed to create receipt. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle download receipt
  const handleDownloadReceipt = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await generateReceiptPDF(formData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      receiptNumber: nextReceiptNumber,
      receiptDate: new Date().toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      remarks: '',
      carModel: '',
      variant: '',
      salesExecutiveName: '',
      receiptAmount: '',
      hypothecatedTo: '',
      paymentMode: '',
      mobileNumber: ''
    });
    setErrors({});
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Create Payment Receipt</h1>
        <p>Generate payment receipt for customers</p>
      </div>

      <div className="quotation-form-container">
        <form onSubmit={handleSubmit} className="receipt-form">
          {/* Success Message */}
          {submitSuccess && (
            <div className="success-message">
              <strong>✓ Receipt created successfully!</strong>
              <p>Receipt #{formData.receiptNumber} has been saved.</p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="error-banner">
              <div className="error-icon">⚠️</div>
              <div className="error-text">
                <strong>Error:</strong> {errors.submit}
              </div>
            </div>
          )}

          {/* Receipt Header Section */}
          <div className="form-section">
            <h3>Receipt Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Receipt Number <span className="required">*</span></label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  className="form-control readonly"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Receipt Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="receiptDate"
                  value={formData.receiptDate}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="form-section">
            <h3>Customer Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.customerName ? 'error' : ''}`}
                  placeholder="Enter customer name"
                  required
                />
                {errors.customerName && <span className="error-text">{errors.customerName}</span>}
              </div>

              <div className="form-group">
                <label>Mobile Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={`form-control ${errors.mobileNumber ? 'error' : ''}`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
                {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
              </div>

              <div className="form-group full-width">
                <label>Customer Address <span className="required">*</span></label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  className={`form-control ${errors.customerAddress ? 'error' : ''}`}
                  placeholder="Enter customer address"
                  rows={3}
                  required
                />
                {errors.customerAddress && <span className="error-text">{errors.customerAddress}</span>}
              </div>
            </div>
          </div>

          {/* Vehicle & Payment Information Section */}
          <div className="form-section">
            <h3>Vehicle & Payment Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Car Model <span className="required">*</span></label>
                <select
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleInputChange}
                  className={`form-control ${errors.carModel ? 'error' : ''}`}
                  required
                >
                  <option value="">-- Select Car Model --</option>
                  {carModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                {errors.carModel && <span className="error-text">{errors.carModel}</span>}
              </div>

              <div className="form-group">
                <label>Variant</label>
                <select
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={!formData.carModel}
                >
                  <option value="">-- Select Variant --</option>
                  {formData.carModel && carVariants[formData.carModel as keyof typeof carVariants]?.map(variant => (
                    <option key={variant} value={variant}>{variant}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sales Executive Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="salesExecutiveName"
                  value={formData.salesExecutiveName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.salesExecutiveName ? 'error' : ''}`}
                  placeholder="Enter sales executive name"
                  required
                />
                {errors.salesExecutiveName && <span className="error-text">{errors.salesExecutiveName}</span>}
              </div>

              <div className="form-group">
                <label>Receipt Amount (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  name="receiptAmount"
                  value={formData.receiptAmount}
                  onChange={handleInputChange}
                  className={`form-control ${errors.receiptAmount ? 'error' : ''}`}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
                {errors.receiptAmount && <span className="error-text">{errors.receiptAmount}</span>}
              </div>

              <div className="form-group">
                <label>Payment Mode <span className="required">*</span></label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className={`form-control ${errors.paymentMode ? 'error' : ''}`}
                  required
                >
                  <option value="">-- Select Payment Mode --</option>
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                {errors.paymentMode && <span className="error-text">{errors.paymentMode}</span>}
              </div>

              <div className="form-group">
                <label>Hypothecated To</label>
                <input
                  type="text"
                  name="hypothecatedTo"
                  value={formData.hypothecatedTo}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Bank/Finance company (if applicable)"
                />
              </div>

              <div className="form-group full-width">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Additional remarks or notes"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={handleDownloadReceipt}
              disabled={isSubmitting}
            >
              Download PDF
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || submitSuccess}
            >
              {isSubmitting ? 'Saving...' : submitSuccess ? 'Saved ✓' : 'Save Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentReceipt;
