import jsPDF from 'jspdf';

interface BookingOrderData {
  orderNumber: string;
  orderDate: string;
  companyName: string;
  toursAndTravelsName: string;
  carModel: string;
  variant?: string;
  color: string;
  rtoPassing: string;
  customerName: string;
  customerAddress: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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

export const generateBookingOrderPDF = async (order: BookingOrderData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 15;

  // Colors - Red header similar to reference
  const redColor = [220, 38, 38];
  const blackColor = [0, 0, 0];
  const grayColor = [100, 100, 100];

  // ===== RED HEADER BAR =====
  pdf.setFillColor(redColor[0], redColor[1], redColor[2]);
  pdf.rect(0, 0, pageWidth, 12, 'F');

  yPosition = 25;

  // ===== LOGO AND COMPANY INFO SECTION =====
  try {
    const logoImg = await loadImageAsBase64('/Website-Images/L3.png');
    // Add logo at top left - increased size significantly
    const logoHeight = 45;
    const logoWidth = logoHeight * logoImg.aspectRatio;
    pdf.addImage(logoImg.dataURL, 'PNG', 15, yPosition - 10, logoWidth, logoHeight);
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Company name and contact info on the right
  const rightStartX = pageWidth - 15;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  pdf.text('Phone:', rightStartX - 60, yPosition + 3);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('+91 8652089525', rightStartX, yPosition + 3, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.text('ADD:', rightStartX - 60, yPosition + 8);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  const addressLines = [
    'Room no 07, Astamangal',
    'Building, Dhartri Nagar, Aagasan',
    'Road Diva East 405612'
  ];
  
  let addressY = yPosition + 8;
  addressLines.forEach(line => {
    pdf.text(line, rightStartX, addressY, { align: 'right' });
    addressY += 4;
  });

  yPosition += 35;

  // Horizontal line
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(10, yPosition, pageWidth - 10, yPosition);

  yPosition += 15;

  // ===== BOOKING ORDER TITLE =====
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  pdf.text('BOOKING ORDER', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // ===== TO SECTION =====
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('TO', 15, yPosition);

  yPosition += 8;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(order.companyName, 15, yPosition);

  yPosition += 10;

  // Tours and Travels Name
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(order.toursAndTravelsName, 15, yPosition);

  yPosition += 10;

  // Booking Car Details
  const carDetails = `Booking Car : ${order.carModel}${order.variant ? ' ' + order.variant : ''} T-PERMIT`;
  pdf.text(carDetails, 15, yPosition);

  yPosition += 7;

  // Color
  pdf.text(`Colour : ${order.color}`, 15, yPosition);

  yPosition += 10;

  // RTO Passing
  pdf.text(`RTO Passing - ${order.rtoPassing}`, 15, yPosition);

  yPosition += 10;

  // Customer Name
  pdf.text(`Customer Name - ${order.customerName}`, 15, yPosition);

  yPosition += 7;

  // Customer Address
  pdf.text('Address - ', 15, yPosition);
  const addressSplit = pdf.splitTextToSize(order.customerAddress, pageWidth - 60);
  pdf.text(addressSplit, 15, yPosition + 7);

  yPosition += addressSplit.length * 7 + 15;

  // ===== FOOTER SECTION with Signature =====
  const footerY = pageHeight - 80;

  // Signature section on the right side
  const sigX = pageWidth - 60;
  const sigY = footerY + 10;

  // Company name for signature - bold and larger
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  pdf.text('Gautam Motors', sigX, sigY, { align: 'center' });

  // Try to add signature and stamp image
  try {
    const signStampImg = await loadImageAsBase64('/Website-Images/signandstamp.png');
    
    const maxWidth = 55;
    const maxHeight = 55;

    let imgWidth = maxWidth;
    let imgHeight = maxWidth / signStampImg.aspectRatio;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = maxHeight * signStampImg.aspectRatio;
    }

    const imgX = sigX - (imgWidth / 2);
    pdf.addImage(signStampImg.dataURL, 'PNG', imgX, sigY - 10, imgWidth, imgHeight);

    // "Authorized signature" text below the stamp - bold and larger, moved up
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('( Authorised signature )', sigX, sigY - 10 + imgHeight - 2, { align: 'center' });
  } catch (error) {
    console.error('Error loading signature image:', error);
    // Fallback: just add text
    pdf.line(sigX - 20, sigY + 20, sigX + 20, sigY + 20);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('( Authorised signature )', sigX, sigY + 25, { align: 'center' });
  }

  // Contact info at bottom - positioned to be below signature
  const contactY = pageHeight - 22;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  
  // Location - left aligned
  const leftX = 20;
  pdf.text('Diva-Thane 400612', leftX, contactY);

  // Phone - center aligned
  const centerText = '+91 8652089525';
  pdf.text(centerText, pageWidth / 2, contactY, { align: 'center' });

  // Email - center aligned below signature (right side)
  pdf.text('gautam.motors18@gmail.com', sigX, contactY, { align: 'center' });

  // Black footer bar at the very bottom
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');

  // Save PDF
  const fileName = `BookingOrder_${order.orderNumber}_${order.customerName.replace(/\s+/g, '_')}.pdf`;
  pdf.save(fileName);
};
