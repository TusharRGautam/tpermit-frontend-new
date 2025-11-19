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
      // Save current scroll position
      const scrollY = window.scrollY;

      document.addEventListener('keydown', handleEscape);

      // Lock body scroll completely
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';

      // Force scroll to top when modal opens
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Reset modal overlay scroll position
        const modalOverlay = document.querySelector('.booking-modal-overlay') as HTMLElement;
        if (modalOverlay) {
          modalOverlay.scrollTop = 0;
        }
      });
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Clean up body styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
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
                <h3 className="step-title-mobile">Choose Your Variant</h3>
                <p className="step-subtitle-mobile">Select the variant that suits you best</p>
                <div className="hindi-message-box">
                  <span className="hindi-text">आप सिर्फ ₹5000 बुकिंग अमाउंट पे करेंगे</span>
                  <span className="english-text">You will only pay ₹5000 booking amount</span>
                </div>
              </div>
              <div className="variant-selector-simple">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="variant-card-simple"
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <div className="variant-number-badge">{index + 1}</div>
                    <div className="variant-info-simple">
                      <h4 className="variant-name-simple">{variant.name}</h4>
                      <div className="variant-booking-amount">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/>
                        </svg>
                        <span>Book for ₹{variant.bookingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="variant-arrow-simple">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
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
                <h3 className="step-title-mobile">Booking Amount</h3>
                <p className="step-subtitle-mobile">Review pricing details for your selected variant</p>
              </div>

              {/* Selected Variant Card */}
              <div className="selected-variant-card-mobile">
                <div className="selected-badge-mobile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Selected Variant</span>
                </div>
                <h4 className="selected-variant-name-mobile">{selectedVariant.name}</h4>
              </div>

              {/* Booking Token Amount - Primary Focus */}
              <div className="booking-token-card-mobile">
                <div className="token-header-mobile">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/>
                  </svg>
                  <span>अभी सिर्फ यह अमाउंट पे करें | Pay Only This Amount Now</span>
                </div>
                <div className="token-amount-mobile">
                  ₹{selectedVariant.bookingAmount.toLocaleString()}
                </div>
                <p className="token-description-mobile">
                  <strong className="hindi-highlight">आप सिर्फ ₹5000 बुकिंग अमाउंट पे करेंगे</strong>
                  <br/>
                  Pay only ₹5000 to secure your {selectedVariant.name}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown-card-mobile">
                <div className="breakdown-header-mobile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  <span>पूरी कीमत की जानकारी (सिर्फ देखने के लिए)</span>
                </div>
                <div className="pricing-info-note">
                  <span>Complete Pricing Details (For Reference Only)</span>
                </div>

                <div className="price-items-mobile">
                  <div className="price-row-mobile">
                    <div className="price-label-mobile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      <span>Ex-Showroom Price</span>
                    </div>
                    <div className="price-value-mobile">₹{selectedVariant.exShowroom.toLocaleString()}</div>
                  </div>

                  <div className="price-row-mobile">
                    <div className="price-label-mobile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                      </svg>
                      <span>On-Road Price</span>
                    </div>
                    <div className="price-value-mobile highlight">₹{selectedVariant.onRoadPrice.toLocaleString()}</div>
                  </div>

                  <div className="price-row-mobile emi-row">
                    <div className="price-label-mobile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                      <span>EMI Starts From</span>
                    </div>
                    <div className="price-value-mobile emi-value">₹{selectedVariant.monthlyEmi.toLocaleString()}/mo</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="step-actions-mobile">
                <button
                  className="booking-btn-back-mobile"
                  onClick={() => setCurrentStep(1)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button
                  className="booking-btn-continue-mobile"
                  onClick={handleBookingConfirm}
                >
                  Continue to Details
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {currentStep === 3 && (
            <div className="step-content customer-details-step">
              <div className="step-description">
                <p>{getStepDescription()}</p>
                <div className="hindi-message-box">
                  <span className="hindi-text">आप सिर्फ ₹5000 बुकिंग अमाउंट पे करेंगे</span>
                  <span className="english-text">You will only pay ₹5000 booking amount</span>
                </div>
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
              ? "* कार्ट में जोड़ने के बाद आप अपनी बुकिंग देख सकते हैं | By adding to cart, you can review your selection and proceed with payment later."
              : "* सुरक्षित बुकिंग - आसान पेमेंट विकल्प | Secure booking with easy payment options available at checkout."
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