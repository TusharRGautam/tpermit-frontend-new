import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetailWithInvoices.css';
import quotationService from '../../services/quotationService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

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
}

interface BankOption {
  name: string;
  roi: string;
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
  const [showFullQuotation, setShowFullQuotation] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Bank options - Only SBI bank is supported
  const bankOptions: { [key: string]: BankOption } = {
    'SBI': { name: 'State Bank of India', roi: '8.45%' }
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
      'Maruti Suzuki Wagon-R': '/Website-Images/Cars/wagnor.jpg',
      'Maruti Suzuki ERTIGA': '/Website-Images/Cars/ertiga.jpg',
      'TOYOTA RUMION': '/Website-Images/Cars/Ruminum.jpg',
      'HYUNDAI AURA': '/Website-Images/Cars/Aura.jpg',
      'Maruti Suzuki Dzire': '/Website-Images/Cars/Dzire.jpg',
      'Toyota Innova Crysta': '/Website-Images/Cars/Crysta.jpg'
    };
    return imageMap[carName] || '/Website-Images/Cars/default.jpg';
  };

  // Function to get bank name from quotation data - Only SBI
  const getBankNameFromQuotation = (quotation: QuotationData): string => {
    // Only return SBI bank for all quotations
    return 'State Bank of India';
  };

  // Function to convert quotation to CarVariant - Only SBI data
  const convertQuotationToVariant = (quotation: QuotationData, index: number): CarVariant => {
    const bankName = 'State Bank of India'; // Always SBI
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
        console.log(`Fetching SBI bank quotations for: ${modelName}`);

        // Get all quotations for this car model - Only SBI bank quotations
        const allQuotations = await quotationService.getAllQuotations();
        const carQuotations = allQuotations.filter((q: QuotationData) => 
          q.car_model === modelName && q.sbi_bank > 0
        );
        
        if (carQuotations.length === 0) {
          setError('No SBI bank quotations found for this car model');
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
          // Always set SBI bank since we only deal with SBI quotations
          setSelectedBank(bankOptions['SBI']);
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
    setShowFullQuotation(false); // Reset quotation expansion when variant changes
    
    // Always set SBI bank since we only deal with SBI quotations
    setSelectedBank(bankOptions['SBI']);
    
    scrollToTop();
  };

  const handleBankSelect = (bankKey: string) => {
    // Only SBI bank is supported, so no bank switching needed
    if (bankKey === 'SBI') {
      setSelectedBank(bankOptions['SBI']);
    }
  };

  const toggleFullQuotation = () => {
    setShowFullQuotation(!showFullQuotation);
  };

  const downloadAsPDF = async () => {
    if (!selectedVariant || !invoiceRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Temporarily show full quotation for PDF generation
      const wasShowingFull = showFullQuotation;
      setShowFullQuotation(true);
      
      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: invoiceRef.current.offsetWidth,
        height: invoiceRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.invoice-content');
          const companyHeader = clonedDoc.querySelector('.company-header');
          const companyHeaderH2 = clonedDoc.querySelector('.company-header h2');
          const companyDetails = clonedDoc.querySelectorAll('.company-details p');
          const tableElement = clonedDoc.querySelector('.invoice-table');
          const tableCells = clonedDoc.querySelectorAll('.invoice-table td');
          
          if (clonedElement) {
            (clonedElement as HTMLElement).style.backgroundColor = '#ffffff';
            (clonedElement as HTMLElement).style.padding = '20px';
            (clonedElement as HTMLElement).style.fontSize = '16px';
            (clonedElement as HTMLElement).style.lineHeight = '1.5';
            (clonedElement as HTMLElement).style.fontFamily = 'Arial, sans-serif';
            (clonedElement as HTMLElement).style.color = '#000000'; // Ensure black text
          }
          
          // Force display and style company header for PDF
          if (companyHeader) {
            (companyHeader as HTMLElement).style.display = 'block';
            (companyHeader as HTMLElement).style.textAlign = 'center';
            (companyHeader as HTMLElement).style.padding = '20px 0';
            (companyHeader as HTMLElement).style.borderBottom = '2px solid #e5e7eb';
            (companyHeader as HTMLElement).style.marginBottom = '20px';
            (companyHeader as HTMLElement).style.backgroundColor = '#ffffff';
          }
          
          if (companyHeaderH2) {
            (companyHeaderH2 as HTMLElement).style.fontSize = '24px';
            (companyHeaderH2 as HTMLElement).style.fontWeight = '700';
            (companyHeaderH2 as HTMLElement).style.color = '#000000'; // Pure black for better visibility
            (companyHeaderH2 as HTMLElement).style.margin = '0 0 10px 0';
            (companyHeaderH2 as HTMLElement).style.textTransform = 'uppercase';
            (companyHeaderH2 as HTMLElement).style.letterSpacing = '1px';
            (companyHeaderH2 as HTMLElement).style.fontFamily = 'Arial, sans-serif';
          }
          
          // Style company details
          companyDetails.forEach(detail => {
            (detail as HTMLElement).style.margin = '4px 0';
            (detail as HTMLElement).style.fontSize = '12px';
            (detail as HTMLElement).style.color = '#000000'; // Pure black for better visibility
            (detail as HTMLElement).style.fontWeight = '600'; // Bolder text
            (detail as HTMLElement).style.lineHeight = '1.4';
            (detail as HTMLElement).style.fontFamily = 'Arial, sans-serif';
          });
          
          // Improve table styling for PDF
          if (tableElement) {
            (tableElement as HTMLElement).style.fontSize = '14px';
            (tableElement as HTMLElement).style.width = '100%';
            (tableElement as HTMLElement).style.borderCollapse = 'collapse';
            (tableElement as HTMLElement).style.fontFamily = 'Arial, sans-serif';
            (tableElement as HTMLElement).style.backgroundColor = '#ffffff';
            (tableElement as HTMLElement).style.color = '#000000';
          }
          
          // Style specific table rows for better visibility
          const tableRows = clonedDoc.querySelectorAll('.invoice-table tr');
          tableRows.forEach((row, index) => {
            if (index % 2 === 0) {
              (row as HTMLElement).style.backgroundColor = '#f8f9fa';
            } else {
              (row as HTMLElement).style.backgroundColor = '#ffffff';
            }
          });
          
          // Style important rows with better contrast
          const onRoadRow = clonedDoc.querySelector('.on-road-row');
          if (onRoadRow) {
            (onRoadRow as HTMLElement).style.backgroundColor = '#e3f2fd !important';
            (onRoadRow as HTMLElement).style.fontWeight = '700';
          }
          
          const emiRow = clonedDoc.querySelector('.emi-row');
          if (emiRow) {
            (emiRow as HTMLElement).style.backgroundColor = '#fff3e0 !important';
            (emiRow as HTMLElement).style.fontWeight = '700';
          }
          
          // Enhance table cell styling for better readability
          tableCells.forEach(cell => {
            (cell as HTMLElement).style.padding = '12px 16px';
            (cell as HTMLElement).style.fontSize = '14px';
            (cell as HTMLElement).style.lineHeight = '1.4';
            (cell as HTMLElement).style.color = '#000000'; // Pure black for better contrast
            (cell as HTMLElement).style.backgroundColor = '#ffffff'; // Pure white background
            (cell as HTMLElement).style.border = '1px solid #000000'; // Black borders
            (cell as HTMLElement).style.fontFamily = 'Arial, sans-serif';
            (cell as HTMLElement).style.fontWeight = '600'; // Bolder text
          });
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions and position
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const maxWidth = pdfWidth - 20; // 10mm margin on each side
      const maxHeight = pdfHeight - 30; // 15mm margin top and bottom
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const imgX = (pdfWidth - scaledWidth) / 2;
      const imgY = 15; // Small top margin

      pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight, undefined, 'FAST');
      
      const fileName = `ASW_Quotation_${selectedVariant.modelName.replace(/\s+/g, '_')}_${selectedVariant.bankName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Restore previous quotation state
      setShowFullQuotation(wasShowingFull);
      
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
        ['ASW CARS & FINANCE', ''],
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
      
      const fileName = `ASW_Quotation_${selectedVariant.modelName.replace(/\s+/g, '_')}_${selectedVariant.bankName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    <div className="car-detail-page" ref={pageTopRef}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <div className="car-detail-container elevated">
        <div className="car-image-section">
          <img src={selectedVariant.image} alt={selectedVariant.name} className="car-detail-image" />
          <h2 className="car-name">{selectedVariant.name}</h2>
          
          {/* Move More Variants section to top below car image */}
          <div className="car-variants-section-inline">
            <h3>More Variants</h3>
            <div className="car-variants-grid-inline">
              {variants.map(variant => (
                <div 
                  key={variant.id}
                  className={`variant-card-inline ${selectedVariant.id === variant.id ? 'active' : ''}`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="variant-image-container-inline">
                    <img src={variant.image} alt={variant.name} />
                  </div>
                  <div className="variant-details-inline">
                    <h4>{variant.name}</h4>
                    <p className="variant-downpayment">Down: {variant.downPayment}</p>
                    <p className="variant-emi">EMI: {variant.monthlyPayment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="invoice-section">
          <div className="invoice-header">
            <h2>ASW CARS & FINANCE</h2>
          </div>
          
          {/* Bank Selection - Only SBI Bank supported */}
          <div className="bank-selection">
            <h3>Financing Partner:</h3>
            <div className="bank-logo-container">
              <img 
                src="/Website-Images/Banks/SBI.webp" 
                alt="State Bank of India" 
                className="bank-logo larger"
              />
              <span className="bank-name">State Bank of India</span>
            </div>
          </div>
          
          {/* Move Ex-showroom Price to right side */}
          <div className="on-road-price-section">
            <div className="on-road-price">
              Ex-showroom Price: ₹{(() => {
                const exShowroom = selectedVariant.quotationData?.ex_showroom || 0;
                const offers = selectedVariant.quotationData?.offers || 0;
                return (exShowroom - offers).toLocaleString('en-IN');
              })()}
            </div>
            <button 
              className="full-quotation-btn"
              onClick={toggleFullQuotation}
            >
              {showFullQuotation ? 'Hide Full Quotation' : 'Full Quotation'}
            </button>
          </div>
          
          {/* Full Quotation - Expandable */}
          <div className={`quotation-container ${showFullQuotation ? 'expanded' : 'collapsed'}`}>
            <div className="invoice-content" ref={invoiceRef}>
              {/* Company Header for PDF */}
              <div className="company-header">
                <h2>ASW CARS & FINANCE</h2>
                <div className="company-details">
                  <p>Shop No. 123, Main Road, Auto Market</p>
                  <p>City Center, Thane - 560001</p>
                  <p>Contact: +91 91025 26006 | Email: info@aswcars.com</p>
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
          
          {/* Download Section - Replace Excel button with Enquiry and Book Now */}
          {showFullQuotation && (
            <div className="download-section">
              <h3>Download Quotation:</h3>
              <div className="download-buttons">
                <button 
                  className="download-button pdf-button"
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
                      PDF
                    </>
                  )}
                </button>
                
                <a 
                  href="https://wa.me/+919102526006?text=I'm%20interested%20in%20this%20car.%20Please%20provide%20more%20details." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="download-button enquiry-button"
                >
                  <span className="download-icon">💬</span>
                  Enquiry
                </a>
                
                <button 
                  className="download-button book-button"
                >
                  <span className="download-icon">🚗</span>
                  Book Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetailWithInvoices;