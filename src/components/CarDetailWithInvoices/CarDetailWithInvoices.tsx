import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetailWithInvoices.css';
import quotationService from '../../services/quotationService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import BookingModal from '../BookingModal/BookingModal';

interface CarVariant {
  id: number;
  name: string;
  image: string;
  modelName: string;
  price: string;
  financing: string;
  downPayment: string;
  monthlyPayment: string;
  bankName: string;
  roi: string;
  quotationData?: any; // Store the original quotation data
}

interface QuotationData {
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
}

interface BankOption {
  name: string;
  roi: string;
}

// BookingModal variant interface - different from CarVariant
interface BookingModalVariant {
  id: string;
  name: string;
  exShowroom: number;
  onRoadPrice: number;
  monthlyEmi: number;
  downPayment: number;
  bookingAmount: number;
}

const CarDetailWithInvoices: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBank, setSelectedBank] = useState<BankOption>({ name: 'State Bank of India', roi: '8.45%' });
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [carModel, setCarModel] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // BookingModal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalVariants, setBookingModalVariants] = useState<BookingModalVariant[]>([]);

  // Bank options - All banks supported
  const bankOptions: { [key: string]: BankOption } = {
    'SBI': { name: 'State Bank of India', roi: '8.45%' },
    'Union': { name: 'Union Bank of India', roi: '8.50%' },
    'Mahindra': { name: 'Mahindra Finance', roi: '8.75%' },
    'Cholamandalam': { name: 'Cholamandalam Bank', roi: '8.85%' },
    'AU': { name: 'AU Small Finance Bank', roi: '9.00%' }
  };

  // Effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto' // Using 'auto' for immediate scroll without animation
    });
  }, []);

  // Function to convert car ID to model name - Updated with new model names
  const getCarModelFromId = (id: string): string => {
    const idToModelMap: { [key: string]: string } = {
      'maruti-suzuki-wagon-r': 'Maruti Suzuki Wagon-R',
      'wagnor': 'Maruti Suzuki Wagon-R',
      'maruti-suzuki-ertiga': 'Maruti Suzuki ERTIGA',
      'ertiga': 'Maruti Suzuki ERTIGA',
      'toyota-rumion': 'TOYOTA RUMION',
      'rumion': 'TOYOTA RUMION',
      'hyundai-aura': 'HYUNDAI AURA',
      'aura': 'HYUNDAI AURA',
      'maruti-suzuki-dzire': 'Maruti Suzuki Dzire',
      'dzire': 'Maruti Suzuki Dzire',
      'toyota-innova-crysta': 'Toyota Innova Crysta',
      'crysta': 'Toyota Innova Crysta'
    };
    return idToModelMap[id] || '';
  };

  // Function to get car image path - Updated with new model names
  const getCarImagePath = (carName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Maruti Suzuki Wagon-R': '/Website-Images/Cars/wagnor.png',
      'Maruti Suzuki ERTIGA': '/Website-Images/Cars/ertiga.png',
      'TOYOTA RUMION': '/Website-Images/Cars/Rumion.png',
      'HYUNDAI AURA': '/Website-Images/Cars/Aura.png',
      'Maruti Suzuki Dzire': '/Website-Images/Cars/Dzire.png',
      'Toyota Innova Crysta': '/Website-Images/Cars/crysta.png'
    };
    return imageMap[carName] || '/Website-Images/Cars/default.jpg';
  };

  // Function to get bank name from quotation data - All banks
  const getBankNameFromQuotation = (quotation: QuotationData): string => {
    if (quotation.sbi_bank > 0) return 'State Bank of India';
    if (quotation.union_bank > 0) return 'Union Bank of India';
    if (quotation.mahindra_finance > 0) return 'Mahindra Finance';
    if (quotation.cholamandalam_bank > 0) return 'Cholamandalam Bank';
    if (quotation.au_bank > 0) return 'AU Small Finance Bank';
    return 'State Bank of India'; // Default to SBI
  };

  // Function to convert quotation to CarVariant - All banks
  const convertQuotationToVariant = (quotation: QuotationData, index: number): CarVariant => {
    const bankName = getBankNameFromQuotation(quotation);
    const imagePath = getCarImagePath(quotation.car_model);

    return {
      id: index + 1,
      name: `${quotation.car_model.split(' ').slice(-1)[0]} ${quotation.model_variant}`,
      image: imagePath,
      modelName: `${quotation.car_model.split(' ').slice(-1)[0].toUpperCase()} ${quotation.model_variant.toUpperCase()}`,
      price: `₹${quotation.ex_showroom.toLocaleString('en-IN')}`,
      financing: bankName,
      downPayment: `₹${quotation.final_down_payment.toLocaleString('en-IN')}`,
      monthlyPayment: `₹${Math.round(quotation.monthly_emi).toLocaleString('en-IN')}`,
      bankName: bankName,
      roi: `${quotation.roi_emi_interest}%`,
      quotationData: quotation
    };
  };

  // Function to convert CarVariant to BookingModalVariant format
  const convertToBookingVariants = (carVariants: CarVariant[]): BookingModalVariant[] => {
    return carVariants.map((variant, index) => ({
      id: `${variant.id}`,
      name: variant.name,
      exShowroom: variant.quotationData?.ex_showroom || 0,
      onRoadPrice: variant.quotationData?.on_the_road || 0,
      monthlyEmi: Math.round(variant.quotationData?.monthly_emi || 0),
      downPayment: variant.quotationData?.final_down_payment || 0,
      bookingAmount: 5000 // Fixed booking amount
    }));
  };

  // Fetch car data from backend
  useEffect(() => {
    const fetchCarData = async () => {
      if (!carId) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const modelName = getCarModelFromId(carId);
        if (!modelName) {
          setError('Car model not found');
          navigate('/');
          return;
        }

        setCarModel(modelName);
        console.log(`Fetching quotations for all banks for: ${modelName}`);

        // Get all quotations for this car model - All banks
        const allQuotations = await quotationService.getAllQuotations();
        const carQuotations = allQuotations.filter((q: QuotationData) =>
          q.car_model === modelName &&
          (q.sbi_bank > 0 || q.union_bank > 0 || q.mahindra_finance > 0 || q.cholamandalam_bank > 0 || q.au_bank > 0)
        );

        if (carQuotations.length === 0) {
          setError('No quotations found for this car model');
          navigate('/');
          return;
        }

        setQuotations(carQuotations);

        // Convert quotations to CarVariant format
        const carVariants = carQuotations.map((quotation: QuotationData, index: number) => 
          convertQuotationToVariant(quotation, index)
        );

        // Group by variant name and select best offer for each variant
        const variantGroups: { [key: string]: CarVariant[] } = {};
        carVariants.forEach(variant => {
          const variantKey = variant.name;
          if (!variantGroups[variantKey]) {
            variantGroups[variantKey] = [];
          }
          variantGroups[variantKey].push(variant);
        });

        // Select the best variant from each group (lowest down payment)
        const bestVariants = Object.values(variantGroups).map(group => {
          return group.reduce((best, current) => {
            const bestDownPayment = parseFloat(best.downPayment.replace(/[₹,]/g, ''));
            const currentDownPayment = parseFloat(current.downPayment.replace(/[₹,]/g, ''));
            return currentDownPayment < bestDownPayment ? current : best;
          });
        });

        setVariants(bestVariants);

        // Set the first variant as selected
        if (bestVariants.length > 0) {
          setSelectedVariant(bestVariants[0]);
          // Set bank based on the first variant's bank
          const firstBankName = bestVariants[0].bankName;
          const bankKey = Object.keys(bankOptions).find(key => bankOptions[key].name === firstBankName) || 'SBI';
          setSelectedBank(bankOptions[bankKey]);
          // Prepare booking modal variants
          setBookingModalVariants(convertToBookingVariants(bestVariants));
        }

      } catch (error) {
        console.error('Error fetching car data:', error);
        setError('Failed to load car data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarData();
  }, [carId, navigate]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleVariantSelect = (variant: CarVariant) => {
    setSelectedVariant(variant);

    // Set bank based on the variant's bank
    const bankKey = Object.keys(bankOptions).find(key => bankOptions[key].name === variant.bankName) || 'SBI';
    setSelectedBank(bankOptions[bankKey]);

    scrollToTop();
  };

  const handleBankSelect = (bankKey: string) => {
    // Set the selected bank
    if (bankOptions[bankKey]) {
      setSelectedBank(bankOptions[bankKey]);
    }
  };

  const handleBookNow = () => {
    if (!selectedVariant || bookingModalVariants.length === 0) return;
    
    // Check if we're on mobile/tablet (including touch devices)
    const isMobileOrTablet = window.innerWidth <= 992 || 
                            'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0;
    
    if (isMobileOrTablet) {
      // Force immediate scroll to top with multiple methods for maximum compatibility
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also ensure any fixed/sticky elements are properly reset
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      } catch (e) {
        // Fallback if modern scroll API not supported
      }
      
      // Immediate modal opening for mobile (no delay needed since we're forcing position)
      setIsBookingModalOpen(true);
    } else {
      // Desktop - immediate modal opening
      setIsBookingModalOpen(true);
    }
  };


  const downloadAsPDF = async () => {
    if (!selectedVariant) return;

    try {
      setIsDownloading(true);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Company Header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GAUTAM MOTORS & FINANCE', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('DIVA EAST', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 5;
      pdf.text('Contact: Rakesh Gautam - 8652089525', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 5;

      yPosition += 10;
      pdf.setLineWidth(0.5);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);

      yPosition += 10;

      // Prepare table data
      const quotationData = selectedVariant.quotationData;
      const exShowroom = quotationData?.ex_showroom || 0;
      const showTCS = exShowroom > 1000000;
      const tcs = showTCS ? Math.round(exShowroom * 0.01) : 0;

      const onTheRoad = Math.round(
        exShowroom +
        tcs +
        (quotationData?.registration || 0) +
        (quotationData?.insurance || 0) +
        (quotationData?.gps || 0) +
        (quotationData?.speed_governor || 0) +
        (quotationData?.accessories || 0)
      );

      const tableData: any[] = [
        ['car model :', selectedVariant.modelName],
        ['', selectedVariant.bankName],
        ['', `ROI ${selectedVariant.roi}`],
        ['Cost of the vehicle EX Showroom', `Rs.${exShowroom.toLocaleString('en-IN')}`],
      ];

      if (showTCS) {
        tableData.push(['TCS', `Rs.${tcs.toLocaleString('en-IN')}`]);
      }

      tableData.push(
        ['Registration', `Rs.${(quotationData?.registration || 0).toLocaleString('en-IN')}`],
        ['Insurance', `Rs.${(quotationData?.insurance || 0).toLocaleString('en-IN')}`],
        ['GPS', `Rs.${(quotationData?.gps || 0).toLocaleString('en-IN')}`],
        ['Speed Governor', `Rs.${(quotationData?.speed_governor || 0).toLocaleString('en-IN')}`],
        ['On the road', `Rs.${onTheRoad.toLocaleString('en-IN')}`],
        ['Loan Amount', `Rs.${(quotationData?.loan_amount || 0).toLocaleString('en-IN')}`],
        ['Margin (Down payment)', `Rs.${(quotationData?.margin_down_payment || 0).toLocaleString('en-IN')}`],
        ['Process fee', `Rs.${(quotationData?.process_fee || 0).toLocaleString('en-IN')}`],
        ['Stamp duty', `Rs.${(quotationData?.stamp_duty || 0).toLocaleString('en-IN')}`],
        ['Handling Loan Services and Document Charge', `Rs.${(quotationData?.handling_document_charge || 0).toLocaleString('en-IN')}`],
        ['Down Payment', `Rs.${(quotationData?.down_payment || 0).toLocaleString('en-IN')}`],
        ['Offers', `Rs.${(quotationData?.offers || 0).toLocaleString('en-IN')}`],
        ['Final Down Payment', `Rs.${(quotationData?.final_down_payment || 0).toLocaleString('en-IN')}`],
        [`${quotationData?.emi_years || 5} years (${(quotationData?.emi_years || 5) * 12} Months)`, `Rs.${Math.round(quotationData?.monthly_emi || 0).toLocaleString('en-IN')}`]
      );

      // Use autoTable to create the table
      autoTable(pdf, {
        startY: yPosition,
        head: [],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 100, halign: 'left' },
          1: { cellWidth: 80, halign: 'left', fontStyle: 'bold' }
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        bodyStyles: {
          fillColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didParseCell: function(data: any) {
          // Highlight specific rows
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [255, 255, 200]; // Light yellow for car model
            data.cell.styles.fontStyle = 'bold';
          }
          if (tableData[data.row.index] && tableData[data.row.index][0] === 'On the road') {
            data.cell.styles.fillColor = [255, 235, 150]; // Yellow for on-road
            data.cell.styles.fontStyle = 'bold';
          }
          if (tableData[data.row.index] && tableData[data.row.index][0] === 'Down Payment') {
            data.cell.styles.fillColor = [255, 235, 150]; // Yellow for down payment
            data.cell.styles.fontStyle = 'bold';
          }
          if (tableData[data.row.index] && tableData[data.row.index][0] === 'Offers') {
            data.cell.styles.fillColor = [200, 255, 200]; // Light green for offers
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [255, 0, 0]; // Red text for offers
          }
          if (tableData[data.row.index] && tableData[data.row.index][0].includes('years')) {
            data.cell.styles.fillColor = [200, 220, 255]; // Light blue for EMI
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [255, 0, 0]; // Red text for EMI
          }
        }
      });

      const fileName = `T-Permit_Quotation_${selectedVariant.modelName.replace(/\s+/g, '_')}_${selectedVariant.bankName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsExcel = () => {
    if (!selectedVariant) return;
    
    try {
      setIsDownloading(true);
      
      const quotationData = selectedVariant.quotationData;
      
      // Calculate TCS based on ex-showroom price - Only if > ₹10,00,000
      const exShowroom = quotationData?.ex_showroom || 0;
      const calculatedTCS = exShowroom > 1000000 ? exShowroom * 0.01 : 0;
      const showTCS = exShowroom > 1000000;
      
      const data = [
        ['T-PERMIT CARS & FINANCE', ''],
        ['', ''],
        ['Car Model', selectedVariant.modelName],
        ['Bank', selectedVariant.bankName],
        ['ROI', selectedVariant.roi],
        ['', ''],
        ['Cost of the vehicle EX Showroom', `₹${exShowroom.toLocaleString('en-IN') || selectedVariant.price}`],
        // Only include TCS row if Ex-Showroom > ₹10,00,000
        ...(showTCS ? [['TCS', `₹${Math.round(calculatedTCS).toLocaleString('en-IN')}`]] : []),
        ['Registration', `₹${quotationData?.registration?.toLocaleString('en-IN') || '39,500'}`],
        ['Insurance', `₹${quotationData?.insurance?.toLocaleString('en-IN') || '39,500'}`],
        ['GPS', `₹${quotationData?.gps?.toLocaleString('en-IN') || '18,500'}`],
        ['Speed Governor', `₹${quotationData?.speed_governor?.toLocaleString('en-IN') || '0'}`],
        ['On the road', `₹${(() => {
          // Calculate On-Road Price excluding Number Plate/CRTm/AutoCard charges
          const total = 
            exShowroom + 
            calculatedTCS + 
            (quotationData?.registration || 0) + 
            (quotationData?.insurance || 0) + 
            (quotationData?.gps || 0) + 
            (quotationData?.speed_governor || 0) + 
            (quotationData?.accessories || 0);
            // Note: number_plate_crtm_autocard is excluded from On-Road Price
          return Math.round(total).toLocaleString('en-IN');
        })()}`],
        ['Loan Amount', `₹${quotationData?.loan_amount?.toLocaleString('en-IN') || '10,10,000'}`],
        ['Margin (Down payment)', `₹${quotationData?.margin_down_payment?.toLocaleString('en-IN') || '2,01,105'}`],
        ['Process fee', `₹${quotationData?.process_fee?.toLocaleString('en-IN') || '16,500'}`],
        ['Stamp duty', `₹${quotationData?.stamp_duty?.toLocaleString('en-IN') || '6,500'}`],
        ['Handling Loan Services and Document Charge', `₹${quotationData?.handling_document_charge?.toLocaleString('en-IN') || '30,300'}`],
        ['Down Payment', `₹${quotationData?.down_payment?.toLocaleString('en-IN') || selectedVariant.downPayment}`],
        ['Offers', `₹${quotationData?.offers?.toLocaleString('en-IN') || '100'}`],
        ['Final Down Payment', `₹${quotationData?.final_down_payment?.toLocaleString('en-IN') || selectedVariant.downPayment}`],
        [`${quotationData?.emi_years || 5} years (${(quotationData?.emi_years || 5) * 12} Months)`, `₹${Math.round(quotationData?.monthly_emi || 0).toLocaleString('en-IN')}`]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotation');
      
      // Style the header
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:B1');
      worksheet['!cols'] = [
        { width: 35 },
        { width: 20 }
      ];
      
      const fileName = `T-Permit_Quotation_${selectedVariant.modelName.replace(/\s+/g, '_')}_${selectedVariant.bankName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  

  // Add loading and error states
  if (error) {
    return (
      <div className="error-page" style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>⚠️ Error Loading Car Data</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (isLoading || !selectedVariant) {
    return (
      <div className="loading-page" style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        color: '#64748b'
      }}>
        <div className="loading-spinner" style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  return (
    <div className="car-detail-page-compact" ref={pageTopRef}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <div className="car-detail-container-compact">
        <div className="car-image-section-compact">
          <div className="main-car-image-container">
            <img src={selectedVariant.image} alt={selectedVariant.name} className="car-detail-image-compact" />
            <button 
              className="book-now-overlay-btn"
              onClick={handleBookNow}
            >
              🚗 Book Now
            </button>
          </div>
          <h2 className="car-name-compact">{selectedVariant.name}</h2>
          
          {/* Compact Variants Section */}
          <div className="car-variants-section-compact">
            <h3>Available Variants</h3>
            <div className="car-variants-grid-compact">
              {variants.map(variant => (
                <div 
                  key={variant.id}
                  className={`variant-card-compact ${selectedVariant.id === variant.id ? 'selected' : ''}`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="variant-image-small">
                    <img src={variant.image} alt={variant.name} />
                  </div>
                  <div className="variant-info-compact">
                    <div className="variant-name-compact">{variant.name}</div>
                    <div className="variant-pricing-compact">
                      <span className="down-payment-compact">₹{variant.downPayment.replace('₹', '')}</span>
                      <span className="emi-compact">EMI: ₹{variant.monthlyPayment.replace('₹', '')}</span>
                    </div>
                    <div className="variant-bank-compact">{variant.bankName.split(' ')[0]}</div>
                  </div>
                  {selectedVariant.id === variant.id && (
                    <div className="variant-selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="invoice-section-compact">
          <div className="invoice-header-compact">
            <h2>T-PERMIT CARS & FINANCE</h2>
            <div className="bank-info-compact">
              <img
                src={`/Website-Images/Banks/${(() => {
                  if (selectedVariant.bankName.includes('SBI')) return 'SBI.webp';
                  if (selectedVariant.bankName.includes('Union')) return 'Union.webp';
                  if (selectedVariant.bankName.includes('Mahindra')) return 'mahindra.webp';
                  if (selectedVariant.bankName.includes('Cholamandalam')) return 'chola.webp';
                  if (selectedVariant.bankName.includes('AU')) return 'AU BANk.jpg';
                  return 'SBI.webp';
                })()}`}
                alt={selectedVariant.bankName}
                className="bank-logo-compact"
              />
              <span className="bank-name-compact">{selectedVariant.bankName}</span>
            </div>
          </div>

          {/* Bank Selection Buttons */}
          <div className="bank-selection-buttons">
            <button
              className={`bank-btn ${selectedVariant.bankName.includes('SBI') ? 'active' : ''}`}
              onClick={() => {
                const sbiVariant = variants.find(v => v.bankName.includes('SBI'));
                if (sbiVariant) handleVariantSelect(sbiVariant);
              }}
              disabled={!variants.some(v => v.bankName.includes('SBI'))}
            >
              <img src="/Website-Images/Banks/SBI.webp" alt="SBI" className="bank-btn-logo" />
              SBI Bank
            </button>

            <button
              className={`bank-btn ${selectedVariant.bankName.includes('Union') ? 'active' : ''}`}
              onClick={() => {
                const unionVariant = variants.find(v => v.bankName.includes('Union'));
                if (unionVariant) handleVariantSelect(unionVariant);
              }}
              disabled={!variants.some(v => v.bankName.includes('Union'))}
            >
              <img src="/Website-Images/Banks/Union Bank.webp" alt="Union Bank" className="bank-btn-logo" />
              Union Bank
            </button>

            <button
              className={`bank-btn ${selectedVariant.bankName.includes('Mahindra') ? 'active' : ''}`}
              onClick={() => {
                const mahindraVariant = variants.find(v => v.bankName.includes('Mahindra'));
                if (mahindraVariant) handleVariantSelect(mahindraVariant);
              }}
              disabled={!variants.some(v => v.bankName.includes('Mahindra'))}
            >
              <img src="/Website-Images/Banks/mahindra.webp" alt="Mahindra Finance" className="bank-btn-logo" />
              Mahindra Finance
            </button>

            <button
              className={`bank-btn ${selectedVariant.bankName.includes('Cholamandalam') ? 'active' : ''}`}
              onClick={() => {
                const cholaVariant = variants.find(v => v.bankName.includes('Cholamandalam'));
                if (cholaVariant) handleVariantSelect(cholaVariant);
              }}
              disabled={!variants.some(v => v.bankName.includes('Cholamandalam'))}
            >
              <img src="/Website-Images/Banks/chola.webp" alt="Cholamandalam Bank" className="bank-btn-logo" />
              Cholamandalam
            </button>

            <button
              className={`bank-btn ${selectedVariant.bankName.includes('AU') ? 'active' : ''}`}
              onClick={() => {
                const auVariant = variants.find(v => v.bankName.includes('AU'));
                if (auVariant) handleVariantSelect(auVariant);
              }}
              disabled={!variants.some(v => v.bankName.includes('AU'))}
            >
              <img src="/Website-Images/Banks/AU BANk.jpg" alt="AU Small Finance Bank" className="bank-btn-logo" />
              AU Bank
            </button>
          </div>

          {/* Always visible quotation */}
          <div className="quotation-container-always-visible">
            <div className="invoice-content" ref={invoiceRef}>
              {/* Company Header for PDF */}
              <div className="company-header">
                <h2>GAUTAM MOTORS & FINANCE</h2>
                <div className="company-details">
                  <p>DIVA EAST</p>
                  <p>Contact: Rakesh Gautam - 8652089525</p>
                </div>
              </div>
              <table className="invoice-table">
                <tbody>
                  <tr className="invoice-model-row">
                    <td>car model :</td>
                    <td className="highlight-cell">{selectedVariant.modelName}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>{selectedVariant.bankName}</td>
                  </tr>
                  <tr className="roi-row">
                    <td></td>
                    <td>ROI {selectedVariant.roi}</td>
                  </tr>
                  <tr>
                    <td>Cost of the vehicle EX Showroom</td>
                    <td>₹{selectedVariant.quotationData?.ex_showroom?.toLocaleString('en-IN') || selectedVariant.price}</td>
                  </tr>
                  {/* Only show TCS if Ex-Showroom > ₹10,00,000 */}
                  {(() => {
                    const exShowroom = selectedVariant.quotationData?.ex_showroom || 0;
                    const showTCS = exShowroom > 1000000;
                    if (showTCS) {
                      return (
                        <tr>
                          <td>TCS</td>
                          <td>₹{Math.round(exShowroom * 0.01).toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    }
                    return null;
                  })()}
                  <tr>
                    <td>Registration</td>
                    <td>₹{selectedVariant.quotationData?.registration?.toLocaleString('en-IN') || '39,500'}</td>
                  </tr>
                  <tr>
                    <td>Insurance</td>
                    <td>₹{selectedVariant.quotationData?.insurance?.toLocaleString('en-IN') || '39,500'}</td>
                  </tr>
                  <tr>
                    <td>GPS</td>
                    <td>₹{selectedVariant.quotationData?.gps?.toLocaleString('en-IN') || '18,500'}</td>
                  </tr>
                  <tr>
                    <td>Speed Governor</td>
                    <td>₹{selectedVariant.quotationData?.speed_governor?.toLocaleString('en-IN') || '0'}</td>
                  </tr>
                  <tr className="on-road-row highlighted-field">
                    <td>On the road</td>
                    <td>₹{(() => {
                      const quotationData = selectedVariant.quotationData;
                      if (!quotationData) return '12,11,105';
                      
                      const exShowroom = quotationData.ex_showroom || 0;
                      // Only include TCS if Ex-Showroom > ₹10,00,000
                      const tcs = exShowroom > 1000000 ? exShowroom * 0.01 : 0;
                      
                      // Calculate On-Road Price excluding Number Plate/CRTm/AutoCard charges
                      const total = 
                        exShowroom + 
                        tcs + 
                        (quotationData.registration || 0) + 
                        (quotationData.insurance || 0) + 
                        (quotationData.gps || 0) + 
                        (quotationData.speed_governor || 0) + 
                        (quotationData.accessories || 0);
                        // Note: number_plate_crtm_autocard is excluded from On-Road Price
                      
                      return Math.round(total).toLocaleString('en-IN');
                    })()}</td>
                  </tr>
                  <tr>
                    <td>Loan Amount</td>
                    <td>₹{selectedVariant.quotationData?.loan_amount?.toLocaleString('en-IN') || '10,10,000'}</td>
                  </tr>
                  <tr>
                    <td>Margin (Down payment)</td>
                    <td>₹{selectedVariant.quotationData?.margin_down_payment?.toLocaleString('en-IN') || '2,01,105'}</td>
                  </tr>
                  <tr>
                    <td>Process fee</td>
                    <td>₹{selectedVariant.quotationData?.process_fee?.toLocaleString('en-IN') || '16,500'}</td>
                  </tr>
                  <tr>
                    <td>Stamp duty</td>
                    <td>₹{selectedVariant.quotationData?.stamp_duty?.toLocaleString('en-IN') || '6,500'}</td>
                  </tr>
                  <tr>
                    <td>Handling Loan Services and Document Charge</td>
                    <td>₹{selectedVariant.quotationData?.handling_document_charge?.toLocaleString('en-IN') || '30,300'}</td>
                  </tr>
                  <tr className="down-payment-row highlighted-field">
                    <td>Down Payment</td>
                    <td>₹{selectedVariant.quotationData?.down_payment?.toLocaleString('en-IN') || selectedVariant.downPayment}</td>
                  </tr>
                  <tr className="offers-row highlighted-field">
                    <td>Offers</td>
                    <td>₹{selectedVariant.quotationData?.offers?.toLocaleString('en-IN') || '100'}</td>
                  </tr>
                  <tr>
                    <td>Final Down Payment</td>
                    <td>₹{selectedVariant.quotationData?.final_down_payment?.toLocaleString('en-IN') || selectedVariant.downPayment}</td>
                  </tr>
                  <tr className="emi-row">
                    <td>{selectedVariant.quotationData?.emi_years || 5} years ({(selectedVariant.quotationData?.emi_years || 5) * 12} Months)</td>
                    <td>₹{Math.round(selectedVariant.quotationData?.monthly_emi || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Compact Download Section - Always visible */}
          <div className="download-section-compact">
            <div className="download-buttons-compact">
              <button
                className="download-button-compact pdf-button"
                onClick={downloadAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="download-spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="download-icon">📄</span>
                    Download Quotation
                  </>
                )}
              </button>

              <a
                href="https://wa.me/918652089525?text=I'm%20interested%20in%20this%20car.%20Please%20provide%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="download-button-compact enquiry-button"
              >
                <span className="download-icon">📞</span>
                Call
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BookingModal */}
      {selectedVariant && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          carName={selectedVariant.modelName}
          carImage={selectedVariant.image}
          variants={bookingModalVariants}
        />
      )}
    </div>
  );
};

export default CarDetailWithInvoices;