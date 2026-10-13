import jsPDF from 'jspdf';
import { VeloxReceiptData } from '../services/veloxReceiptService';
import { numberToIndianWords } from './numberToWords';

/**
 * Format currency with Indian comma system without Unicode symbols that break in jsPDF
 */
const formatIndianAmount = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  let result = '';
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    result = intPart;
  }

  return `${isNegative ? '-' : ''}${result}.${decPart}`;
};

/**
 * Load image as Base64 with canvas rendering
 */
const loadImageAsBase64 = (imagePath: string): Promise<{ dataURL: string; aspectRatio: number } | null> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            const aspectRatio = canvas.width / canvas.height;
            resolve({ dataURL, aspectRatio });
          } else {
            resolve(null);
          }
        } catch (e) {
          console.warn('Canvas conversion error:', e);
          resolve(null);
        }
      };
      img.onerror = () => {
        console.warn('Image load error for:', imagePath);
        resolve(null);
      };
      img.src = imagePath;
    } catch (e) {
      resolve(null);
    }
  });
};

/**
 * Generates an exact replica of the Velox Motors Pvt Ltd Receipt in A4 Landscape
 */
export const generateVeloxReceiptPDF = async (receipt: VeloxReceiptData) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const leftMargin = 22;
  const rightMargin = 275;
  const tableWidth = rightMargin - leftMargin; // 253mm

  let y = 26;

  // ===== TOP TITLE =====
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(20, 20, 20);
  pdf.text('RECEIPT', 148.5, y, { align: 'center' });

  // Top Right Release Code
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(80, 80, 80);
  pdf.text(receipt.rel_version || 'Rel 2.0.12', rightMargin, y + 5, { align: 'right' });

  y += 11;

  // ===== TWO-COLUMN HEADER METADATA =====
  const leftColLabelX = leftMargin;
  const leftColColonX = leftMargin + 26;
  const leftColValX = leftMargin + 29;

  const rightColLabelX = 162;
  const rightColColonX = 194;
  const rightColValX = 197;

  const lineHeight = 4.8;
  pdf.setFontSize(8.5);

  // Row 1: Receipt No. & Receipt Date
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('Receipt No.', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.receipt_no || '', leftColValX, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Receipt Date', rightColLabelX, y);
  pdf.text(':', rightColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.receipt_date || '', rightColValX, y);

  y += lineHeight;

  // Row 2: Name & Customer ID
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.text(receipt.name || '', leftColValX, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer ID', rightColLabelX, y);
  pdf.text(':', rightColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.customer_id || '', rightColValX, y);

  y += lineHeight;

  // Row 3: Address & Receipt Amount
  pdf.setFont('helvetica', 'bold');
  pdf.text('Address', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Receipt Amount', rightColLabelX, y);
  pdf.text(':', rightColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatIndianAmount(receipt.receipt_amount || receipt.total_amount), rightColValX, y);

  // Address lines on left
  pdf.setFont('helvetica', 'normal');
  const addressLines = pdf.splitTextToSize(receipt.address || '', 100);
  let addrY = y;
  addressLines.forEach((line: string) => {
    pdf.text(line, leftColValX, addrY);
    addrY += 4.2;
  });

  // Hypothecated To & Financer Name on right
  let rightY = y + lineHeight;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hypothecated To', rightColLabelX, rightY);
  pdf.text(':', rightColColonX, rightY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.hypothecated_to || 'HDFC BANK LTD.', rightColValX, rightY);

  rightY += lineHeight;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Financer Name', rightColLabelX, rightY);
  pdf.text(':', rightColColonX, rightY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.financer_name || 'HDFC BANK LTD.', rightColValX, rightY);

  // Advance y to after address and right block
  y = Math.max(addrY, rightY + lineHeight) + 1;

  // Remarks Row
  pdf.setFont('helvetica', 'bold');
  pdf.text('Remarks', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.setFont('helvetica', 'normal');
  const remarksLines = pdf.splitTextToSize(receipt.remarks || '', 200);
  remarksLines.forEach((line: string) => {
    pdf.text(line, leftColValX, y);
    y += 4.2;
  });
  y += 1;

  // Order/Inv No.
  pdf.setFont('helvetica', 'bold');
  pdf.text('Order/Inv No.', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.order_inv_no || '', leftColValX, y);
  y += lineHeight;

  // Model
  pdf.setFont('helvetica', 'bold');
  pdf.text('Model', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.model || '', leftColValX, y);
  y += lineHeight;

  // TL Name
  pdf.setFont('helvetica', 'bold');
  pdf.text('TL Name', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.tl_name || '', leftColValX, y);
  y += lineHeight;

  // DSE Name
  pdf.setFont('helvetica', 'bold');
  pdf.text('DSE Name', leftColLabelX, y);
  pdf.text(':', leftColColonX, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(receipt.dse_name || '', leftColValX, y);
  y += 7;

  // ===== TABLE SECTION =====
  // Columns definition:
  // Srl.(12) | Mode(24) | DD/CC/CHQ No.(35) | Date(25) | Favouring(35) | Drawn On(26) | Deposit Bank Name(55) | Amount(41)
  const cols = [
    { name: 'Srl.', x: leftMargin, w: 12, align: 'left' },
    { name: 'Mode', x: leftMargin + 12, w: 24, align: 'left' },
    { name: 'DD/CC/CHQ No.', x: leftMargin + 36, w: 35, align: 'left' },
    { name: 'Date', x: leftMargin + 71, w: 25, align: 'left' },
    { name: 'Favouring', x: leftMargin + 96, w: 35, align: 'left' },
    { name: 'Drawn On', x: leftMargin + 131, w: 26, align: 'left' },
    { name: 'Deposit Bank Name', x: leftMargin + 157, w: 56, align: 'left' },
    { name: 'Amount', x: rightMargin, w: 40, align: 'right' }
  ];

  // Top border of table
  pdf.setDrawColor(40, 40, 40);
  pdf.setLineWidth(0.3);
  pdf.line(leftMargin, y, rightMargin, y);

  y += 4.5;

  // Header Row
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(20, 20, 20);

  cols.forEach((col) => {
    if (col.align === 'right') {
      pdf.text(col.name, col.x, y, { align: 'right' });
    } else {
      pdf.text(col.name, col.x, y);
    }
  });

  y += 2.5;

  // Bottom border of table header
  pdf.line(leftMargin, y, rightMargin, y);

  y += 5.5;

  // Table Body Rows
  const items = receipt.items && receipt.items.length > 0 ? receipt.items : [
    {
      id: 'item-1',
      srl: 1,
      mode: 'CASH',
      dd_chq_no: '.',
      date: receipt.receipt_date || '09/10/2026',
      favouring: '',
      drawn_on: '.',
      deposit_bank: 'Sbi Bank',
      amount: receipt.total_amount || 60000
    }
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  items.forEach((item, index) => {
    const srlStr = String(item.srl || index + 1);
    pdf.text(srlStr, cols[0].x, y);
    pdf.text(item.mode || 'CASH', cols[1].x, y);
    pdf.text(item.dd_chq_no || '.', cols[2].x, y);
    pdf.text(item.date || receipt.receipt_date || '', cols[3].x, y);
    pdf.text(item.favouring || '', cols[4].x, y);
    pdf.text(item.drawn_on || '.', cols[5].x, y);
    pdf.text(item.deposit_bank || 'Sbi Bank', cols[6].x, y);
    pdf.text(formatIndianAmount(item.amount), cols[7].x, y, { align: 'right' });

    y += 5.5;
  });

  // Thin line below table items
  pdf.line(leftMargin, y, rightMargin, y);

  y += 4.5;

  // Total Row
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total', leftMargin, y);
  pdf.text(':', leftMargin + 26, y);
  pdf.text(formatIndianAmount(receipt.total_amount || receipt.receipt_amount), rightMargin, y, { align: 'right' });

  y += 2.5;

  // Line below Total
  pdf.line(leftMargin, y, rightMargin, y);

  y += 5.5;

  // Amount in words
  pdf.setFont('helvetica', 'bold');
  pdf.text('Amount in words', leftMargin, y);
  pdf.text(':', leftMargin + 26, y);
  const words = receipt.amount_in_words || numberToIndianWords(receipt.total_amount || receipt.receipt_amount);
  pdf.text(words, leftMargin + 29, y);

  y += 5.5;

  // Terms and Conditions
  pdf.setFont('helvetica', 'bold');
  pdf.text('Terms and Conditions', leftMargin, y);

  // ===== SIGNATURE & STAMP BLOCK (BOTTOM RIGHT) =====
  // Matches exact physical receipt alignment:
  // "For VELOX MOTORS PVT LTD" top right
  // Handwriting signature in the middle gap
  // "(Authorized Signatory)" under signature
  // Violet rubber stamp overlapping right side of "(Authorized Signatory)"
  const signTopY = Math.max(y - 1, 155);
  const forVeloxX = 222;
  const signatoryX = 226;
  const signatoryY = signTopY + 20;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(20, 20, 20);
  pdf.text('For VELOX MOTORS PVT LTD', forVeloxX, signTopY);

  // Add Velox Official Stamp & Signature Image (scanned from attached original document)
  try {
    const stampImg = await loadImageAsBase64('/Website-Images/velox_official_stamp.png');
    if (stampImg && stampImg.dataURL) {
      const stampWidth = 47; // 47mm
      const stampHeight = stampWidth / (stampImg.aspectRatio || 1.354); // ~34.7mm
      const stampImgX = 226;
      const stampImgY = signTopY - 2;

      pdf.addImage(stampImg.dataURL, 'PNG', stampImgX, stampImgY, stampWidth, stampHeight);
    } else {
      // Fallback vector stamp if image fails
      pdf.setDrawColor(75, 55, 128); // Violet stamp color
      pdf.setLineWidth(0.6);
      pdf.circle(252, signTopY + 16, 14);
      pdf.circle(252, signTopY + 16, 12.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(75, 55, 128);
      pdf.text('VELOX MOTORS PVT LTD', 252, signTopY + 13, { align: 'center' });
      pdf.text('* MUMBAI *', 252, signTopY + 19, { align: 'center' });
    }
  } catch (err) {
    console.warn('Could not load velox stamp image:', err);
  }

  // Authorized Signatory Label
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(25, 25, 25);
  pdf.text('(Authorized Signatory)', signatoryX, signatoryY);

  // Save the PDF
  const safeReceiptNo = (receipt.receipt_no || 'REC').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Velox_Receipt_${safeReceiptNo}.pdf`;
  pdf.save(fileName);
};
