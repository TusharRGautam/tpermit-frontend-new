import jsPDF from 'jspdf';

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
  created_at: string;
  updated_at: string;
}

const getSelectedBank = (quotation: QuotationData) => {
  if (quotation.sbi_bank > 0) return { name: 'State Bank of India', rate: quotation.sbi_bank };
  if (quotation.union_bank > 0) return { name: 'Union Bank', rate: quotation.union_bank };
  if (quotation.mahindra_finance > 0) return { name: 'Mahindra Finance', rate: quotation.mahindra_finance };
  if (quotation.cholamandalam_bank > 0) return { name: 'Cholamandalam Bank', rate: quotation.cholamandalam_bank };
  if (quotation.au_bank > 0) return { name: 'AU Bank', rate: quotation.au_bank };
  return { name: 'None', rate: 0 };
};

const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const generateQuotationPDF = (quotation: QuotationData) => {
  const pdf = new jsPDF();
  const selectedBank = getSelectedBank(quotation);

  // Page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 15;

  // Colors
  const headerColor = [144, 238, 144]; // Light green
  const bankHeaderColor = [173, 216, 230]; // Light blue
  const highlightColor = [255, 255, 153]; // Light yellow
  const textColor = [0, 0, 0];

  // Helper function to add a row with background color
  const addRow = (label: string, value: string, y: number, bgColor?: number[], isHighlight: boolean = false) => {
    const leftX = 15;
    const rightX = pageWidth / 2 + 5;
    const rowHeight = 8;

    // Background for left cell (label)
    if (bgColor) {
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(leftX, y - 5, pageWidth / 2 - 10, rowHeight, 'F');
    }

    // Background for right cell (value)
    if (isHighlight) {
      pdf.setFillColor(highlightColor[0], highlightColor[1], highlightColor[2]);
      pdf.rect(rightX, y - 5, pageWidth / 2 - 10, rowHeight, 'F');
    } else if (bgColor) {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(rightX, y - 5, pageWidth / 2 - 10, rowHeight, 'F');
    }

    // Borders
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(leftX, y - 5, pageWidth / 2 - 10, rowHeight);
    pdf.rect(rightX, y - 5, pageWidth / 2 - 10, rowHeight);

    // Text
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(10);
    pdf.text(label, leftX + 2, y);
    pdf.text(value, rightX + 2, y);
  };

  // Header - Car Model
  pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 10);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('car model :', 20, yPosition);
  pdf.text(`${quotation.car_model.toUpperCase()} ${quotation.model_variant.toUpperCase()}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 12;

  // Bank Header
  pdf.setFillColor(bankHeaderColor[0], bankHeaderColor[1], bankHeaderColor[2]);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
  pdf.rect(15, yPosition - 5, pageWidth - 30, 8);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(selectedBank.name, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 10;

  // ROI Header
  pdf.setFillColor(bankHeaderColor[0], bankHeaderColor[1], bankHeaderColor[2]);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
  pdf.rect(15, yPosition - 5, pageWidth - 30, 8);
  pdf.text(`ROI ${quotation.roi_emi_interest}%`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 10;

  // Cost breakdown
  addRow('Cost of the vehicle EX Showroom', formatCurrency(quotation.ex_showroom), yPosition);
  yPosition += 8;

  addRow('Registration', formatCurrency(quotation.registration), yPosition);
  yPosition += 8;

  addRow('Insurance', formatCurrency(quotation.insurance), yPosition);
  yPosition += 8;

  addRow('GPS', formatCurrency(quotation.gps), yPosition);
  yPosition += 8;

  addRow('Speed Governor', formatCurrency(quotation.speed_governor), yPosition);
  yPosition += 8;

  // On the road - highlighted
  addRow('On the road', formatCurrency(quotation.on_the_road), yPosition, undefined, true);
  yPosition += 10;

  // Loan details
  addRow('Loan Amount', formatCurrency(quotation.loan_amount), yPosition);
  yPosition += 8;

  addRow('Margin (Down payment)', formatCurrency(quotation.margin_down_payment), yPosition);
  yPosition += 8;

  addRow('Process fee', formatCurrency(quotation.process_fee), yPosition);
  yPosition += 8;

  addRow('Stamp duty', formatCurrency(quotation.stamp_duty), yPosition);
  yPosition += 8;

  addRow('Handling Loan Services and Document Charge', formatCurrency(quotation.handling_document_charge), yPosition);
  yPosition += 8;

  // Down Payment - highlighted
  addRow('Down Payment', formatCurrency(quotation.down_payment), yPosition, undefined, true);
  yPosition += 10;

  // Offers - highlighted
  addRow('Offers', formatCurrency(quotation.offers), yPosition, undefined, true);
  yPosition += 10;

  // Final Down Payment - highlighted
  addRow('Final Down Payment', formatCurrency(quotation.final_down_payment), yPosition, undefined, true);
  yPosition += 10;

  // EMI details
  if (quotation.emi_years > 0 && quotation.monthly_emi > 0) {
    addRow(`${quotation.emi_years} years (${quotation.emi_years * 12} Months)`, formatCurrency(quotation.monthly_emi), yPosition, bankHeaderColor);
  }

  // Save the PDF
  const fileName = `Quotation_${quotation.car_model.replace(/\s+/g, '_')}_${quotation.vendor_id}.pdf`;
  pdf.save(fileName);
};
