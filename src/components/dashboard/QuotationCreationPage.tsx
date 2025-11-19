import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import quotationService from '../../services/quotationService';

// Define types for car variants
type CarBrand = keyof typeof carVariants;
type CarVariant = string;

// Real GAUTAM MOTORS inventory with variants
const carVariants = {
  'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
  'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
  'TOYOTA RUMION': ['S CNG 1.5 MT'],
  'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
  'Maruti Suzuki Dzire': ['Tour\'s CNG'],
  'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
};

// Car colors for each variant
const carColors = {
  'Maruti Suzuki Wagon-R': {
    'H3 CNG': ['White'],
    'LXI CNG': ['White', 'Silver', 'Grey', 'Red', 'Blue'],
    'VXI CNG': ['White', 'Silver', 'Grey', 'Red', 'Blue']
  },
  'Maruti Suzuki ERTIGA': {
    'Tour M CNG 1.5 MT': ['White'],
    'VXI CNG 1.5 MT': ['White', 'Silver', 'Grey', 'Red', 'Blue'],
    'ZXI CNG 1.5 MT': ['White', 'Silver', 'Grey', 'Red', 'Blue']
  },
  'TOYOTA RUMION': {
    'S CNG 1.5 MT': ['White', 'Silver', 'Grey']
  },
  'HYUNDAI AURA': {
    'E CNG': ['White', 'Silver', 'Grey', 'Cherry Night'],
    'S CNG': ['White', 'Silver', 'Grey', 'Cherry Night'],
    'SX CNG': ['White', 'Silver', 'Grey', 'Cherry Night']
  },
  'Maruti Suzuki Dzire': {
    'Tour\'s CNG': ['White']
  },
  'Toyota Innova Crysta': {
    'GX': ['White', 'Silver', 'Pearl White'],
    'GX+': ['White', 'Silver', 'Pearl White'],
    'VX': ['White', 'Silver', 'Pearl White'],
    'ZX': ['White', 'Silver', 'Pearl White']
  }
};

// Interface for quotation data
interface QuotationData {
  emiInterestRate: string;
  showroomCost: string;
  tcs: string;
  registration: string;
  insurance: string;
  noPlate: string;
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
  // Bank percentage fields
  sbiBank: string;
  unionBank: string;
  indusIndBank: string;
  auBank: string;
  // Additional financial fields
  downPayment: string;
  offers: string;
  finalDownPayment: string;
  emiYears: string;
  emiFor5Years: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  [key: string]: string; // Index signature for dynamic access
}

// Interface for form errors
interface FormErrors {
  [key: string]: string;
}

// Interface for quotation response from API
interface QuotationResponse {
  vendor_id: string;
  car_model: string;
  model_variant: string;
  roi_emi_interest: number;
  sbi_bank: number;
  union_bank: number;
  indusind_bank: number;
  au_bank: number;
  ex_showroom: number;
  tcs: number;
  registration: number;
  insurance: number;
  number_plate_crtm_autocard: number;
  gps: number;
  fastag: number;
  speed_governor: number;
  accessories: number;
  on_the_road: number;
  loan_amount: number;
  margin_down_payment: number;
  process_fee: number;
  stamp_duty: number;
  handling_document_charge: number;
  loan_suraksha_insurance: number;
  down_payment: number;
  offers: number;
  final_down_payment: number;
  emi_years: number;
  monthly_emi: number;
  created_at: string;
  updated_at: string;
}

const QuotationCreationPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for modals and UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedQuotationId, setSubmittedQuotationId] = useState<string | null>(null);
  const [quotationData, setQuotationData] = useState<QuotationResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [backendStatusChecked, setBackendStatusChecked] = useState<boolean>(false);
  
  // State for form data
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Form data state
  const [formData, setFormData] = useState<QuotationData>({
    emiInterestRate: '',
    showroomCost: '',
    tcs: '',
    registration: '',
    insurance: '',
    noPlate: '',
    gps: '',
    fastag: '',
    speedGovernor: '',
    accessories: '',
    loanAmount: '',
    margin: '',
    processFee: '',
    stampDuty: '',
    handlingCharge: '',
    loanInsurance: '',
    // Bank percentage fields
    sbiBank: '',
    unionBank: '',
    indusIndBank: '',
    auBank: '',
    // Additional financial fields
    downPayment: '',
    offers: '',
    finalDownPayment: '',
    emiYears: 'None',
    emiFor5Years: '',
    customerName: '',
    customerPhone: '',
    customerAddress: ''
  });

  // Load quotation data if we have a submitted ID
  useEffect(() => {
    if (submittedQuotationId) {
      fetchQuotationData(submittedQuotationId);
    }
  }, [submittedQuotationId]);

  // Fetch quotation data from the backend
  const fetchQuotationData = async (vendorId: string) => {
    try {
      const data = await quotationService.getQuotationByVendor(vendorId);
      setQuotationData(data as QuotationResponse);
    } catch (error) {
      console.error('Error fetching quotation data:', error);
    }
  };

  // Check backend server status
  const checkBackendStatus = async () => {
    try {
      const isRunning = await quotationService.checkServerStatus();
      setBackendStatus(isRunning);
      setBackendStatusChecked(true);
      return isRunning;
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus(false);
      setBackendStatusChecked(true);
      return false;
    }
  };

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Handlers for car selection
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedVariant('');
    // Reset form data when selecting a new brand
    setFormData({
      emiInterestRate: '',
      showroomCost: '',
      tcs: '',
      registration: '',
      insurance: '',
      noPlate: '',
      gps: '',
      fastag: '',
      speedGovernor: '',
      accessories: '',
      loanAmount: '',
      margin: '',
      processFee: '',
      stampDuty: '',
      handlingCharge: '',
      loanInsurance: '',
      // Bank percentage fields
      sbiBank: '',
      unionBank: '',
      indusIndBank: '',
      auBank: '',
      // Additional financial fields
      downPayment: '',
      offers: '',
      finalDownPayment: '',
      emiYears: 'None',
      emiFor5Years: '',
      customerName: '',
      customerPhone: '',
      customerAddress: ''
    });
    setErrors({});
  };

  const handleVariantSelect = (variant: string) => {
    setSelectedVariant(variant);
    // Reset form data when selecting a new variant
    setFormData({
      emiInterestRate: '',
      showroomCost: '',
      tcs: '',
      registration: '',
      insurance: '',
      noPlate: '',
      gps: '',
      fastag: '',
      speedGovernor: '',
      accessories: '',
      loanAmount: '',
      margin: '',
      processFee: '',
      stampDuty: '',
      handlingCharge: '',
      loanInsurance: '',
      // Bank percentage fields
      sbiBank: '',
      unionBank: '',
      indusIndBank: '',
      auBank: '',
      // Additional financial fields
      downPayment: '',
      offers: '',
      finalDownPayment: '',
      emiYears: 'None',
      emiFor5Years: '',
      customerName: '',
      customerPhone: '',
      customerAddress: ''
    });
    setErrors({});
  };

  // Modal handlers
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setSelectedBrand('');
      setSelectedVariant('');
    }
  };
  
  const openQuotationModal = () => {
    if (selectedBrand && selectedVariant) {
      setIsModalOpen(false);
      setIsQuotationModalOpen(true);
      setErrors({});
      setCurrentStep(1);
    }
  };

  const closeQuotationModal = () => {
    setIsQuotationModalOpen(false);
    setCurrentStep(1);
  };

  // Form input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for showroomCost to auto-calculate TCS - Only if > ₹10,00,000
    if (name === 'showroomCost') {
      const showroomCost = parseFloat(value) || 0;
      // Only calculate TCS if Ex-Showroom > ₹10,00,000
      const tcs = showroomCost > 1000000 ? (showroomCost * 0.01).toFixed(2) : '0';
      
      setFormData({
        ...formData,
        [name]: value,
        tcs: tcs
      });
    } 
    // Handle bank percentages
    else if (name === 'sbiBank' || name === 'unionBank' || name === 'indusIndBank' || name === 'auBank') {
      const bankPercentage = parseFloat(value) || 0;
      
      // Clear other bank values (only one bank can be selected)
      const updatedFormData = {
        ...formData,
        [name]: value,
        sbiBank: name === 'sbiBank' ? value : '',
        unionBank: name === 'unionBank' ? value : '',
        indusIndBank: name === 'indusIndBank' ? value : '',
        auBank: name === 'auBank' ? value : ''
      };
      
      setFormData(updatedFormData);
      
      if (bankPercentage > 0) {
        // Calculate loan amount using updated data
        setTimeout(() => {
          calculateBankLoanAmount(name, bankPercentage, updatedFormData);
        }, 10);
      } else {
        // Clear loan calculations
        setFormData(prevData => ({
          ...prevData,
          loanAmount: '',
          margin: '',
          emiFor5Years: ''
        }));
      }
    } 
    // Handle down payment and offers calculation
    else if (name === 'downPayment' || name === 'offers') {
      const downPayment = parseFloat(name === 'downPayment' ? value : formData.downPayment) || 0;
      const offers = parseFloat(name === 'offers' ? value : formData.offers) || 0;
      const finalDownPayment = (downPayment - offers).toFixed(2);
      
      setFormData({
        ...formData,
        [name]: value,
        finalDownPayment: finalDownPayment
      });
    } 
    // Handle EMI calculation when EMI years or interest rate changes
    else if (name === 'emiYears' || name === 'emiInterestRate') {
      const updatedFormData = {
        ...formData,
        [name]: value
      };
      
      setFormData(updatedFormData);
      
      // Calculate EMI if we have all required values
      setTimeout(() => calculateEMI(updatedFormData), 10);
    } 
    // Handle additional charges that affect down payment
    else if (name === 'processFee' || name === 'stampDuty' || name === 'handlingCharge' || name === 'loanInsurance') {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Recalculate down payment when these fields change
      setTimeout(() => calculateDownPayment(), 10);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Recalculate loan amount if relevant fields change and a bank is selected
      if (name === 'showroomCost' || name === 'registration' || name === 'insurance' || 
          name === 'noPlate' || name === 'gps' || name === 'fastag' || 
          name === 'speedGovernor' || name === 'accessories') {
        
        // Use the updated form data for calculations
        const updatedData = { ...formData, [name]: value };
        
        setTimeout(() => {
          recalculateLoanAmount(updatedData);
        }, 10);
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 1. Loan Amount Base = Ex-Showroom + Registration + Insurance + TCS (if Ex-Showroom > 10L)
  const exShowroom = parseFloat(formData.showroomCost) || 0;
  const registration = parseFloat(formData.registration) || 0;
  const insurance = parseFloat(formData.insurance) || 0;
  const tcs = exShowroom > 1000000 ? (exShowroom * 0.01) : 0;
  const loanAmountBase = exShowroom + registration + insurance + tcs;
  const loanAmountLive = parseFloat(formData.loanAmount) || 0;

  // 2. Displayed On-Road Price = Loan Amount Base + Number Plate + GPS + Fastag + Speed Governor + Accessories
  const gps = parseFloat(formData.gps) || 0;
  const noPlate = parseFloat(formData.noPlate) || 0;
  const fastag = parseFloat(formData.fastag) || 0;
  const speedGovernor = parseFloat(formData.speedGovernor) || 0;
  const accessories = parseFloat(formData.accessories) || 0;
  const onRoadPriceDisplay = loanAmountBase + noPlate + gps + fastag + speedGovernor + accessories;

  // 3. Margin = Displayed On-Road Price - Loan Amount
  const marginLive = (onRoadPriceDisplay - loanAmountLive).toFixed(2);

  // Calculate on-road price - Exclude Number Plate/CRTm/AutoCard charges
  const calculateOnRoadPrice = (): string => {
    return onRoadPriceDisplay.toLocaleString('en-IN');
  };

  // Calculate down payment
  const calculateDownPayment = () => {
    // Calculate all values, defaulting to 0 if blank
    const exShowroom = parseFloat(formData.showroomCost) || 0;
    const registration = parseFloat(formData.registration) || 0;
    const insurance = parseFloat(formData.insurance) || 0;
    const tcs = exShowroom > 1000000 ? (exShowroom * 0.01) : 0;
    const loanAmountBase = exShowroom + registration + insurance + tcs;
    const noPlate = parseFloat(formData.noPlate) || 0;
    const gps = parseFloat(formData.gps) || 0;
    const fastag = parseFloat(formData.fastag) || 0;
    const speedGovernor = parseFloat(formData.speedGovernor) || 0;
    const accessories = parseFloat(formData.accessories) || 0;
    const onRoadPriceDisplay = loanAmountBase + noPlate + gps + fastag + speedGovernor + accessories;
    const loanAmountLive = parseFloat(formData.loanAmount) || 0;
    const margin = onRoadPriceDisplay - loanAmountLive;
    const processFee = parseFloat(formData.processFee) || 0;
    const stampDuty = parseFloat(formData.stampDuty) || 0;
    const handlingCharge = parseFloat(formData.handlingCharge) || 0;
    const loanInsurance = parseFloat(formData.loanInsurance) || 0;
    // Total Down Payment calculation as specified
    const downPayment = (margin + processFee + stampDuty + handlingCharge + loanInsurance).toFixed(2);
    setFormData(prevData => ({
      ...prevData,
      downPayment: downPayment,
      finalDownPayment: (parseFloat(downPayment) - (parseFloat(prevData.offers) || 0)).toFixed(2)
    }));
  };

  // Calculate EMI based on loan amount, interest rate, and tenure
  const calculateEMI = (data = formData) => {
    const loanAmount = parseFloat(data.loanAmount) || 0;
    const emiYears = data.emiYears === 'None' ? 0 : parseInt(data.emiYears) || 0;
    const annualInterestRate = parseFloat(data.emiInterestRate) || 0;
    
    if (loanAmount > 0 && emiYears > 0 && annualInterestRate > 0) {
      const monthlyInterestRate = annualInterestRate / (12 * 100); // Convert to monthly decimal
      const numberOfMonths = emiYears * 12;
      
      // EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
      const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths)) / 
                  (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
      
      setFormData(prevData => ({
        ...prevData,
        emiFor5Years: emi.toFixed(2)
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        emiFor5Years: ''
      }));
    }
  };

  // Calculate bank loan amount based on bank-specific logic
  const calculateBankLoanAmount = (bankName: string, bankPercentage: number, data: QuotationData) => {
    const exShowroom = parseFloat(data.showroomCost) || 0;
    const registration = parseFloat(data.registration) || 0;
    const insurance = parseFloat(data.insurance) || 0;
    const tcs = exShowroom > 1000000 ? (exShowroom * 0.01) : 0;
    const loanAmountBase = exShowroom + registration + insurance + tcs;
    const loanAmount = (loanAmountBase * bankPercentage / 100);
    setFormData(prevData => ({
      ...prevData,
      loanAmount: loanAmount.toFixed(2)
    }));
    setTimeout(() => {
      calculateDownPayment();
      calculateEMI({ ...data, loanAmount: loanAmount.toFixed(2) });
    }, 10);
  };

  // Recalculate loan amount when relevant fields change
  const recalculateLoanAmount = (data: QuotationData) => {
    const selectedBank = data.sbiBank ? 'sbiBank' :
                        data.unionBank ? 'unionBank' :
                        data.indusIndBank ? 'indusIndBank' :
                        data.auBank ? 'auBank' : null;
    
    if (selectedBank) {
      const bankPercentage = parseFloat(data[selectedBank]) || 0;
      if (bankPercentage > 0) {
        calculateBankLoanAmount(selectedBank, bankPercentage, data);
      }
    }
  };

  // Handle form submission
  const handleQuotationSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      if (!backendStatusChecked) {
        const serverRunning = await checkBackendStatus();
        if (!serverRunning) {
          setErrors({ submit: "Cannot connect to the backend server. Please make sure the server is running." });
          setIsSubmitting(false);
          return;
        }
      }

      const quotationData = {
        vendor_id: `V-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        car_model: selectedBrand,
        model_variant: selectedVariant,
        roi_emi_interest: parseFloat(formData.emiInterestRate) || 0,
        sbi_bank: parseFloat(formData.sbiBank) || 0,
        union_bank: parseFloat(formData.unionBank) || 0,
        indusind_bank: parseFloat(formData.indusIndBank) || 0,
        au_bank: parseFloat(formData.auBank) || 0,
        ex_showroom: parseFloat(formData.showroomCost) || 0,
        tcs: parseFloat(formData.tcs) || 0,
        registration: parseFloat(formData.registration) || 0,
        insurance: parseFloat(formData.insurance) || 0,
        number_plate_crtm_autocard: parseFloat(formData.noPlate) || 0,
        gps: parseFloat(formData.gps) || 0,
        fastag: parseFloat(formData.fastag) || 0,
        speed_governor: parseFloat(formData.speedGovernor) || 0,
        accessories: parseFloat(formData.accessories) || 0,
        on_the_road: onRoadPriceDisplay,
        loan_amount: parseFloat(formData.loanAmount) || 0,
        margin_down_payment: onRoadPriceDisplay - (parseFloat(formData.loanAmount) || 0),
        process_fee: parseFloat(formData.processFee) || 0,
        stamp_duty: parseFloat(formData.stampDuty) || 0,
        handling_document_charge: parseFloat(formData.handlingCharge) || 0,
        loan_suraksha_insurance: parseFloat(formData.loanInsurance) || 0,
        down_payment: parseFloat(formData.downPayment) || 0,
        offers: parseFloat(formData.offers) || 0,
        final_down_payment: parseFloat(formData.finalDownPayment) || 0,
        emi_years: formData.emiYears === 'None' ? 0 : parseInt(formData.emiYears) || 0,
        monthly_emi: parseFloat(formData.emiFor5Years) || 0,
      };
      
      const response = await quotationService.createQuotation(quotationData) as QuotationResponse;
      
      setQuotationData(response);
      setSubmitSuccess(true);
      setSubmittedQuotationId(response.vendor_id);
      setIsSubmitting(false);
      
      setTimeout(() => {
        setIsQuotationModalOpen(false);
        navigate('/dashboard/quotations', { 
          state: { 
            success: true, 
            message: `Quotation ${response.vendor_id} generated successfully`,
            quotationData: response
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting quotation:', error);
      setIsSubmitting(false);
      
      let errorMessage = "Failed to submit quotation. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Validation failed')) {
          errorMessage = error.message.replace('Validation failed: ', '');
        } else if (error.message.includes('Network error')) {
          errorMessage = "Cannot connect to server. Please check your connection.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Step 1: Vehicle & Financing Information</h3>
              <div className="step-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '33%' }}></div>
                </div>
                <span>1 of 3</span>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-section">
                <h4>Vehicle Information</h4>
                <div className="form-row highlight-row">
                  <label>Selected Vehicle:</label>
                  <div className="form-value">{`${selectedBrand} ${selectedVariant}`}</div>
                </div>
                <div className="form-row">
                  <label>ROI / EMI Interest (%):</label>
                  <input 
                    type="number" 
                    name="emiInterestRate"
                    value={formData.emiInterestRate}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter interest rate"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Bank Interest Rates (%) - Select One</h4>
                <div className="bank-info-text">
                  <small>Each bank has different loan calculation methods. Select one bank and enter the loan percentage.</small>
                </div>
                <div className="bank-grid">
                  <div className="bank-field sbi">
                    <label>SBI Bank:</label>
                    <input 
                      type="number" 
                      name="sbiBank"
                      value={formData.sbiBank}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Rate"
                      step="0.01"
                    />
                    <small className="bank-help">Loan on: Ex-Showroom + TCS + Insurance + Registration</small>
                  </div>
                  <div className="bank-field union">
                    <label>Union Bank:</label>
                    <input 
                      type="number" 
                      name="unionBank"
                      value={formData.unionBank}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Rate"
                      step="0.01"
                    />
                    <small className="bank-help">Loan on: Full On Road Price (all components)</small>
                  </div>
                  <div className="bank-field indusind">
                    <label>IndusInd Bank:</label>
                    <input 
                      type="number" 
                      name="indusIndBank"
                      value={formData.indusIndBank}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Rate"
                      step="0.01"
                    />
                    <small className="bank-help">Loan on: Ex-Showroom price only</small>
                  </div>
                  <div className="bank-field au">
                    <label>AU Bank:</label>
                    <input 
                      type="number" 
                      name="auBank"
                      value={formData.auBank}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Rate"
                      step="0.01"
                    />
                    <small className="bank-help">Loan on: Ex-Showroom price only</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Step 2: Cost Breakdown</h3>
              <div className="step-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '66%' }}></div>
                </div>
                <span>2 of 3</span>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-section">
                <h4>Base Vehicle Costs</h4>
                <div className="cost-row">
                  <label>Ex-Showroom Price: <span className="required">*</span></label>
                  <input 
                    type="number" 
                    name="showroomCost"
                    value={formData.showroomCost}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter ex-showroom price"
                    required
                  />
                </div>
                {/* Only show TCS if Ex-Showroom > ₹10,00,000 */}
                {(parseFloat(formData.showroomCost) || 0) > 1000000 && (
                  <div className="cost-row">
                    <label>TCS (1%):</label>
                    <input 
                      type="number" 
                      name="tcs"
                      value={formData.tcs}
                      onChange={handleInputChange}
                      className="form-control readonly"
                      readOnly
                    />
                    <small className="field-note">Automatically calculated at 1% of Ex-Showroom price</small>
                  </div>
                )}
                <div className="cost-row">
                  <label>Registration: <span className="required">*</span></label>
                  <input 
                    type="number" 
                    name="registration"
                    value={formData.registration}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Registration fee"
                    required
                  />
                </div>
                <div className="cost-row">
                  <label>Insurance: <span className="required">*</span></label>
                  <input 
                    type="number" 
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Insurance amount"
                    required
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h4>Additional Components</h4>
                <div className="cost-row">
                  <label>Number Plate + CRTM + Autocard:</label>
                  <input 
                    type="number" 
                    name="noPlate"
                    value={formData.noPlate}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Amount"
                  />
                </div>
                <div className="cost-row">
                  <label>GPS:</label>
                  <input 
                    type="number" 
                    name="gps"
                    value={formData.gps}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="GPS cost"
                  />
                </div>
                <div className="cost-row">
                  <label>Fastag:</label>
                  <input 
                    type="number" 
                    name="fastag"
                    value={formData.fastag}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Fastag cost"
                  />
                </div>
                <div className="cost-row">
                  <label>Speed Governor:</label>
                  <input 
                    type="number" 
                    name="speedGovernor"
                    value={formData.speedGovernor}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Speed governor cost"
                  />
                </div>
                <div className="cost-row">
                  <label>Accessories:</label>
                  <input 
                    type="number" 
                    name="accessories"
                    value={formData.accessories}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Accessories cost"
                  />
                </div>
              </div>
            </div>
            
            <div className="total-section">
              <div className="total-row highlight-row">
                <label>On the Road Price:</label>
                <div className="total-value">₹{onRoadPriceDisplay.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Step 3: Loan & Payment Details</h3>
              <div className="step-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
                <span>3 of 3</span>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-section">
                <h4>Loan Information</h4>
                <div className="cost-row">
                  <label>Loan Amount:</label>
                  <input 
                    type="number" 
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    className="form-control readonly"
                    readOnly
                  />
                  <small className="help-text">Calculated based on bank rate</small>
                </div>
                <div className="cost-row">
                  <label>Margin (Down Payment):</label>
                  <input 
                    type="number" 
                    name="margin"
                    value={marginLive}
                    className="form-control readonly"
                    readOnly
                  />
                </div>
                <div className="cost-row">
                  <label>Process Fee:</label>
                  <input 
                    type="number" 
                    name="processFee"
                    value={formData.processFee}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Process fee"
                  />
                </div>
                <div className="cost-row">
                  <label>Stamp Duty:</label>
                  <input 
                    type="number" 
                    name="stampDuty"
                    value={formData.stampDuty}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Stamp duty"
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h4>Payment Details</h4>
                <div className="cost-row">
                  <label>Handling & Document Charge:</label>
                  <input 
                    type="number" 
                    name="handlingCharge"
                    value={formData.handlingCharge}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Handling charge"
                  />
                </div>
                <div className="cost-row">
                  <label>Loan Insurance:</label>
                  <input 
                    type="number" 
                    name="loanInsurance"
                    value={formData.loanInsurance}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Loan insurance"
                  />
                </div>
                <div className="cost-row">
                  <label>Total Down Payment:</label>
                  <input 
                    type="number" 
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    className="form-control readonly"
                    readOnly
                  />
                </div>
                <div className="cost-row">
                  <label>Offers/Discounts:</label>
                  <input 
                    type="number" 
                    name="offers"
                    value={formData.offers}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Discount/offers"
                  />
                </div>
                <div className="cost-row highlight-row">
                  <label>Final Down Payment:</label>
                  <input 
                    type="number" 
                    name="finalDownPayment"
                    value={formData.finalDownPayment}
                    onChange={handleInputChange}
                    className="form-control readonly"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="emi-section">
              <h4>EMI Details</h4>
              <div className="form-grid">
                <div className="cost-row">
                  <label>EMI Period:</label>
                  <select
                    name="emiYears"
                    value={formData.emiYears}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="None">None</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                      <option key={year} value={year}>
                        {year} {year === 1 ? 'Year' : 'Years'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cost-row">
                  <label>Monthly EMI:</label>
                  <input 
                    type="number" 
                    name="emiFor5Years"
                    value={formData.emiFor5Years}
                    onChange={handleInputChange}
                    className="form-control readonly"
                    readOnly
                    placeholder={
                      formData.emiYears === 'None' 
                        ? 'Select EMI period first' 
                        : !formData.emiInterestRate 
                          ? 'Enter ROI/EMI Interest rate'
                          : !formData.loanAmount
                            ? 'Select bank and enter percentage'
                            : 'EMI will be calculated automatically'
                    }
                  />
                  {formData.emiYears !== 'None' && formData.emiFor5Years && (
                    <small className="help-text">
                      ₹{parseFloat(formData.emiFor5Years).toLocaleString('en-IN')}/month for {formData.emiYears} {parseInt(formData.emiYears) === 1 ? 'Year' : 'Years'}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container quotation-page-container">
      <div className="dashboard-welcome quotation-welcome-compact">
        <h1>Create Quotation</h1>
        <p>Generate new vehicle quotations for customers</p>
      </div>
      
      <div className="quotation-creator-wrapper-wide">
        <div className="quotation-card-wide">
          <h3>New Quotation</h3>
          <p>Generate a comprehensive quotation for a vehicle sale</p>
          <button 
            className="quotation-btn" 
            onClick={toggleModal}
          >
            Create Quotation
          </button>
        </div>
        
        <div className="quotation-help-card-wide">
          <h3>About Quotations</h3>
          <ul className="quotation-help-list">
            <li>Fill in all required vehicle details</li>
            <li>Select appropriate bank financing options</li>
            <li>Calculate EMI and down payment automatically</li>
            <li>Review and generate professional quotation</li>
          </ul>
        </div>
      </div>

      {/* Car Selection Modal */}
      {isModalOpen && (
        <div className="quotation-modal-overlay">
          <div className="quotation-modal">
            <div className="quotation-modal-header">
              <h2>Create New Quotation</h2>
              <button className="close-modal-btn" onClick={toggleModal}>×</button>
            </div>
            
            <div className="quotation-modal-body">
              <div className="form-section">
                <label>Select Car Brand</label>
                <div className="custom-dropdown">
                  <select 
                    value={selectedBrand} 
                    onChange={(e) => handleBrandSelect(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Select Brand --</option>
                    {Object.keys(carVariants).map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBrand && (
                <div className="form-section">
                  <label>Select Model Variant</label>
                  <div className="variant-grid-selection">
                    {carVariants[selectedBrand as CarBrand]?.map(variant => (
                      <div 
                        key={variant} 
                        className={`variant-card ${selectedVariant === variant ? 'selected' : ''}`}
                        onClick={() => handleVariantSelect(variant)}
                      >
                        <div className="variant-name">{variant}</div>
                        <div className="variant-colors">
                          {(() => {
                            const brandColors = carColors[selectedBrand as keyof typeof carColors];
                            if (!brandColors) return 0;
                            const variantColors = brandColors[variant as keyof typeof brandColors] as string[] | undefined;
                            return (variantColors?.length || 0);
                          })()} colors available
                        </div>
                        {selectedVariant === variant && <div className="variant-check">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="quotation-modal-footer">
              <button className="cancel-btn" onClick={toggleModal}>Cancel</button>
              <button 
                className="submit-btn" 
                onClick={openQuotationModal}
                disabled={!selectedBrand || !selectedVariant}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quotation Details Modal */}
      {isQuotationModalOpen && (
        <div className="quotation-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeQuotationModal()}>
          <div className="quotation-modal quotation-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quotation-modal-header">
              <h2>Quotation Details - {selectedBrand} {selectedVariant}</h2>
              <button className="close-modal-btn" onClick={closeQuotationModal}>×</button>
            </div>
            
            {/* Error Display */}
            {errors.submit && (
              <div className="error-banner">
                <div className="error-icon">⚠️</div>
                <div className="error-text">
                  <strong>Error:</strong> {errors.submit}
                </div>
                <button 
                  className="error-close-btn"
                  onClick={() => setErrors({ ...errors, submit: '' })}
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="quotation-modal-body">
              {renderStepContent()}
            </div>
            
            <div className="quotation-modal-footer">
              <div className="footer-left">
                {currentStep > 1 && (
                  <button 
                    className="prev-btn"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    ← Previous
                  </button>
                )}
              </div>
              
              <div className="footer-right">
                <button className="cancel-btn" onClick={closeQuotationModal}>
                  Cancel
                </button>
                
                {currentStep < 3 ? (
                  <button 
                    className="next-btn"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    className={`submit-btn ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
                    onClick={handleQuotationSubmit}
                    disabled={isSubmitting || submitSuccess}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-icon"></span>
                        Processing...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <span className="success-icon">✓</span>
                        Quotation Generated!
                      </>
                    ) : (
                      'Generate Quotation'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {submitSuccess && quotationData && (
        <div className="quotation-success-overlay">
          <div className="quotation-success-modal">
            <div className="quotation-modal-header">
              <h2>Quotation Generated Successfully</h2>
              <button 
                className="close-modal-btn"
                onClick={() => navigate('/dashboard/quotations')}
              >×</button>
            </div>
            
            <div className="quotation-modal-body">
              <div className="quotation-success-message">
                <div className="success-icon-large">✓</div>
                <h3>Quotation #{quotationData.vendor_id}</h3>
                <p className="quotation-date">Created on: {new Date(quotationData.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              
              <div className="quotation-details-summary">
                <div className="quotation-detail-item">
                  <span>Car Model:</span>
                  <strong>{quotationData.car_model} {quotationData.model_variant}</strong>
                </div>
                <div className="quotation-detail-item">
                  <span>On Road Price:</span>
                  <strong>₹{quotationData.on_the_road.toLocaleString('en-IN')}</strong>
                </div>
                <div className="quotation-detail-item">
                  <span>Down Payment:</span>
                  <strong>₹{quotationData.final_down_payment.toLocaleString('en-IN')}</strong>
                </div>
                {quotationData.monthly_emi > 0 && (
                  <div className="quotation-detail-item">
                    <span>Monthly EMI:</span>
                    <strong>₹{quotationData.monthly_emi.toLocaleString('en-IN')}/month</strong>
                    {quotationData.emi_years > 0 && <small>for {quotationData.emi_years} years</small>}
                  </div>
                )}
              </div>
              
              <div className="quotation-actions">
                <button 
                  className="view-quotation-btn"
                  onClick={() => navigate(`/dashboard/quotations/${quotationData.vendor_id}`)}
                >
                  View Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationCreationPage;