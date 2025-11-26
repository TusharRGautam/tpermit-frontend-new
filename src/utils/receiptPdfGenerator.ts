import jsPDF from 'jspdf';

interface ReceiptData {
  receiptNumber: string;
  receiptDate: string;
  customerName: string;
  customerAddress: string;
  remarks?: string;
  carModel: string;
  variant?: string;
  salesExecutiveName: string;
  receiptAmount: string;
  hypothecatedTo?: string;
  paymentMode: string;
  mobileNumber: string;
}

// Direct currency formatting to avoid encoding issues with jsPDF
const formatCurrencyForPDF = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  // Use manual formatting instead of toLocaleString to avoid jsPDF encoding issues
  const formatted = numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formatted;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Convert number to words for Indian currency
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanThousand(n % 100) : '');
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (remainder > 0) result += convertLessThanThousand(remainder);

  return result.trim();
};

const amountInWords = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const rupees = Math.floor(numAmount);
  const paise = Math.round((numAmount - rupees) * 100);

  let words = numberToWords(rupees) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + numberToWords(paise) + ' Paise';
  }
  return words + ' Only';
};

// Helper function to load image as base64 with aspect ratio info
const loadImageAsBase64 = (imagePath: string): Promise<{dataURL: string, aspectRatio: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // Use PNG format to preserve transparency
        const dataURL = canvas.toDataURL('image/png');
        const aspectRatio = img.width / img.height;
        resolve({ dataURL, aspectRatio });
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imagePath;
  });
};

export const generateReceiptPDF = async (receipt: ReceiptData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const lightGray = [236, 240, 241];
  const borderColor = [189, 195, 199];

  // Add border to entire page
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // ===== HEADER SECTION =====
  // Try to add logo image
  try {
    const logoImg = await loadImageAsBase64('/Website-Images/L3.png');
    // Add logo at top left corner
    const logoHeight = 15; // Height in mm
    const logoWidth = logoHeight * logoImg.aspectRatio; // Maintain aspect ratio
    pdf.addImage(logoImg.dataURL, 'PNG', 15, yPosition - 3, logoWidth, logoHeight);

    // Adjust text position to accommodate logo
    const textStartX = 15 + logoWidth + 5; // Logo width + margin

    // Company Name next to logo
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('GAUTAM MOTORS', textStartX, yPosition + 5);

    // Receipt Number (right side)
    pdf.setFontSize(12);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`Receipt #${receipt.receiptNumber}`, pageWidth - 15, yPosition, { align: 'right' });

    yPosition += 8;

    // Company Address
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Diva, Thane – 400612', textStartX, yPosition + 5);

    // Receipt Date (right side)
    pdf.text(formatDate(receipt.receiptDate), pageWidth - 15, yPosition + 5, { align: 'right' });

    yPosition += 8;
  } catch (error) {
    console.error('Error loading logo image:', error);
    // Fallback: original design without logo
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('GAUTAM MOTORS', 15, yPosition);

    // Receipt Number (right side)
    pdf.setFontSize(12);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(`Receipt #${receipt.receiptNumber}`, pageWidth - 15, yPosition, { align: 'right' });

    yPosition += 8;

    // Company Address
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Diva, Thane – 400612', 15, yPosition);

    // Receipt Date (right side)
    pdf.text(formatDate(receipt.receiptDate), pageWidth - 15, yPosition, { align: 'right' });

    yPosition += 3;
  }

  // Horizontal line below header
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.8);
  pdf.line(15, yPosition, pageWidth - 15, yPosition);

  yPosition += 10;

  // ===== RECEIPT TITLE =====
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('PAYMENT RECEIPT', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;

  // ===== CUSTOMER DETAILS BOX =====
  const boxY = yPosition;
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.roundedRect(15, boxY, pageWidth - 30, 38, 2, 2, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  yPosition += 8;
  pdf.text('Customer Details:', 20, yPosition);

  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Name: ${receipt.customerName}`, 20, yPosition);

  yPosition += 7;
  pdf.text(`Address: ${receipt.customerAddress}`, 20, yPosition);

  yPosition += 7;
  pdf.text(`Mobile: ${receipt.mobileNumber}`, 20, yPosition);

  yPosition += 12;

  // ===== PAYMENT DETAILS =====
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('Payment Details', 15, yPosition);

  yPosition += 9;

  // Table header
  const leftCol = 20;
  const rightCol = 110;
  const lineHeight = 8;

  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.setLineWidth(0.3);

  // Helper function to add detail row
  const addDetailRow = (label: string, value: string, isBold = false) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, leftCol, yPosition);

    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text(value, rightCol, yPosition);

    // Add line separator
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.2);
    pdf.line(leftCol, yPosition + 2, pageWidth - 20, yPosition + 2);

    yPosition += lineHeight;
  };

  addDetailRow('Car Model:', receipt.carModel);

  if (receipt.variant) {
    addDetailRow('Variant:', receipt.variant);
  }

  addDetailRow('Sales Executive:', receipt.salesExecutiveName);
  addDetailRow('Payment Mode:', receipt.paymentMode);

  if (receipt.hypothecatedTo) {
    addDetailRow('Hypothecated To:', receipt.hypothecatedTo);
  }

  yPosition += 5;

  // Amount section with highlight
  pdf.setFillColor(255, 248, 225);
  pdf.roundedRect(15, yPosition - 3, pageWidth - 30, 18, 2, 2, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('Amount Received:', leftCol, yPosition + 7);

  // Format amount - use Rs instead of rupee symbol to avoid encoding issues
  const numAmount = typeof receipt.receiptAmount === 'string'
    ? parseFloat(receipt.receiptAmount)
    : receipt.receiptAmount;
  const amountValue = numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedAmount = 'Rs. ' + amountValue;

  pdf.setFontSize(16);
  pdf.setTextColor(0, 128, 0); // Green color
  pdf.text(formattedAmount, rightCol, yPosition + 7);

  yPosition += 22;

  // Amount in words
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text('In Words:', leftCol, yPosition);

  yPosition += 6;
  const words = amountInWords(receipt.receiptAmount);
  const splitWords = pdf.splitTextToSize(words, pageWidth - 40);
  pdf.setFontSize(10);
  pdf.text(splitWords, leftCol, yPosition);

  yPosition += splitWords.length * 6 + 8;

  // Remarks (if any)
  if (receipt.remarks) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.text('Remarks:', leftCol, yPosition);

    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const splitRemarks = pdf.splitTextToSize(receipt.remarks, pageWidth - 40);
    pdf.text(splitRemarks, leftCol, yPosition);

    yPosition += splitRemarks.length * 6 + 8;
  }

  // ===== FOOTER SECTION =====
  const footerY = pageHeight - 55;

  // Thank you message
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  // Authorized Signatory section (bottom right)
  const sigX = pageWidth - 50; // Center X position for signature area
  const sigY = footerY + 10;

  // "For GAUTAM MOTORS" text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text('For GAUTAM MOTORS', sigX, sigY, { align: 'center' });

  // Try to add signature and stamp image
  try {
    const signStampImg = await loadImageAsBase64('/Website-Images/signandstamp.png');
    // Add signature image centered below "For GAUTAM MOTORS"
    // Calculate dimensions maintaining aspect ratio
    const maxWidth = 65; // Maximum width in mm
    const maxHeight = 55; // Maximum height in mm

    let imgWidth = maxWidth;
    let imgHeight = maxWidth / signStampImg.aspectRatio;

    // If height exceeds max, scale down based on height
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = maxHeight * signStampImg.aspectRatio;
    }

    const imgX = sigX - (imgWidth / 2); // Center the image horizontally
    pdf.addImage(signStampImg.dataURL, 'PNG', imgX, sigY - 15, imgWidth, imgHeight);
  } catch (error) {
    console.error('Error loading signature image:', error);
    // Fallback: just add a line for signature
    pdf.line(sigX - 20, sigY + 18, sigX + 20, sigY + 18);
  }

  // "Authorized Signatory" text below the signature
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Authorized Signatory', sigX, sigY + 30, { align: 'center' });

  // Footer note
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('This is a computer-generated receipt.', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save PDF
  const fileName = `Receipt_${receipt.receiptNumber}_${receipt.customerName.replace(/\s+/g, '_')}.pdf`;
  pdf.save(fileName);
};
