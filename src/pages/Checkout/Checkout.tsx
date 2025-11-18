import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { clearCart } from '../../redux/slices/cartSlice';
import bookingService from '../../services/bookingService';
import './Checkout.css';

interface PaymentFormData {
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet';
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  bankName?: string;
  walletType?: string;
  agreeToTerms: boolean;
}

const Checkout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    paymentMethod: 'upi',
    agreeToTerms: false
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect to cart if no items
  if (items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <div className="empty-checkout-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 16.6 18 16 18H8C7.4 18 7 17.6 7 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>No items to checkout</h2>
          <p>Your cart is empty. Add some cars to your cart before proceeding to checkout.</p>
          <Link to="/" className="back-to-shopping-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!paymentData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    switch (paymentData.paymentMethod) {
      case 'upi':
        if (!paymentData.upiId) {
          newErrors.upiId = 'UPI ID is required';
        } else if (!/^[\w.-]+@[\w.-]+$/.test(paymentData.upiId)) {
          newErrors.upiId = 'Invalid UPI ID format';
        }
        break;
        
      case 'card':
        if (!paymentData.cardNumber) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
          newErrors.cardNumber = 'Invalid card number';
        }
        if (!paymentData.cardExpiry) {
          newErrors.cardExpiry = 'Expiry date is required';
        }
        if (!paymentData.cardCvv) {
          newErrors.cardCvv = 'CVV is required';
        }
        if (!paymentData.cardHolder) {
          newErrors.cardHolder = 'Cardholder name is required';
        }
        break;
        
      case 'netbanking':
        if (!paymentData.bankName) {
          newErrors.bankName = 'Please select a bank';
        }
        break;
        
      case 'wallet':
        if (!paymentData.walletType) {
          newErrors.walletType = 'Please select a wallet';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Process each cart item as a booking using the booking service
      const bookingResults = await bookingService.processCartBookings(items);
      
      if (bookingResults.totalFailed > 0) {
        console.error('Some bookings failed:', bookingResults.failed);
        alert(`${bookingResults.totalSuccessful} bookings were successful, but ${bookingResults.totalFailed} failed. Please check your details and try again.`);
        return;
      }
      
      // Clear the cart after successful payment
      dispatch(clearCart());
      
      // Show success message with booking details
      alert(`Payment successful! ${bookingResults.totalSuccessful} booking(s) confirmed. Total amount: ₹${totalAmount.toLocaleString()}. Your booking confirmations will be sent via email and SMS.`);
      navigate('/');
      
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('There was an error processing your booking. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    switch (paymentData.paymentMethod) {
      case 'upi':
        return (
          <div className="payment-fields">
            <div className="form-field">
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="Enter your UPI ID (e.g., user@paytm)"
                value={paymentData.upiId || ''}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                className={errors.upiId ? 'error' : ''}
              />
              {errors.upiId && <span className="error-text">{errors.upiId}</span>}
            </div>
          </div>
        );
        
      case 'card':
        return (
          <div className="payment-fields">
            <div className="form-field">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="Enter cardholder name"
                value={paymentData.cardHolder || ''}
                onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                className={errors.cardHolder ? 'error' : ''}
              />
              {errors.cardHolder && <span className="error-text">{errors.cardHolder}</span>}
            </div>
            <div className="form-field">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                value={paymentData.cardNumber || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                  handleInputChange('cardNumber', value);
                }}
                className={errors.cardNumber ? 'error' : ''}
              />
              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={paymentData.cardExpiry || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
                    handleInputChange('cardExpiry', value);
                  }}
                  className={errors.cardExpiry ? 'error' : ''}
                />
                {errors.cardExpiry && <span className="error-text">{errors.cardExpiry}</span>}
              </div>
              <div className="form-field">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  maxLength={3}
                  value={paymentData.cardCvv || ''}
                  onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                  className={errors.cardCvv ? 'error' : ''}
                />
                {errors.cardCvv && <span className="error-text">{errors.cardCvv}</span>}
              </div>
            </div>
          </div>
        );
        
      case 'netbanking':
        return (
          <div className="payment-fields">
            <div className="form-field">
              <label>Select Bank</label>
              <select
                value={paymentData.bankName || ''}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className={errors.bankName ? 'error' : ''}
              >
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="pnb">Punjab National Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="other">Other</option>
              </select>
              {errors.bankName && <span className="error-text">{errors.bankName}</span>}
            </div>
          </div>
        );
        
      case 'wallet':
        return (
          <div className="payment-fields">
            <div className="form-field">
              <label>Select Wallet</label>
              <select
                value={paymentData.walletType || ''}
                onChange={(e) => handleInputChange('walletType', e.target.value)}
                className={errors.walletType ? 'error' : ''}
              >
                <option value="">Choose your wallet</option>
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
                <option value="googlepay">Google Pay</option>
                <option value="amazonfay">Amazon Pay</option>
                <option value="mobikwik">MobiKwik</option>
                <option value="freecharge">FreeCharge</option>
              </select>
              {errors.walletType && <span className="error-text">{errors.walletType}</span>}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link> / <Link to="/cart">Cart</Link> / Checkout
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="section">
              <h3>Order Summary</h3>
              <div className="order-items">
                {items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img src={item.carImage} alt={item.carName} />
                    </div>
                    <div className="item-details">
                      <h4>{item.carName}</h4>
                      <p>{item.variant.name} Variant</p>
                      <span className="item-price">₹{item.bookingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h3>Payment Method</h3>
              <div className="payment-methods">
                <label className={`payment-method ${paymentData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentData.paymentMethod === 'upi'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">📱</span>
                    <span>UPI</span>
                  </div>
                </label>

                <label className={`payment-method ${paymentData.paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentData.paymentMethod === 'card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">💳</span>
                    <span>Credit/Debit Card</span>
                  </div>
                </label>

                <label className={`payment-method ${paymentData.paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentData.paymentMethod === 'netbanking'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">🏦</span>
                    <span>Net Banking</span>
                  </div>
                </label>

                <label className={`payment-method ${paymentData.paymentMethod === 'wallet' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentData.paymentMethod === 'wallet'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">👛</span>
                    <span>Digital Wallet</span>
                  </div>
                </label>
              </div>

              {renderPaymentFields()}
            </div>

            <div className="section">
              <div className="terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={paymentData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  I agree to the <a href="#" target="_blank">Terms and Conditions</a> and <a href="#" target="_blank">Privacy Policy</a>
                </label>
                {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
              </div>
            </div>

            <div className="checkout-actions">
              <button 
                type="submit" 
                className="pay-now-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="processing-spinner"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pay ₹{totalAmount.toLocaleString()}
                  </>
                )}
              </button>
              <Link to="/cart" className="back-to-cart">
                ← Back to Cart
              </Link>
            </div>
          </form>
        </div>

        <div className="checkout-summary">
          <div className="summary-card">
            <h3>Payment Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Items ({totalItems}):</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Processing Fee:</span>
                <span>₹0</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="security-notice">
              <div className="security-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>Your payment information is secure and encrypted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;