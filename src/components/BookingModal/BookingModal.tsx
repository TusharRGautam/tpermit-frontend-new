import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../redux/slices/cartSlice';
import './BookingModal.css';

interface CarVariant {
  id: string;
  name: string;
  exShowroom: number;
  onRoadPrice: number;
  monthlyEmi: number;
  downPayment: number;
  bookingAmount: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  carName: string;
  carImage: string;
  variants: CarVariant[];
}

interface BookingData {
  carName: string;
  variant: CarVariant;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerPincode: string;
  bookingAmount: number;
}

interface ValidationErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPincode?: string;
}

interface ToastMessage {
  type: 'success' | 'error' | 'info';
  message: string;
  show: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  carName,
  carImage,
  variants
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [toast, setToast] = useState<ToastMessage>({ type: 'info', message: '', show: false });
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return 'Enter a valid 10-digit Indian mobile number';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address';
    return '';
  };

  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 10) return 'Please provide a detailed address (minimum 10 characters)';
    return '';
  };

  const validateCity = (city: string): string => {
    if (!city.trim()) return 'City is required';
    if (city.trim().length < 2) return 'Enter a valid city name';
    if (!/^[a-zA-Z\s]+$/.test(city.trim())) return 'City name can only contain letters and spaces';
    return '';
  };

  const validatePincode = (pincode: string): string => {
    if (!pincode.trim()) return 'Pincode is required';
    if (!/^\d{6}$/.test(pincode.trim())) return 'Enter a valid 6-digit pincode';
    return '';
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    const nameError = validateName(customerName);
    if (nameError) { errors.customerName = nameError; isValid = false; }

    const phoneError = validatePhone(customerPhone);
    if (phoneError) { errors.customerPhone = phoneError; isValid = false; }

    const emailError = validateEmail(customerEmail);
    if (emailError) { errors.customerEmail = emailError; isValid = false; }

    const addressError = validateAddress(customerAddress);
    if (addressError) { errors.customerAddress = addressError; isValid = false; }

    const cityError = validateCity(customerCity);
    if (cityError) { errors.customerCity = cityError; isValid = false; }

    const pincodeError = validatePincode(customerPincode);
    if (pincodeError) { errors.customerPincode = pincodeError; isValid = false; }

    setValidationErrors(errors);
    return isValid;
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Reset form when modal opens and load saved user profile
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedVariant(null);
      setIsSubmitting(false);
      setValidationErrors({});
      setToast({ type: 'info', message: '', show: false });
      setIsFormValid(false);

      // Load user profile from localStorage if exists
      try {
        const savedUser = localStorage.getItem('tpermit_user_profile');
        if (savedUser) {
          const profile = JSON.parse(savedUser);
          setCustomerName(profile.name || '');
          setCustomerPhone(profile.phone || '');
          setCustomerEmail(profile.email || '');
          setCustomerAddress(profile.address || '');
          setCustomerCity(profile.city || '');
          setCustomerPincode(profile.pincode || '');
          showToast('info', 'Welcome back! Your details have been pre-filled.');
        } else {
          // Clear form for new users
          setCustomerName('');
          setCustomerPhone('');
          setCustomerEmail('');
          setCustomerAddress('');
          setCustomerCity('');
          setCustomerPincode('');
        }
      } catch (error) {
        console.error('Error loading user profile from localStorage:', error);
        // Clear form on error
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerAddress('');
        setCustomerCity('');
        setCustomerPincode('');
      }
    }
  }, [isOpen, variants]);

  // Real-time form validation
  useEffect(() => {
    if (currentStep === 3) {
      const isValid = customerName.trim() && 
                     customerPhone.trim() && 
                     customerEmail.trim() && 
                     customerAddress.trim() && 
                     customerCity.trim() && 
                     customerPincode.trim();
      setIsFormValid(Boolean(isValid));
    }
  }, [currentStep, customerName, customerPhone, customerEmail, customerAddress, customerCity, customerPincode]);

  // Close modal on escape key and handle mobile positioning
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Force scroll to top when modal opens (additional safety measure)
      const isMobile = window.innerWidth <= 992;
      if (isMobile) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          
          // Force the modal overlay to reset its scroll position
          const modalOverlay = document.querySelector('.booking-modal-overlay') as HTMLElement;
          if (modalOverlay) {
            modalOverlay.scrollTop = 0;
          }
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleVariantSelect = (variant: CarVariant) => {
    setSelectedVariant(variant);
    setCurrentStep(2);
  };

  const handleBookingConfirm = () => {
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVariant) {
      showToast('error', 'Please select a variant first');
      setCurrentStep(1);
      return;
    }

    // Validate all form fields
    if (!validateForm()) {
      showToast('error', 'Please correct the highlighted errors before proceeding');
      return;
    }

    setIsSubmitting(true);
    showToast('info', 'Processing your booking...');

    // Simulate processing delay for better UX
    setTimeout(async () => {
      try {
        // Save user profile to localStorage for future bookings
        try {
          localStorage.setItem('tpermit_user_profile', JSON.stringify({
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            address: customerAddress.trim(),
            city: customerCity.trim(),
            pincode: customerPincode.trim(),
            last_updated: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error saving user profile to localStorage:', error);
        }

        // Add item to cart with complete customer details
        dispatch(addToCart({
          carName,
          carImage,
          variant: selectedVariant,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          customerAddress: customerAddress.trim(),
          customerCity: customerCity.trim(),
          customerPincode: customerPincode.trim(),
          bookingAmount: selectedVariant.bookingAmount
        }));

        // Show success message with details
        showToast('success', `🎉 ${carName} (${selectedVariant.name}) has been successfully added to your cart!`);
        
        // Wait for success message to be visible, then navigate
        setTimeout(() => {
          onClose();
          navigate('/cart');
        }, 1500);
      } catch (error) {
        console.error('Failed to add to cart:', error);
        showToast('error', 'Failed to add item to cart. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    }, 1200); // Realistic processing time
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Variant';
      case 2: return 'Booking Amount';
      case 3: return 'Customer Details';
      default: return 'Book Your Car';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Choose your preferred variant to proceed with booking';
      case 2: return 'Review the booking amount and pricing details';
      case 3: return 'Provide your contact information to complete the booking';
      default: return '';
    }
  };

  // Input handlers with real-time validation
  const handleNameChange = (value: string) => {
    setCustomerName(value);
    if (validationErrors.customerName) {
      const error = validateName(value);
      setValidationErrors(prev => ({ ...prev, customerName: error || undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      setCustomerPhone(numericValue);
      if (validationErrors.customerPhone) {
        const error = validatePhone(numericValue);
        setValidationErrors(prev => ({ ...prev, customerPhone: error || undefined }));
      }
    }
  };

  const handleEmailChange = (value: string) => {
    setCustomerEmail(value);
    if (validationErrors.customerEmail) {
      const error = validateEmail(value);
      setValidationErrors(prev => ({ ...prev, customerEmail: error || undefined }));
    }
  };

  const handleAddressChange = (value: string) => {
    setCustomerAddress(value);
    if (validationErrors.customerAddress) {
      const error = validateAddress(value);
      setValidationErrors(prev => ({ ...prev, customerAddress: error || undefined }));
    }
  };

  const handleCityChange = (value: string) => {
    setCustomerCity(value);
    if (validationErrors.customerCity) {
      const error = validateCity(value);
      setValidationErrors(prev => ({ ...prev, customerCity: error || undefined }));
    }
  };

  const handlePincodeChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setCustomerPincode(numericValue);
      if (validationErrors.customerPincode) {
        const error = validatePincode(numericValue);
        setValidationErrors(prev => ({ ...prev, customerPincode: error || undefined }));
      }
    }
  };

  if (!isOpen) return null;

  // Use portal to render modal at document root level for better positioning control
  const modalContent = (
    <div className={`booking-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="booking-modal step-modal" onClick={(e) => e.stopPropagation()}>
        {/* Toast Notification */}
        {toast.show && (
          <div className={`toast-notification toast-${toast.type} ${toast.show ? 'show' : ''}`}>
            <div className="toast-content">
              <span className="toast-icon">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '⚠'}
                {toast.type === 'info' && 'ℹ'}
              </span>
              <span className="toast-message">{toast.message}</span>
            </div>
          </div>
        )}
        
        <div className="booking-modal-header">
          <div className="step-header">
            <h2>{getStepTitle()}</h2>
            <div className="step-indicator">
              <span className="step-text">Step {currentStep} of 3</span>
              <div className="step-progress">
                <div 
                  className="step-progress-bar" 
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <button className="booking-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="booking-modal-body">
          <div className="car-info-header">
            <div className="car-image-preview">
              <img src={carImage} alt={carName} />
            </div>
            <h3 className="car-name">{carName}</h3>
          </div>

          {/* Step 1: Variant Selection */}
          {currentStep === 1 && (
            <div className="step-content variant-step">
              <div className="step-description">
                <p>{getStepDescription()}</p>
              </div>
              <div className="variant-selector">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="variant-option clickable"
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <div className="variant-details">
                      <div className="variant-name">{variant.name}</div>
                      <div className="variant-price">₹{variant.exShowroom.toLocaleString()}</div>
                      <div className="variant-emi">EMI: ₹{variant.monthlyEmi.toLocaleString()}/month</div>
                    </div>
                    <div className="variant-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Booking Amount */}
          {currentStep === 2 && selectedVariant && (
            <div className="step-content booking-amount-step">
              <div className="step-description">
                <p>{getStepDescription()}</p>
              </div>
              <div className="selected-variant-info">
                <div className="variant-badge">
                  <span>Selected: {selectedVariant.name}</span>
                </div>
              </div>
              
              <div className="booking-amount-display">
                <div className="amount-highlight">
                  <h2>Booking Amount</h2>
                  <div className="amount-value">₹{selectedVariant.bookingAmount.toLocaleString()}</div>
                  <p>Secure your {selectedVariant.name} with this token amount</p>
                </div>
                
                <div className="price-breakdown">
                  <div className="price-item">
                    <span>Ex-Showroom Price:</span>
                    <span>₹{selectedVariant.exShowroom.toLocaleString()}</span>
                  </div>
                  <div className="price-item">
                    <span>On-Road Price:</span>
                    <span>₹{selectedVariant.onRoadPrice.toLocaleString()}</span>
                  </div>
                  <div className="price-item">
                    <span>Monthly EMI:</span>
                    <span>₹{selectedVariant.monthlyEmi.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button 
                  className="booking-btn-outline"
                  onClick={() => setCurrentStep(1)}
                >
                  ← Back
                </button>
                <button 
                  className="booking-btn"
                  onClick={handleBookingConfirm}
                >
                  Continue to Details →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {currentStep === 3 && (
            <div className="step-content customer-details-step">
              <div className="step-description">
                <p>{getStepDescription()}</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="customer-form">
                  <div className="booking-form-group">
                    <label htmlFor="customerName">Full Name *</label>
                    <input
                      type="text"
                      id="customerName"
                      className={`booking-form-input ${validationErrors.customerName ? 'error' : ''}`}
                      value={customerName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                    {validationErrors.customerName && (
                      <span className="error-message">{validationErrors.customerName}</span>
                    )}
                  </div>

                  <div className="booking-form-group">
                    <label htmlFor="customerPhone">Phone Number *</label>
                    <input
                      type="tel"
                      id="customerPhone"
                      className={`booking-form-input ${validationErrors.customerPhone ? 'error' : ''}`}
                      value={customerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      required
                      placeholder="Enter your 10-digit mobile number"
                      maxLength={10}
                    />
                    {validationErrors.customerPhone && (
                      <span className="error-message">{validationErrors.customerPhone}</span>
                    )}
                  </div>

                  <div className="booking-form-group">
                    <label htmlFor="customerEmail">Email Address *</label>
                    <input
                      type="email"
                      id="customerEmail"
                      className={`booking-form-input ${validationErrors.customerEmail ? 'error' : ''}`}
                      value={customerEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      placeholder="Enter your email address"
                    />
                    {validationErrors.customerEmail && (
                      <span className="error-message">{validationErrors.customerEmail}</span>
                    )}
                  </div>

                  <div className="booking-form-group">
                    <label htmlFor="customerAddress">Complete Address *</label>
                    <textarea
                      id="customerAddress"
                      className={`booking-form-input ${validationErrors.customerAddress ? 'error' : ''}`}
                      value={customerAddress}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      required
                      placeholder="Enter your complete address with street, area, landmark"
                      rows={3}
                    />
                    {validationErrors.customerAddress && (
                      <span className="error-message">{validationErrors.customerAddress}</span>
                    )}
                  </div>

                  <div className="booking-form-row">
                    <div className="booking-form-group">
                      <label htmlFor="customerCity">City *</label>
                      <input
                        type="text"
                        id="customerCity"
                        className={`booking-form-input ${validationErrors.customerCity ? 'error' : ''}`}
                        value={customerCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        required
                        placeholder="Enter your city"
                      />
                      {validationErrors.customerCity && (
                        <span className="error-message">{validationErrors.customerCity}</span>
                      )}
                    </div>

                    <div className="booking-form-group">
                      <label htmlFor="customerPincode">Pincode *</label>
                      <input
                        type="text"
                        id="customerPincode"
                        className={`booking-form-input ${validationErrors.customerPincode ? 'error' : ''}`}
                        value={customerPincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        required
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                      />
                      {validationErrors.customerPincode && (
                        <span className="error-message">{validationErrors.customerPincode}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button 
                    type="button"
                    className="booking-btn-outline"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className={`booking-btn ${!isFormValid ? 'disabled' : ''}`}
                    disabled={isSubmitting || !isFormValid}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="booking-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 16.6 18 16 18H8C7.4 18 7 17.6 7 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {isFormValid ? `Add to Cart - ₹${selectedVariant?.bookingAmount.toLocaleString()}` : 'Please fill all required fields'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="booking-modal-footer">
          <p className="booking-disclaimer">
            {currentStep === 3 
              ? "* By adding to cart, you can review your selection and proceed with payment later." 
              : "* Secure booking with easy payment options available at checkout."
            }
          </p>
        </div>
      </div>
    </div>
  );

  // Render modal using React Portal for better positioning control
  return createPortal(modalContent, document.body);
};

export default BookingModal;