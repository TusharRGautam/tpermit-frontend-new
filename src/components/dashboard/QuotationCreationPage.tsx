import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';
import './QuotationWizard.css';
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
  mahindraFinance: string;
  cholamandalamBank: string;
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
  mahindra_finance: number;
  cholamandalam_bank: number;
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
    mahindraFinance: '',
    cholamandalamBank: '',
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
      mahindraFinance: '',
      cholamandalamBank: '',
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
      mahindraFinance: '',
      cholamandalamBank: '',
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
    else if (name === 'sbiBank' || name === 'unionBank' || name === 'mahindraFinance' || name === 'cholamandalamBank' || name === 'auBank') {
      const bankPercentage = parseFloat(value) || 0;

      // Clear other bank values (only one bank can be selected)
      const updatedFormData = {
        ...formData,
        [name]: value,
        sbiBank: name === 'sbiBank' ? value : '',
        unionBank: name === 'unionBank' ? value : '',
        mahindraFinance: name === 'mahindraFinance' ? value : '',
        cholamandalamBank: name === 'cholamandalamBank' ? value : '',
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
      const updatedData = { ...formData, [name]: value };
      setFormData(updatedData);

      // For Loan Suraksha: Recalculate loan amount for special banks, then down payment
      if (name === 'loanInsurance') {
        setTimeout(() => {
          recalculateLoanAmount(updatedData);
        }, 10);
      } else {
        // For other fields: Just recalculate down payment
        setTimeout(() => calculateDownPayment(), 10);
      }
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

  // 3. Margin calculation - Special logic for AU Bank, Mahindra Finance, Cholamandalam Bank
  const isSpecialBank = (formData.auBank && parseFloat(formData.auBank) > 0) ||
                        (formData.mahindraFinance && parseFloat(formData.mahindraFinance) > 0) ||
                        (formData.cholamandalamBank && parseFloat(formData.cholamandalamBank) > 0);
  const marginLive = isSpecialBank
    ? (exShowroom - loanAmountLive).toFixed(2)  // AU/Mahindra/Cholamandalam: Ex-Showroom - Loan Amount
    : (onRoadPriceDisplay - loanAmountLive).toFixed(2);  // Other banks: On-Road Price - Loan Amount

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
    const processFee = parseFloat(formData.processFee) || 0;
    const stampDuty = parseFloat(formData.stampDuty) || 0;
    const handlingCharge = parseFloat(formData.handlingCharge) || 0;
    const loanInsurance = parseFloat(formData.loanInsurance) || 0;

    // AU Bank, Mahindra Finance, Cholamandalam Bank specific calculation
    const isSpecialBank = (formData.auBank && parseFloat(formData.auBank) > 0) ||
                          (formData.mahindraFinance && parseFloat(formData.mahindraFinance) > 0) ||
                          (formData.cholamandalamBank && parseFloat(formData.cholamandalamBank) > 0);

    let margin = 0;
    let downPayment = 0;

    if (isSpecialBank) {
      // AU Bank/Mahindra Finance/Cholamandalam Bank: Margin = Ex-Showroom - (Loan Amount - Loan Suraksha)
      margin = exShowroom - (loanAmountLive - loanInsurance);
      // Special Banks: Total Down Payment = Margin + TCS + Processing Fee + Stamp Duty + GPS + Fastag + Speed Governor + Accessories + Number Plate + Insurance + Registration
      downPayment = margin + tcs + processFee + stampDuty + gps + fastag + speedGovernor + accessories + noPlate + insurance + registration;
    } else {
      // Other banks: Margin = On-Road Price - Loan Amount
      margin = onRoadPriceDisplay - loanAmountLive;
      // Other banks: Total Down Payment = Margin + Process Fee + Stamp Duty + Handling Charge + Loan Insurance
      downPayment = margin + processFee + stampDuty + handlingCharge + loanInsurance;
    }

    setFormData(prevData => ({
      ...prevData,
      margin: margin.toFixed(2),
      downPayment: downPayment.toFixed(2),
      finalDownPayment: (downPayment - (parseFloat(prevData.offers) || 0)).toFixed(2)
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
    const noPlate = parseFloat(data.noPlate) || 0;
    const gps = parseFloat(data.gps) || 0;
    const fastag = parseFloat(data.fastag) || 0;
    const speedGovernor = parseFloat(data.speedGovernor) || 0;
    const accessories = parseFloat(data.accessories) || 0;
    const loanInsurance = parseFloat(data.loanInsurance) || 0;

    let loanAmountBase = 0;

    // Bank-specific loan calculation logic
    switch(bankName) {
      case 'sbiBank':
        // SBI: Ex-Showroom + TCS + Insurance + Registration
        loanAmountBase = exShowroom + tcs + insurance + registration;
        break;

      case 'unionBank':
        // Union Bank: Full On Road Price (all components)
        loanAmountBase = exShowroom + tcs + registration + insurance + noPlate + gps + fastag + speedGovernor + accessories;
        break;

      case 'mahindraFinance':
      case 'cholamandalamBank':
      case 'auBank':
        // Mahindra Finance, Cholamandalam Bank & AU Bank: Ex-Showroom only
        loanAmountBase = exShowroom;
        break;

      default:
        loanAmountBase = exShowroom + registration + insurance + tcs;
    }

    let loanAmount = (loanAmountBase * bankPercentage / 100);

    // For AU Bank, Mahindra Finance, Cholamandalam Bank: Add Loan Suraksha to final loan amount
    if (bankName === 'auBank' || bankName === 'mahindraFinance' || bankName === 'cholamandalamBank') {
      loanAmount = loanAmount + loanInsurance;
    }

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
                        data.mahindraFinance ? 'mahindraFinance' :
                        data.cholamandalamBank ? 'cholamandalamBank' :
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
        mahindra_finance: parseFloat(formData.mahindraFinance) || 0,
        cholamandalam_bank: parseFloat(formData.cholamandalamBank) || 0,
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
          <div className="qw-step-pane">
            <div className="qw-form-grid">
              <div className="qw-form-card">
                <div className="qw-card-header">
                  <h4>Vehicle & Financing</h4>
                </div>
                <div className="qw-selected-car-badge">
                  <span className="qw-car-label">Selected Commercial Model</span>
                  <div className="qw-car-name">{selectedBrand} • {selectedVariant}</div>
                </div>
                <div className="qw-input-group">
                  <label>Annual ROI / EMI Interest Rate (%):</label>
                  <div className="qw-input-wrapper">
                    <input 
                      type="number" 
                      name="emiInterestRate"
                      value={formData.emiInterestRate}
                      onChange={handleInputChange}
                      className="qw-input"
                      placeholder="e.g. 9.5"
                      step="0.01"
                    />
                    <span className="qw-suffix">%</span>
                  </div>
                  <span className="qw-input-hint">Used for tenure-based monthly EMI calculation</span>
                </div>
              </div>

              <div className="qw-form-card">
                <div className="qw-card-header">
                  <h4>Bank Financing Scheme (Select One)</h4>
                </div>
                <div className="qw-bank-notice">
                  Enter loan percentage in any one bank. Calculation applies according to bank scheme.
                </div>
                <div className="qw-bank-grid">
                  <div className={`qw-bank-box ${formData.sbiBank ? 'selected' : ''}`}>
                    <div className="qw-bank-box-top">
                      <span className="qw-bank-tag">SBI Bank</span>
                      <div className="qw-bank-input-wrap">
                        <input 
                          type="number" 
                          name="sbiBank"
                          value={formData.sbiBank}
                          onChange={handleInputChange}
                          className="qw-bank-input"
                          placeholder="Rate"
                          step="0.01"
                        />
                        <span className="qw-pct">%</span>
                      </div>
                    </div>
                    <span className="qw-bank-desc">Ex-Showroom + TCS + Ins + Reg</span>
                  </div>

                  <div className={`qw-bank-box ${formData.unionBank ? 'selected' : ''}`}>
                    <div className="qw-bank-box-top">
                      <span className="qw-bank-tag">Union Bank</span>
                      <div className="qw-bank-input-wrap">
                        <input 
                          type="number" 
                          name="unionBank"
                          value={formData.unionBank}
                          onChange={handleInputChange}
                          className="qw-bank-input"
                          placeholder="Rate"
                          step="0.01"
                        />
                        <span className="qw-pct">%</span>
                      </div>
                    </div>
                    <span className="qw-bank-desc">Full On Road Price (all components)</span>
                  </div>

                  <div className={`qw-bank-box ${formData.mahindraFinance ? 'selected' : ''}`}>
                    <div className="qw-bank-box-top">
                      <span className="qw-bank-tag">Mahindra Fin</span>
                      <div className="qw-bank-input-wrap">
                        <input 
                          type="number" 
                          name="mahindraFinance"
                          value={formData.mahindraFinance}
                          onChange={handleInputChange}
                          className="qw-bank-input"
                          placeholder="Rate"
                          step="0.01"
                        />
                        <span className="qw-pct">%</span>
                      </div>
                    </div>
                    <span className="qw-bank-desc">Ex-Showroom price only</span>
                  </div>

                  <div className={`qw-bank-box ${formData.cholamandalamBank ? 'selected' : ''}`}>
                    <div className="qw-bank-box-top">
                      <span className="qw-bank-tag">Cholamandalam</span>
                      <div className="qw-bank-input-wrap">
                        <input 
                          type="number" 
                          name="cholamandalamBank"
                          value={formData.cholamandalamBank}
                          onChange={handleInputChange}
                          className="qw-bank-input"
                          placeholder="Rate"
                          step="0.01"
                        />
                        <span className="qw-pct">%</span>
                      </div>
                    </div>
                    <span className="qw-bank-desc">Ex-Showroom price only</span>
                  </div>

                  <div className={`qw-bank-box ${formData.auBank ? 'selected' : ''}`}>
                    <div className="qw-bank-box-top">
                      <span className="qw-bank-tag">AU Bank</span>
                      <div className="qw-bank-input-wrap">
                        <input 
                          type="number" 
                          name="auBank"
                          value={formData.auBank}
                          onChange={handleInputChange}
                          className="qw-bank-input"
                          placeholder="Rate"
                          step="0.01"
                        />
                        <span className="qw-pct">%</span>
                      </div>
                    </div>
                    <span className="qw-bank-desc">Ex-Showroom price only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="qw-step-pane">
            <div className="qw-form-grid">
              <div className="qw-form-card">
                <div className="qw-card-header">
                  <h4>Base Vehicle Costs</h4>
                </div>
                <div className="qw-input-group">
                  <label>Ex-Showroom Price: <span className="req">*</span></label>
                  <input 
                    type="number" 
                    name="showroomCost"
                    value={formData.showroomCost}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Enter price in ₹"
                    required
                  />
                </div>
                {(parseFloat(formData.showroomCost) || 0) > 1000000 && (
                  <div className="qw-input-group">
                    <label>TCS (1% auto-calculated):</label>
                    <input 
                      type="number" 
                      name="tcs"
                      value={formData.tcs}
                      onChange={handleInputChange}
                      className="qw-input readonly"
                      readOnly
                    />
                    <span className="qw-input-hint">Mandatory 1% for Ex-Showroom &gt; ₹10,00,000</span>
                  </div>
                )}
                <div className="qw-input-group">
                  <label>Registration Charges: <span className="req">*</span></label>
                  <input 
                    type="number" 
                    name="registration"
                    value={formData.registration}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Enter RTO registration in ₹"
                    required
                  />
                </div>
                <div className="qw-input-group">
                  <label>Insurance: <span className="req">*</span></label>
                  <input 
                    type="number" 
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Insurance premium in ₹"
                    required
                  />
                </div>
              </div>

              <div className="qw-form-card">
                <div className="qw-card-header">
                  <h4>Additional Components</h4>
                </div>
                <div className="qw-input-group">
                  <label>Number Plate + CRTM + Autocard:</label>
                  <input 
                    type="number" 
                    name="noPlate"
                    value={formData.noPlate}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Amount in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Commercial GPS:</label>
                  <input 
                    type="number" 
                    name="gps"
                    value={formData.gps}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="GPS device cost in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Fastag:</label>
                  <input 
                    type="number" 
                    name="fastag"
                    value={formData.fastag}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Fastag charge in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Speed Governor:</label>
                  <input 
                    type="number" 
                    name="speedGovernor"
                    value={formData.speedGovernor}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Speed governor cost in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Accessories:</label>
                  <input 
                    type="number" 
                    name="accessories"
                    value={formData.accessories}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Accessories cost in ₹"
                  />
                </div>
              </div>
            </div>

            <div className="qw-onroad-summary">
              <div className="qw-summary-left">
                <span className="qw-summary-label">Estimated Total Commercial Cost</span>
                <span className="qw-summary-title">On The Road Price</span>
              </div>
              <div className="qw-summary-amount">₹{onRoadPriceDisplay.toLocaleString('en-IN')}</div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="qw-step-pane">
            <div className="qw-form-grid">
              <div className="qw-form-card">
                <div className="qw-card-header">
                  <h4>Loan Information</h4>
                </div>
                <div className="qw-input-group">
                  <label>Calculated Loan Amount:</label>
                  <input 
                    type="number" 
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    className="qw-input readonly"
                    readOnly
                  />
                  <span className="qw-input-hint">Derived from selected bank percentage scheme</span>
                </div>
                <div className="qw-input-group">
                  <label>Margin (Base Down Payment):</label>
                  <input 
                    type="number" 
                    name="margin"
                    value={marginLive}
                    className="qw-input readonly"
                    readOnly
                  />
                </div>
                <div className="qw-input-group">
                  <label>Process Fee:</label>
                  <input 
                    type="number" 
                    name="processFee"
                    value={formData.processFee}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Processing fee in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Stamp Duty:</label>
                  <input 
                    type="number" 
                    name="stampDuty"
                    value={formData.stampDuty}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Stamp duty in ₹"
                  />
                </div>
              </div>

              <div className="qw-form-card">
                <div className="qw-card-header">
                  <h4>Payment & Down Payment</h4>
                </div>
                <div className="qw-input-group">
                  <label>Handling & Document Charge:</label>
                  <input 
                    type="number" 
                    name="handlingCharge"
                    value={formData.handlingCharge}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Handling charges in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Loan Suraksha / Insurance:</label>
                  <input 
                    type="number" 
                    name="loanInsurance"
                    value={formData.loanInsurance}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Loan suraksha in ₹"
                  />
                </div>
                <div className="qw-input-group">
                  <label>Total Down Payment:</label>
                  <input 
                    type="number" 
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    className="qw-input readonly"
                    readOnly
                  />
                </div>
                <div className="qw-input-group">
                  <label>Dealer Offers / Discounts:</label>
                  <input 
                    type="number" 
                    name="offers"
                    value={formData.offers}
                    onChange={handleInputChange}
                    className="qw-input"
                    placeholder="Discounts in ₹"
                  />
                </div>
                <div className="qw-highlight-cost-card">
                  <label>Final Down Payment Payable:</label>
                  <input 
                    type="number" 
                    name="finalDownPayment"
                    value={formData.finalDownPayment}
                    onChange={handleInputChange}
                    className="qw-input readonly"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="qw-emi-card">
              <div className="qw-emi-header">
                <h4>Tenure & Monthly EMI Matrix</h4>
              </div>
              <div className="qw-emi-grid">
                <div className="qw-input-group">
                  <label>Loan Tenure Period:</label>
                  <select
                    name="emiYears"
                    value={formData.emiYears}
                    onChange={handleInputChange}
                    className="qw-select"
                  >
                    <option value="None">None (Outright / Cash)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                      <option key={year} value={year}>
                        {year} {year === 1 ? 'Year' : 'Years'} ({year * 12} Months)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="qw-emi-result-box">
                  <span className="qw-emi-res-label">Monthly EMI Payable</span>
                  <div className="qw-emi-res-val">
                    {formData.emiFor5Years ? `₹${parseFloat(formData.emiFor5Years).toLocaleString('en-IN')}` : '—'}
                    {formData.emiFor5Years && <span className="qw-emi-res-mo"> / month</span>}
                  </div>
                  <span className="qw-emi-res-sub">
                    {formData.emiYears === 'None'
                      ? 'Select tenure to calculate monthly installments'
                      : !formData.emiInterestRate
                        ? 'Requires ROI % in Step 1'
                        : !formData.loanAmount
                          ? 'Requires Bank % in Step 1'
                          : `${formData.emiYears} Years tenure @ ${formData.emiInterestRate}% ROI p.a.`}
                  </span>
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
      {/* Header */}
      <div className="qw-page-header">
        <div className="qw-header-left">
          <div className="qw-breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link to="/dashboard/quotations">Quotations</Link>
            <span>/</span>
            <span>Create</span>
          </div>
          <h1>Vehicle Quotation Generator</h1>
          <p>Configure commercial vehicle pricing, calculate taxes & financing schemes</p>
        </div>
        <div className="qw-header-actions">
          <button 
            className="qw-btn-header-secondary"
            onClick={() => navigate('/dashboard/quotations')}
          >
            All Quotations
          </button>
          <button 
            className="qw-btn-header-primary"
            onClick={toggleModal}
          >
            + Create Quotation
          </button>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="qw-stats-strip">
        <div className="qw-stat-pill">
          <div className="qw-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="qw-stat-info">
            <span className="qw-stat-val">6 Vehicle Models</span>
            <span className="qw-stat-lbl">Commercial fleet ready</span>
          </div>
        </div>

        <div className="qw-stat-pill green">
          <div className="qw-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-4"></path>
            </svg>
          </div>
          <div className="qw-stat-info">
            <span className="qw-stat-val">5 Integrated Banks</span>
            <span className="qw-stat-lbl">SBI, Union, MFin, Chola, AU</span>
          </div>
        </div>

        <div className="qw-stat-pill purple">
          <div className="qw-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="qw-stat-info">
            <span className="qw-stat-val">Automated EMI Matrix</span>
            <span className="qw-stat-lbl">1 to 10 years tenure</span>
          </div>
        </div>

        <div className="qw-stat-pill amber">
          <div className="qw-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div className="qw-stat-info">
            <span className="qw-stat-val">Instant GST Output</span>
            <span className="qw-stat-lbl">Print & Share PDF</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Landing Grid */}
      <div className="qw-landing-grid">
        <div className="qw-action-card">
          <div>
            <div className="qw-card-top-tag">Commercial Sales Studio</div>
            <h3>Generate New Quotation</h3>
            <p>
              Select vehicle variant from Gautam Motors commercial inventory, configure Ex-Showroom and RTO breakdown, choose lender calculation scheme, and create a certified quotation.
            </p>
            <div className="qw-popular-models">
              <span className="qw-popular-lbl">Commercial Fleet Models</span>
              <div className="qw-model-chips">
                <span className="qw-chip">Ertiga Tour M CNG</span>
                <span className="qw-chip">Wagon-R H3 CNG</span>
                <span className="qw-chip">Toyota Rumion S CNG</span>
                <span className="qw-chip">Hyundai Aura CNG</span>
                <span className="qw-chip">Innova Crysta</span>
              </div>
            </div>
          </div>
          <button className="qw-btn-launch" onClick={toggleModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Launch Quotation Wizard
          </button>
        </div>

        <div className="qw-guide-card">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Calculation & Banking Rules
          </h3>
          <ul className="qw-guide-list">
            <li className="qw-guide-item">
              <span className="qw-guide-bullet">✓</span>
              <div><strong>SBI Bank Formula:</strong> Loan on Ex-Showroom + TCS + Insurance + Registration.</div>
            </li>
            <li className="qw-guide-item">
              <span className="qw-guide-bullet">✓</span>
              <div><strong>Union Bank Formula:</strong> Loan on Full On-Road Price across all components.</div>
            </li>
            <li className="qw-guide-item">
              <span className="qw-guide-bullet">✓</span>
              <div><strong>Mahindra, Chola & AU:</strong> Loan calculated strictly on Ex-Showroom price.</div>
            </li>
            <li className="qw-guide-item">
              <span className="qw-guide-bullet">✓</span>
              <div><strong>TCS Exemption Rule:</strong> Automatically calculated at 1% only when Ex-Showroom &gt; ₹10,00,000.</div>
            </li>
            <li className="qw-guide-item">
              <span className="qw-guide-bullet">✓</span>
              <div><strong>Live Margin & EMI:</strong> Instant recalculation of down payment with processing fees and discounts.</div>
            </li>
          </ul>
        </div>
      </div>

      {/* Car Selection Modal */}
      {isModalOpen && (
        <div className="qw-overlay" onClick={toggleModal}>
          <div className="qw-modal qw-car-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qw-modal-header">
              <div>
                <h2>Select Commercial Vehicle</h2>
                <p>Choose fleet model and variant to start quotation</p>
              </div>
              <button className="qw-close-btn" onClick={toggleModal}>×</button>
            </div>
            
            <div className="qw-modal-body">
              <div className="qw-field">
                <label>Commercial Car Brand</label>
                <select 
                  value={selectedBrand} 
                  onChange={(e) => handleBrandSelect(e.target.value)}
                  className="qw-select"
                >
                  <option value="">-- Choose Brand --</option>
                  {Object.keys(carVariants).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {selectedBrand && (
                <div className="qw-field" style={{ marginTop: '0.85rem' }}>
                  <div className="qw-variants-header">
                    <label>Available Commercial Variants</label>
                    <span className="qw-variants-count">{carVariants[selectedBrand as CarBrand]?.length || 0} Models</span>
                  </div>
                  <div className="qw-variants-grid">
                    {carVariants[selectedBrand as CarBrand]?.map(variant => {
                      const brandColors = carColors[selectedBrand as keyof typeof carColors];
                      const variantColors = brandColors ? (brandColors[variant as keyof typeof brandColors] as string[] | undefined) : [];
                      const colorCount = variantColors?.length || 0;
                      const isSelected = selectedVariant === variant;
                      return (
                        <div 
                          key={variant} 
                          className={`qw-variant-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleVariantSelect(variant)}
                        >
                          <div className="qw-variant-info">
                            <span className="qw-variant-title">{variant}</span>
                            <span className="qw-variant-colors">{colorCount} colors available</span>
                          </div>
                          <div className="qw-variant-check">
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="qw-modal-footer">
              <button className="qw-btn qw-btn-cancel" onClick={toggleModal}>Cancel</button>
              <button 
                className="qw-btn qw-btn-primary" 
                onClick={openQuotationModal}
                disabled={!selectedBrand || !selectedVariant}
              >
                Continue to Wizard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quotation Details Modal */}
      {isQuotationModalOpen && (
        <div className="qw-overlay" onClick={(e) => e.target === e.currentTarget && closeQuotationModal()}>
          <div className="qw-modal qw-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qw-modal-header">
              <div className="qw-header-title-box">
                <h2>Quotation Details</h2>
                <span className="qw-vehicle-tag">{selectedBrand} • {selectedVariant}</span>
              </div>
              <button className="qw-close-btn" onClick={closeQuotationModal}>×</button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="qw-stepper-wrap">
              <div 
                className={`qw-step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`} 
                onClick={() => currentStep > 1 && setCurrentStep(1)}
              >
                <span className="qw-step-circle">{currentStep > 1 ? '✓' : '1'}</span>
                <span className="qw-step-label">Vehicle & Bank</span>
              </div>
              <div className={`qw-step-connector ${currentStep > 1 ? 'completed' : ''}`}></div>
              <div 
                className={`qw-step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`} 
                onClick={() => currentStep > 2 && setCurrentStep(2)}
              >
                <span className="qw-step-circle">{currentStep > 2 ? '✓' : '2'}</span>
                <span className="qw-step-label">Cost Breakdown</span>
              </div>
              <div className={`qw-step-connector ${currentStep > 2 ? 'completed' : ''}`}></div>
              <div className={`qw-step-item ${currentStep === 3 ? 'active' : ''}`}>
                <span className="qw-step-circle">3</span>
                <span className="qw-step-label">Loan & EMI</span>
              </div>
            </div>
            
            {/* Error Display */}
            {errors.submit && (
              <div className="qw-error-banner" style={{ margin: '0.75rem 1.25rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span><strong>Error:</strong> {errors.submit}</span>
                </div>
                <button 
                  onClick={() => setErrors({ ...errors, submit: '' })}
                  style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="qw-modal-body">
              {renderStepContent()}
            </div>
            
            <div className="qw-modal-footer">
              <div className="qw-footer-left">
                {currentStep > 1 && (
                  <button 
                    className="qw-btn qw-btn-prev"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    ← Previous
                  </button>
                )}
              </div>
              
              <div className="qw-footer-right">
                <button className="qw-btn qw-btn-cancel" onClick={closeQuotationModal}>
                  Cancel
                </button>
                
                {currentStep < 3 ? (
                  <button 
                    className="qw-btn qw-btn-primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next Step →
                  </button>
                ) : (
                  <button 
                    className={`qw-btn qw-btn-generate ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
                    onClick={handleQuotationSubmit}
                    disabled={isSubmitting || submitSuccess}
                  >
                    {isSubmitting ? 'Processing...' : submitSuccess ? '✓ Generated!' : 'Generate Quotation'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {submitSuccess && quotationData && (
        <div className="qw-overlay">
          <div className="qw-modal qw-success-modal">
            <div className="qw-modal-header">
              <h2>Quotation Generated</h2>
              <button 
                className="qw-close-btn"
                onClick={() => navigate('/dashboard/quotations')}
              >×</button>
            </div>
            
            <div className="qw-success-body">
              <div className="qw-success-check">✓</div>
              <h3>Quotation #{quotationData.vendor_id}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Created on: {new Date(quotationData.created_at).toLocaleDateString('en-IN')}
              </p>
              
              <div className="qw-success-summary">
                <div className="qw-summary-row">
                  <span>Car Model:</span>
                  <strong>{quotationData.car_model} {quotationData.model_variant}</strong>
                </div>
                <div className="qw-summary-row">
                  <span>On Road Price:</span>
                  <strong>₹{quotationData.on_the_road.toLocaleString('en-IN')}</strong>
                </div>
                <div className="qw-summary-row">
                  <span>Down Payment:</span>
                  <strong>₹{quotationData.final_down_payment.toLocaleString('en-IN')}</strong>
                </div>
                {quotationData.monthly_emi > 0 && (
                  <div className="qw-summary-row">
                    <span>Monthly EMI:</span>
                    <strong>₹{quotationData.monthly_emi.toLocaleString('en-IN')}/month ({quotationData.emi_years} yrs)</strong>
                  </div>
                )}
              </div>
              
              <button 
                className="qw-btn qw-btn-primary"
                style={{ width: '100%', height: '36px' }}
                onClick={() => navigate(`/dashboard/quotations/${quotationData.vendor_id}`)}
              >
                View Quotation Details →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationCreationPage;