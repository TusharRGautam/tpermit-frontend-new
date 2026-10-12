import jsPDF from 'jspdf';

export interface QuotationData {
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
  created_at?: string;
  updated_at?: string;
}

const getSelectedBank = (quotation: QuotationData) => {
  if (quotation.sbi_bank > 0) return { name: 'State Bank of India (SBI)', rate: quotation.sbi_bank };
  if (quotation.union_bank > 0) return { name: 'Union Bank of India', rate: quotation.union_bank };
  if (quotation.mahindra_finance > 0) return { name: 'Mahindra Finance', rate: quotation.mahindra_finance };
  if (quotation.cholamandalam_bank > 0) return { name: 'Cholamandalam Bank', rate: quotation.cholamandalam_bank };
  if (quotation.au_bank > 0) return { name: 'AU Small Finance Bank', rate: quotation.au_bank };
  return { name: 'Direct / Outright Purchase', rate: 0 };
};

/**
 * Format currency with Indian comma system without Unicode symbols that break in jsPDF.
 * Replaces '₹' with 'Rs. ' to prevent the '¹' superscript encoding bug in jsPDF standard fonts.
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return 'Rs. 0';
  const num = Math.round(typeof amount === 'string' ? parseFloat(amount) || 0 : amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const str = absNum.toString();
  let result = '';

  if (str.length > 3) {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    result = str;
  }

  return `${isNegative ? '- ' : ''}Rs. ${result}`;
};

export const generateQuotationPDF = (quotation: QuotationData) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const selectedBank = getSelectedBank(quotation);

  // Exact A4 dimensions in mm
  const pageWidth = 210;
  const leftX = 15;
  const tableWidth = 180; // 15 to 195 (leaving 15mm on both left and right)
  const labelWidth = 112;
  const valueWidth = 68;
  const rightX = leftX + labelWidth; // 15 + 112 = 127
  const rowHeight = 7.4; // Clean row height

  // Professional Color Palette
  const headerGreen = [209, 250, 229]; // Clean mint green #d1fae5
  const headerGreenBorder = [110, 231, 183];
  const bankBlue = [224, 242, 254]; // Soft sky blue #e0f2fe
  const highlightYellow = [254, 249, 195]; // Soft cream yellow #fef9c3
  const zebraBg = [248, 250, 252]; // Slate 50
  const borderColor = [226, 232, 240]; // Slate 200

  let yPosition = 16;

  // --- TOP CORPORATE HEADER ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(15, 23, 42);
  pdf.text('GAUTAM MOTORS', leftX, yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Commercial Vehicle Fleet Sales & T-Permit Financing', leftX, yPosition + 4.5);

  // Right-aligned Quotation Meta
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text('OFFICIAL VEHICLE QUOTATION', leftX + tableWidth, yPosition, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Ref: ${quotation.vendor_id}`, leftX + tableWidth, yPosition + 4.5, { align: 'right' });

  const dateStr = quotation.created_at ? new Date(quotation.created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  pdf.text(`Date: ${dateStr}`, leftX + tableWidth, yPosition + 8.5, { align: 'right' });

  yPosition += 13;

  // --- HEADER ROW 1: CAR MODEL ---
  pdf.setFillColor(headerGreen[0], headerGreen[1], headerGreen[2]);
  pdf.rect(leftX, yPosition, tableWidth, 8.5, 'F');
  pdf.setDrawColor(headerGreenBorder[0], headerGreenBorder[1], headerGreenBorder[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(leftX, yPosition, tableWidth, 8.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(6, 95, 70);
  pdf.text('car model :', leftX + 4, yPosition + 5.5);

  const carModelText = `${(quotation.car_model || '').toUpperCase()} ${(quotation.model_variant || '').toUpperCase()}`;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(6, 78, 59);
  pdf.text(carModelText, leftX + tableWidth - 4, yPosition + 5.5, { align: 'right' });

  yPosition += 8.5;

  // --- HEADER ROW 2: BANK & FINANCING ---
  pdf.setFillColor(bankBlue[0], bankBlue[1], bankBlue[2]);
  pdf.rect(leftX, yPosition, tableWidth, 7.5, 'F');
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.rect(leftX, yPosition, tableWidth, 7.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(3, 105, 161);
  pdf.text('Financing Partner:', leftX + 4, yPosition + 5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(7, 89, 133);
  pdf.text(selectedBank.name, leftX + tableWidth - 4, yPosition + 5, { align: 'right' });

  yPosition += 7.5;

  // --- HEADER ROW 3: RATE OF INTEREST (ROI) ---
  pdf.setFillColor(bankBlue[0], bankBlue[1], bankBlue[2]);
  pdf.rect(leftX, yPosition, tableWidth, 7.5, 'F');
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.rect(leftX, yPosition, tableWidth, 7.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(3, 105, 161);
  pdf.text('Applicable Rate of Interest:', leftX + 4, yPosition + 5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(7, 89, 133);
  pdf.text(`ROI ${quotation.roi_emi_interest || 0}%`, leftX + tableWidth - 4, yPosition + 5, { align: 'right' });

  yPosition += 7.5;

  // --- HELPER FUNCTION TO DRAW TABLE ROWS WITH PROPER ALIGNMENT ---
  const addRow = (
    label: string,
    value: string,
    bgColor?: number[],
    isHighlight: boolean = false,
    isBold: boolean = false
  ) => {
    // Fill backgrounds
    if (isHighlight) {
      // Highlight row (e.g. On the road, Down Payment, Final Down Payment)
      pdf.setFillColor(highlightYellow[0], highlightYellow[1], highlightYellow[2]);
      pdf.rect(leftX, yPosition, labelWidth, rowHeight, 'F');
      pdf.rect(rightX, yPosition, valueWidth, rowHeight, 'F');
    } else if (bgColor) {
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(leftX, yPosition, labelWidth, rowHeight, 'F');
      pdf.rect(rightX, yPosition, valueWidth, rowHeight, 'F');
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(leftX, yPosition, labelWidth, rowHeight, 'F');
      pdf.rect(rightX, yPosition, valueWidth, rowHeight, 'F');
    }

    // Grid Borders
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.setLineWidth(0.2);
    pdf.rect(leftX, yPosition, labelWidth, rowHeight);
    pdf.rect(rightX, yPosition, valueWidth, rowHeight);

    // Left Cell Text (Description)
    pdf.setTextColor(isHighlight ? 15 : 51, isHighlight ? 23 : 65, isHighlight ? 42 : 85);
    pdf.setFontSize(isHighlight ? 9.5 : 9);
    pdf.setFont('helvetica', isBold || isHighlight ? 'bold' : 'normal');
    pdf.text(label, leftX + 4, yPosition + 4.9);

    // Right Cell Text (Amount - STRICTLY RIGHT ALIGNED)
    pdf.setTextColor(isHighlight ? 15 : 15, isHighlight ? 23 : 23, isHighlight ? 42 : 42);
    pdf.setFontSize(isHighlight ? 9.5 : 9);
    pdf.setFont('helvetica', isBold || isHighlight ? 'bold' : 'normal');
    pdf.text(value, rightX + valueWidth - 4, yPosition + 4.9, { align: 'right' });

    yPosition += rowHeight;
  };

  // --- SECTION 1: COST BREAKDOWN ---
  addRow('Cost of the vehicle EX Showroom', formatCurrency(quotation.ex_showroom));

  if (quotation.tcs > 0) {
    addRow('TCS (1%)', formatCurrency(quotation.tcs));
  }

  addRow('Registration', formatCurrency(quotation.registration));
  addRow('Insurance', formatCurrency(quotation.insurance));

  if (quotation.number_plate_crtm_autocard > 0) {
    addRow('Number Plate + CRTM + Autocard', formatCurrency(quotation.number_plate_crtm_autocard));
  }

  addRow('GPS', formatCurrency(quotation.gps));

  if (quotation.fastag > 0) {
    addRow('Fastag', formatCurrency(quotation.fastag));
  }

  addRow('Speed Governor', formatCurrency(quotation.speed_governor));

  if (quotation.accessories > 0) {
    addRow('Accessories', formatCurrency(quotation.accessories));
  }

  // On the Road (Highlighted)
  addRow('On the road', formatCurrency(quotation.on_the_road), undefined, true, true);

  // --- SECTION 2: LOAN & DOWN PAYMENT BREAKDOWN ---
  addRow('Loan Amount', formatCurrency(quotation.loan_amount));
  addRow('Margin (Down payment)', formatCurrency(quotation.margin_down_payment));
  addRow('Process fee', formatCurrency(quotation.process_fee));
  addRow('Stamp duty', formatCurrency(quotation.stamp_duty));
  addRow('Handling Loan Services and Document Charge', formatCurrency(quotation.handling_document_charge));

  if (quotation.loan_suraksha_insurance > 0) {
    addRow('Loan Suraksha / Insurance', formatCurrency(quotation.loan_suraksha_insurance));
  }

  // Down Payment (Highlighted)
  addRow('Down Payment', formatCurrency(quotation.down_payment), undefined, true, true);

  // Offers (Highlighted)
  addRow('Offers', formatCurrency(quotation.offers), undefined, true, true);

  // Final Down Payment (Highlighted)
  addRow('Final Down Payment', formatCurrency(quotation.final_down_payment), undefined, true, true);

  // --- SECTION 3: EMI MATRIX ---
  if (quotation.emi_years > 0 && quotation.monthly_emi > 0) {
    const emiLabel = `${quotation.emi_years} years (${quotation.emi_years * 12} Months)`;
    addRow(emiLabel, formatCurrency(quotation.monthly_emi), bankBlue, false, true);
  }

  // --- FOOTER & DISCLAIMER ---
  yPosition += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text('* This is a computer-generated quotation issued by Gautam Motors and is valid for 15 days.', leftX, yPosition);
  pdf.text('Prices and financing schemes are subject to showroom delivery terms and bank loan sanction.', leftX, yPosition + 3.8);

  // Save the PDF with clean file name
  const safeModel = (quotation.car_model || 'Vehicle').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeId = (quotation.vendor_id || 'ID').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Quotation_${safeModel}_${safeId}.pdf`;
  pdf.save(fileName);
};
