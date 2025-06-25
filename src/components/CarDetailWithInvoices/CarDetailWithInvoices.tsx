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
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Bank options
  const bankOptions: { [key: string]: BankOption } = {
    'SBI': { name: 'State Bank of India', roi: '8.45%' },
    'AU': { name: 'AU Bank', roi: '9.25%' },
    'Union': { name: 'Union Bank', roi: '7.85%' },
    'IndusInd': { name: 'IndusInd Bank', roi: '10.15%' }
  };

  // Effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto' // Using 'auto' for immediate scroll without animation
    });
  }, []);

  // Function to convert car ID to model name
  const getCarModelFromId = (id: string): string => {
    const idToModelMap: { [key: string]: string } = {
      'maruti-suzuki-ertiga': 'Maruti Suzuki Ertiga',
      'ertiga': 'Maruti Suzuki Ertiga',
      'maruti-suzuki-dzire': 'Maruti Suzuki Dzire',
      'dzire': 'Maruti Suzuki Dzire',
      'maruti-suzuki-wagon-r': 'Maruti Suzuki Wagon-R',
      'wagnor': 'Maruti Suzuki Wagon-R',
      'maruti-suzuki-rumion': 'Maruti Suzuki Rumion',
      'rumion': 'Maruti Suzuki Rumion',
      'hyundai-aura': 'Hyundai Aura',
      'aura': 'Hyundai Aura',
      'toyota-innova-crysta': 'Toyota Innova Crysta',
      'crysta': 'Toyota Innova Crysta'
    };
    return idToModelMap[id] || '';
  };

  // Function to get car image path
  const getCarImagePath = (carName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Maruti Suzuki Ertiga': '/Website-Images/Cars/ertiga.jpg',
      'Maruti Suzuki Dzire': '/Website-Images/Cars/Dzire.jpg',
      'Maruti Suzuki Wagon-R': '/Website-Images/Cars/wagnor.jpg',
      'Maruti Suzuki Rumion': '/Website-Images/Cars/Ruminum.jpg',
      'Hyundai Aura': '/Website-Images/Cars/Aura.jpg',
      'Toyota Innova Crysta': '/Website-Images/Cars/Crysta.jpg'
    };
    return imageMap[carName] || '/Website-Images/Cars/default.jpg';
  };

  // Function to get bank name from quotation data
  const getBankNameFromQuotation = (quotation: QuotationData): string => {
    if (quotation.sbi_bank > 0) return 'State Bank of India';
    if (quotation.union_bank > 0) return 'Union Bank';
    if (quotation.indusind_bank > 0) return 'IndusInd Bank';
    if (quotation.au_bank > 0) return 'AU Bank';
    return 'State Bank of India';
  };

  // Function to convert quotation to CarVariant
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
        console.log(`Fetching quotations for: ${modelName}`);

        // Get all quotations for this car model
        const allQuotations = await quotationService.getAllQuotations();
        const carQuotations = allQuotations.filter((q: QuotationData) => q.car_model === modelName);
        
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

        // Get the best offer (lowest down payment) for each variant
        const uniqueVariants = Object.values(variantGroups).map(group => {
          return group.reduce((best, current) => {
            const bestPrice = parseFloat(best.downPayment.replace(/₹|,/g, ''));
            const currentPrice = parseFloat(current.downPayment.replace(/₹|,/g, ''));
            return currentPrice < bestPrice ? current : best;
          });
        });

        setVariants(uniqueVariants);
        
        if (uniqueVariants.length > 0) {
          setSelectedVariant(uniqueVariants[0]);
          
          // Set initial bank based on the best quotation
          const bestQuotation = uniqueVariants[0].quotationData;
          const bankName = getBankNameFromQuotation(bestQuotation);
          const bankKey = Object.keys(bankOptions).find(key => 
            bankOptions[key].name === bankName
          );
          if (bankKey) {
            setSelectedBank(bankOptions[bankKey]);
          }
        }

      } catch (error) {
        console.error('Error fetching car data:', error);
        setError('Failed to load car data');
        // Fallback: navigate to home instead of showing empty page
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarData();
  }, [carId, navigate]);

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Add extra scroll to move a bit higher than the reference element
    window.scrollBy({
      top: -50, // Negative value to scroll up by 50 pixels
      behavior: 'smooth'
    });
  };

  // Function to handle variant selection
  const handleVariantSelect = (variant: CarVariant) => {
    setIsLoading(true);
    setSelectedVariant(variant);
    
    // Scroll to top immediately
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Function to handle bank selection
  const handleBankSelect = (bankKey: string) => {
    if (!selectedVariant || !selectedVariant.quotationData) return;
    
    const bank = bankOptions[bankKey];
    setSelectedBank(bank);
    
    // Find the quotation for the selected variant and bank
    const currentVariantName = selectedVariant.name;
    const targetBankField = bankKey.toLowerCase() === 'indusind' ? 'indusind_bank' : `${bankKey.toLowerCase()}_bank`;
    
         // Find quotation with matching variant and selected bank
     const matchingQuotation = quotations.find(q => {
       const variantName = `${q.car_model.split(' ').slice(-1)[0]} ${q.model_variant}`;
       const bankValue = q[targetBankField as keyof QuotationData];
       return variantName === currentVariantName && typeof bankValue === 'number' && bankValue > 0;
     });
    
    if (matchingQuotation) {
      // Update the selected variant with the new bank's data
      const updatedVariant = convertQuotationToVariant(matchingQuotation, selectedVariant.id - 1);
      setSelectedVariant(updatedVariant);
    }
  };

  // Download Functions
  const downloadAsPDF = async () => {
    if (!selectedVariant || !invoiceRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Create a temporary container for better PDF formatting
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '800px';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.padding = '40px';
      printContainer.style.fontFamily = 'Arial, sans-serif';
      
      printContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0; font-size: 28px;">ASW WHEEL CARS AND FINANCE</h1>
          <p style="color: #64748b; margin: 5px 0; font-size: 14px;">GB 60, Ground floor, High Street Mall, Kapurbawdi, Thane West, Thane-400607</p>
          <p style="color: #64748b; margin: 10px 0; font-size: 16px;">Car Quotation Invoice</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; align-items: center;">
          <div>
            <h2 style="color: #334155; margin: 0; font-size: 24px;">${selectedVariant.modelName}</h2>
            <p style="color: #64748b; margin: 5px 0;">${selectedVariant.bankName}</p>
            <p style="color: #059669; margin: 5px 0; font-weight: bold;">ROI: ${selectedVariant.roi}</p>
          </div>
          <div style="text-align: right;">
            <p style="color: #64748b; margin: 0;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
            <p style="color: #64748b; margin: 5px 0;">Invoice ID: ASW-${Date.now()}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151;">Description</th>
              <th style="padding: 15px; text-align: right; font-weight: 600; color: #374151;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Cost of the vehicle Ex-Showroom</td>
              <td style="padding: 12px; text-align: right; font-weight: 500;">₹${selectedVariant.quotationData?.ex_showroom?.toLocaleString('en-IN') || selectedVariant.price}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">TCS</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.tcs?.toLocaleString('en-IN') || '0'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Registration</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.registration?.toLocaleString('en-IN') || '39,500'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Insurance</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.insurance?.toLocaleString('en-IN') || '39,500'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Number Plate + CRTM + Autocard</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.number_plate_crtm_autocard?.toLocaleString('en-IN') || '4,500'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">GPS</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.gps?.toLocaleString('en-IN') || '18,500'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Fastag</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.fastag?.toLocaleString('en-IN') || '600'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Speed Governor</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.speed_governor?.toLocaleString('en-IN') || '0'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Accessories</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.accessories?.toLocaleString('en-IN') || '0'}</td>
            </tr>
            <tr style="border-bottom: 2px solid #3b82f6; background-color: #eff6ff;">
              <td style="padding: 15px; font-weight: 600; color: #1e40af;">On the Road Price</td>
              <td style="padding: 15px; text-align: right; font-weight: 700; color: #1e40af;">₹${selectedVariant.quotationData?.on_the_road?.toLocaleString('en-IN') || '12,11,105'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Loan Amount</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.loan_amount?.toLocaleString('en-IN') || '10,10,000'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Process Fee</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.process_fee?.toLocaleString('en-IN') || '16,500'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Stamp Duty</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.stamp_duty?.toLocaleString('en-IN') || '6,500'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Handling & Document Charges</td>
              <td style="padding: 12px; text-align: right;">₹${selectedVariant.quotationData?.handling_document_charge?.toLocaleString('en-IN') || '30,300'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; color: #374151;">Offers</td>
              <td style="padding: 12px; text-align: right; color: #059669;">-₹${selectedVariant.quotationData?.offers?.toLocaleString('en-IN') || '100'}</td>
            </tr>
            <tr style="border-bottom: 2px solid #059669; background-color: #ecfdf5;">
              <td style="padding: 15px; font-weight: 600; color: #059669;">Final Down Payment</td>
              <td style="padding: 15px; text-align: right; font-weight: 700; color: #059669;">₹${selectedVariant.quotationData?.final_down_payment?.toLocaleString('en-IN') || selectedVariant.downPayment}</td>
            </tr>
            <tr style="background-color: #fef3c7; border: 2px solid #f59e0b;">
              <td style="padding: 15px; font-weight: 700; color: #92400e;">${selectedVariant.quotationData?.emi_years || 5} Years EMI (${(selectedVariant.quotationData?.emi_years || 5) * 12} Months)</td>
              <td style="padding: 15px; text-align: right; font-weight: 700; font-size: 18px; color: #92400e;">₹${Math.round(selectedVariant.quotationData?.monthly_emi || 0).toLocaleString('en-IN')}/month</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <div style="text-align: center; color: #64748b; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>ASW WHEEL CARS AND FINANCE</strong></p>
            <p style="margin: 5px 0;">GB 60, Ground floor, High Street Mall, Kapurbawdi, Thane West, Thane-400607</p>
            <p style="margin: 5px 0;">Contact: +91 99878 28417 (Shailendra) | Email: asw.cars@gmail.com</p>
            <p style="margin: 5px 0;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(printContainer);
      
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(printContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `ASW_Quotation_${selectedVariant.modelName.replace(/\s+/g, '_')}_${selectedVariant.bankName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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
      const worksheetData = [
        ['ASW WHEEL CARS AND FINANCE'],
        ['Car Quotation Invoice'],
        [''],
        ['Car Model:', selectedVariant.modelName],
        ['Bank:', selectedVariant.bankName],
        ['ROI:', selectedVariant.roi],
        ['Date:', new Date().toLocaleDateString('en-IN')],
        ['Invoice ID:', `ASW-${Date.now()}`],
        [''],
        ['Description', 'Amount (₹)'],
        ['Cost of vehicle Ex-Showroom', quotationData?.ex_showroom || selectedVariant.price.replace('₹', '').replace(/,/g, '')],
        ['TCS', quotationData?.tcs || 0],
        ['Registration', quotationData?.registration || 39500],
        ['Insurance', quotationData?.insurance || 39500],
        ['Number Plate + CRTM + Autocard', quotationData?.number_plate_crtm_autocard || 4500],
        ['GPS', quotationData?.gps || 18500],
        ['Fastag', quotationData?.fastag || 600],
        ['Speed Governor', quotationData?.speed_governor || 0],
        ['Accessories', quotationData?.accessories || 0],
        ['On the Road Price', quotationData?.on_the_road || 1211105],
        ['Loan Amount', quotationData?.loan_amount || 1010000],
        ['Process Fee', quotationData?.process_fee || 16500],
        ['Stamp Duty', quotationData?.stamp_duty || 6500],
        ['Handling & Document Charges', quotationData?.handling_document_charge || 30300],
        ['Offers', quotationData?.offers || 100],
        ['Final Down Payment', quotationData?.final_down_payment || selectedVariant.downPayment.replace('₹', '').replace(/,/g, '')],
        [`${quotationData?.emi_years || 5} Years EMI`, Math.round(quotationData?.monthly_emi || 0)],
        [''],
        ['Generated on:', new Date().toLocaleString('en-IN')]
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
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
        </div>
        
        <div className="invoice-section">
          <div className="invoice-header">
            <h2>ASW WHEEL CARS AND FINANCE</h2>
          </div>
          
          <div className="bank-selection">
            <h3>Select Financing Option:</h3>
            <div className="bank-buttons">
              <button 
                className={`bank-button ${selectedBank.name === bankOptions['SBI'].name ? 'active' : ''}`} 
                onClick={() => handleBankSelect('SBI')}
              >
                SBI Bank
              </button>
              <button 
                className={`bank-button ${selectedBank.name === bankOptions['AU'].name ? 'active' : ''}`} 
                onClick={() => handleBankSelect('AU')}
              >
                AU Bank
              </button>
              <button 
                className={`bank-button ${selectedBank.name === bankOptions['Union'].name ? 'active' : ''}`} 
                onClick={() => handleBankSelect('Union')}
              >
                Union Bank
              </button>
              <button 
                className={`bank-button ${selectedBank.name === bankOptions['IndusInd'].name ? 'active' : ''}`} 
                onClick={() => handleBankSelect('IndusInd')}
              >
                IndusInd Bank
              </button>
            </div>
          </div>
          
          <div className="invoice-content" ref={invoiceRef}>
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
                <tr>
                  <td>TCS</td>
                  <td>₹{selectedVariant.quotationData?.tcs?.toLocaleString('en-IN') || '0'}</td>
                </tr>
                <tr>
                  <td>Registration</td>
                  <td>₹{selectedVariant.quotationData?.registration?.toLocaleString('en-IN') || '39,500'}</td>
                </tr>
                <tr>
                  <td>Insurance</td>
                  <td>₹{selectedVariant.quotationData?.insurance?.toLocaleString('en-IN') || '39,500'}</td>
                </tr>
                <tr>
                  <td>NO Plate + CRTM + Autocard</td>
                  <td>₹{selectedVariant.quotationData?.number_plate_crtm_autocard?.toLocaleString('en-IN') || '4,500'}</td>
                </tr>
                <tr>
                  <td>GPS</td>
                  <td>₹{selectedVariant.quotationData?.gps?.toLocaleString('en-IN') || '18,500'}</td>
                </tr>
                <tr>
                  <td>Fastag</td>
                  <td>₹{selectedVariant.quotationData?.fastag?.toLocaleString('en-IN') || '600'}</td>
                </tr>
                <tr>
                  <td>Speed Governor</td>
                  <td>₹{selectedVariant.quotationData?.speed_governor?.toLocaleString('en-IN') || '0'}</td>
                </tr>
                <tr>
                  <td>Accessories</td>
                  <td>₹{selectedVariant.quotationData?.accessories?.toLocaleString('en-IN') || '0'}</td>
                </tr>
                <tr className="on-road-row">
                  <td>On the road</td>
                  <td>₹{selectedVariant.quotationData?.on_the_road?.toLocaleString('en-IN') || '12,11,105'}</td>
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
                <tr>
                  <td>Loan Suraksha Insurance</td>
                  <td>₹{selectedVariant.quotationData?.loan_suraksha_insurance?.toLocaleString('en-IN') || '0'}</td>
                </tr>
                <tr>
                  <td>Down Payment</td>
                  <td>₹{selectedVariant.quotationData?.down_payment?.toLocaleString('en-IN') || selectedVariant.downPayment}</td>
                </tr>
                <tr className="offers-row">
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
          
          {/* Download Section - Moved to end of invoice */}
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
              
              <button 
                className="download-button excel-button"
                onClick={downloadAsExcel}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="download-spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="download-icon">📊</span>
                    Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="car-variants-section">
        <h3>More Variants</h3>
        <div className="car-variants-grid">
          {variants.map(variant => (
            <div 
              key={variant.id}
              className={`variant-card ${selectedVariant.id === variant.id ? 'active' : ''}`}
              onClick={() => handleVariantSelect(variant)}
            >
              <div className="variant-image-container">
                <img src={variant.image} alt={variant.name} />
              </div>
              <div className="variant-details">
                <h4>{variant.name}</h4>
                <p>EMI: {variant.monthlyPayment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarDetailWithInvoices; 