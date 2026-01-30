import jsPDF from 'jspdf';
import { generateModiHyundaiProformaPDF } from './modiHyundaiPdfGenerator';

// Define the interface to match usage
export interface ProformaData {
    companyName?: string;
    name: string;
    address: string;
    contactNo: string;
    email: string;
    model: string;
    registration: string;
    date: string;
    
    exShowroomPrice: string;
    regServiceCharges: string;
    insuranceZeroDep: string;
    extendedWarranty: string;
    accessories: string;
    tcs: string;
    loyaltyCard: string;
    fastagCharges: string;
    consumerOffer: string;
    corporateOffer: string;
    exchangeBonus: string;
    
    bankName: string;
    loanTenure: string;
    costOfVehicle: string;
    loanAmount: string;
    marginMoney: string;
    emi: string;
    financeInsurance: string;
    financeFastag: string;
    ew: string;
    financeRegistration: string;
    financeAccessories: string;
    stampDutyPF: string;
    financeCorporateOffer: string;
    financeMSILOffer: string;
    netDownPayment?: string; 
    
    // New Modi Fields
    hypothecationAmount?: string;
    safetyPackage?: string;
    accPackage?: string;
    hypothecation?: string; // For 'HYP/HPA' text if distinct
}

// Helper to load images
const loadImageAsBase64 = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
             const canvas = document.createElement('canvas');
             canvas.width = img.width;
             canvas.height = img.height;
             const ctx = canvas.getContext('2d');
             if(ctx) {
                 ctx.drawImage(img, 0, 0);
                 resolve(canvas.toDataURL('image/png'));
             } else {
                 reject('No context');
             }
        };
        img.onerror = () => {
            // resolve with empty string to avoid crash, just missing image
            console.warn(`Failed to load image at ${path}`);
            resolve('');
        };
    });
};

export const generateProformaInvoicePDF = async (formData: ProformaData, serialNumber: string = 'PI13000') => {
    // Check for Modi Hyundai
    if (formData.companyName === 'Modi Hyundai Malad') {
        return generateModiHyundaiProformaPDF(formData, serialNumber);
    }

    // Default (Velox Motors) implementation continues below
    // Create PDF with A4 size
    const doc = new jsPDF('p', 'mm', 'a4');
    const width = doc.internal.pageSize.getWidth(); // 210mm
    const height = doc.internal.pageSize.getHeight(); // 297mm
    
    // --- Page Border ---
    // --- Page Border ---
    const borderMargin = 5; // 5mm margin from edge
    // Removed duplicate Serial No from top right
    doc.setLineWidth(0.5);
    doc.rect(borderMargin, borderMargin, width - (borderMargin * 2), height - (borderMargin * 2));
    
    // --- Fonts & Styles ---
    // User wants "clean text, sharp lines". 
    
    // --- Header ---
    // Logo - Maruti Suzuki (Top Right)


    // Top Left Address / Unit Info
    // Font: Helvetica Bold for address block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7); // Small text for address
    let startY = 8;
    const leftMargin = 10;
    
    // --- Header Icons ---
    const iconBase = '/Website-Images/Emoji performa';
    const addrIcon = await loadImageAsBase64(`${iconBase}/A.png`);
    const phoneIcon = await loadImageAsBase64(`${iconBase}/phone.png`);
    const webIcon = await loadImageAsBase64(`${iconBase}/w.png`);
    
    // Address Icon (Small) - before Unit No
    if(addrIcon) {
        doc.addImage(addrIcon, 'PNG', leftMargin - 4, startY - 2, 3, 3);
    }
    
    doc.text("Unit No.6 & 7, Opal Square,", leftMargin, startY);
    doc.text("Plot No.C1, Road No.1,", leftMargin, startY + 3.5);
    doc.text("Opp. Old Passport Office,", leftMargin, startY + 7);
    doc.text("MIDC Wagle Estate,", leftMargin, startY + 10.5);
    doc.text("Thane (West) - 400604.", leftMargin, startY + 14);
    
    // Icons/Contact
    const iconSize = 3;
    
    // Phone Icon
    if(phoneIcon) {
        doc.addImage(phoneIcon, 'PNG', leftMargin - 4, startY + 16, iconSize, iconSize);
    }
    // Website Icon
    if(webIcon) {
        doc.addImage(webIcon, 'PNG', leftMargin - 4, startY + 20, iconSize, iconSize);
    }

    doc.text("9111949494", leftMargin, startY + 18); 
    doc.text("www.arenaofmulundwest.com", leftMargin, startY + 22);

    // Center Title - VELOX MOTORS PVT LTD
    // Make it large and bold
    const centerX = width / 2;
    
    // Use Logo Image instead
    const veloxLogoUrl = '/Website-Images/veloxmotors-logo.png';
    const veloxLogoData = await loadImageAsBase64(veloxLogoUrl);
    if(veloxLogoData) {
        // Center the logo. Reduced size as requested.
        // x = centerX - (w/2)
        const logoW = 80; 
        const logoH = 9; // Reduced from 11
        doc.addImage(veloxLogoData, 'PNG', centerX - (logoW/2), 15, logoW, logoH); // Shifted down to 15
    }
    
    doc.setFontSize(8);
    // Moved down to 26 to avoid overlap
    doc.text("Authorised Dealer - MARUTI SUZUKI INDIA LIMITED", centerX, 28, { align: 'center' }); // Shifted down a bit more

    // PROFORMA INVOICE Heading
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    // Moved down to 36
    doc.text("PROFORMA INVOICE", centerX, 38, { align: 'center' });
    
    // Sr No & Date
    // Sr No (Red)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("Sr. No :", leftMargin, 38);
    doc.setTextColor(220, 0, 0); // Red
    doc.setFontSize(12);
    // Strip 'PI' from serial number display
    const displaySerial = serialNumber.replace(/PI/i, '');
    doc.text(displaySerial, leftMargin + 15, 38); 
    
    // Date (Right aligned)
    doc.setTextColor(0, 0, 0); // Reset black
    doc.setFontSize(11); // Slightly larger for date
    doc.setFont("helvetica", "bold"); 
    doc.text(`Date : ${formData.date}`, width - 15, 38, { align: 'right' });
    
    // --- Customer Details Section ---
    const boxTop = 42; 
    // 5 Rows of ~6mm height = 30mm height
    const rowH = 6;
    const boxHeight = rowH * 5; 
    const rightColX = 110; 
    
    // Draw outer box
    doc.rect(leftMargin, boxTop, width - 20, boxHeight); 
    
    // Draw "half" line for Name
    doc.line(leftMargin + 30, boxTop + rowH, width - 10, boxTop + rowH);
    
    // Two more lines after address (covering Address Line 1 and Address Line 2)
    doc.line(leftMargin + 30, boxTop + (rowH*2), width - 10, boxTop + (rowH*2));
    doc.line(leftMargin + 30, boxTop + (rowH*3), width - 10, boxTop + (rowH*3));
    
    // Line for Contact (Left col)
    doc.line(leftMargin + 30, boxTop + (rowH*4), rightColX - 2, boxTop + (rowH*4));
    
    // Line for Email (Right col)
    doc.line(rightColX + 20, boxTop + (rowH*4), width - 10, boxTop + (rowH*4));
    
    // Row 1: Name
    const r1y = boxTop + 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Name :", leftMargin + 2, r1y);
    doc.setFont("helvetica", "normal"); // Changed to normal
    doc.setFontSize(10);
    doc.text(formData.name || '', leftMargin + 35, r1y);
    
    // Address splitting
    const fullAddr = formData.address || '';
    // Reduce width to ensure it stays within lines
    const addrLines = doc.splitTextToSize(fullAddr, width - 60); 
    const addrLine1 = addrLines[0] || '';
    const addrLine2 = addrLines.length > 1 ? addrLines.slice(1).join(" ") : '';

    // Row 2: Address Line 1
    const r2y = boxTop + rowH + 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Address:", leftMargin + 2, r2y);
    doc.setFont("helvetica", "normal"); // Changed to normal
    doc.setFontSize(10);
    doc.text(addrLine1, leftMargin + 35, r2y);
    
    // Row 3: Address Line 2 (No Label, just continuation)
    const r3y = boxTop + (rowH*2) + 4.5;
    doc.setFont("helvetica", "normal"); // Changed to normal
    doc.setFontSize(10);
    doc.text(addrLine2, leftMargin + 35, r3y);
    
    // Row 4: Contact No & Email
    const r4y = boxTop + (rowH*3) + 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Contact No.:", leftMargin + 2, r4y);
    doc.setFont("helvetica", "normal"); // Changed to normal
    doc.setFontSize(10);
    doc.text(formData.contactNo || '', leftMargin + 35, r4y);
    
    // Email (Right side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Email Id :", rightColX, r4y);
    doc.setFont("helvetica", "normal"); // Changed to normal
    doc.setFontSize(10);
    doc.text(formData.email || '', rightColX + 20, r4y);

    // Row 5: Model & Registration
    // Row 5: Model & Registration (and Hypothecation if exists)
    const r5y = boxTop + (rowH*4) + 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Model:", leftMargin + 2, r5y);
    doc.setFont("helvetica", "normal"); 
    doc.setFontSize(10);
    doc.text(formData.model || '', leftMargin + 35, r5y);
    
    // Hypothecation & Registration Logic
    let regLabelX = rightColX;
    let regValueX = rightColX + 20;

    if (formData.bankName) {
        // Shift Registration to right to make space for HYP/HPA
        regLabelX = 150;
        regValueX = 175;

        // HYP/HPA in middle
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("HYP/HPA :", 90, r5y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        // Truncate if too long
        const bankName = formData.bankName.length > 25 ? formData.bankName.substring(0, 22) + '...' : formData.bankName;
        doc.text(bankName, 110, r5y);
    }

    // Registration (Right side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Registration:", regLabelX, r5y);
    doc.setFont("helvetica", "normal"); 
    doc.setFontSize(10);
    doc.text(formData.registration || '', regValueX, r5y);

    // --- Tables Section ---
    // Two columns: Left (Particular) and Right (Finance Proforma)
    
    // --- Tables Section ---
    // Two columns: Left (Particular) and Right (Finance Proforma)
    
    const tableTop = 74;
    const tableWidth = width - 20; // 190mm total width
    const gap = 4; // 4mm gap between tables
    const colWidth = (tableWidth - gap) / 2; // 93mm each
    const rightTableX = leftMargin + colWidth + gap;
    
    // Header Row Height
    const headerHeight = 7;
    const subHeaderHeight = 7;
    
    // Main Headers
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    
    // Left Header
    doc.rect(leftMargin, tableTop, colWidth, headerHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10); // Slightly larger for table header
    doc.text("PARTICULAR", leftMargin + (colWidth/2), tableTop + 4.5, { align: 'center' });
    
    // Right Header
    doc.rect(rightTableX, tableTop, colWidth, headerHeight);
    doc.text("FINANCE PROFORMA", rightTableX + (colWidth/2), tableTop + 4.5, { align: 'center' });
    
    // Sub-Header for Right Side (Scheme 1 / Scheme 2)
    // This row only exists on right side? 
    // Wait, the reference image shows "Scheme -1" and "Scheme -2" below "FINANCE PROFORMA"
    // Left side has no sub-header, just starts rows? 
    // Reference: "PARTICULAR" spans full left col. Rows start immediately.
    // Right side: "FINANCE PROFORMA" spans full right col. Below it "Scheme -1" | "Scheme -2"
    // So distinct row lines.
    
    // Draw Sub-header for Right side
    const schemeY = tableTop + headerHeight;
    doc.rect(rightTableX, schemeY, colWidth, subHeaderHeight); // box for scheme row
    
    // Scheme columns widths refined
    const labelColWidth = 40; // Reduced slightly
    const schColWidth = (colWidth - labelColWidth) / 2; // Split remaining equal
    
    // Lines
    doc.line(rightTableX + labelColWidth, schemeY, rightTableX + labelColWidth, schemeY + subHeaderHeight); // Split Label / Sch1
    doc.line(rightTableX + labelColWidth + schColWidth, schemeY, rightTableX + labelColWidth + schColWidth, schemeY + subHeaderHeight); // Split Sch1 / Sch2
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Scheme -1", rightTableX + labelColWidth + (schColWidth/2), schemeY + 4, { align: 'center' });
    doc.text("Scheme -2", rightTableX + labelColWidth + schColWidth + (schColWidth/2), schemeY + 4, { align: 'center' });
    
    // --- Data Rows ---
    // We need to sync left and right rows but start them at different Y positions
    
    // Define Left items manually
    const leftItems = [
        { label: "Ex-Showroom Price", value: formData.exShowroomPrice },
        { label: "Reg. & Service Charges", value: formData.regServiceCharges },
        { label: "Insurance with Zero Dep", value: formData.insuranceZeroDep },
        { label: "Extended Warranty (5yrs)", value: formData.extendedWarranty },
        { label: "Accessories", value: formData.accessories },
        { label: "TCS 1%", value: formData.tcs },
        { label: "Loyalty (Auto) Card", value: formData.loyaltyCard },
        { label: "Fastag Charges", value: formData.fastagCharges },
        { label: "Total On Road Price", value: "CALC", isBold: true },
        { label: "Less: Consumer Offer", value: formData.consumerOffer },
        { label: "Less: Corporate Offer", value: formData.corporateOffer },
        { label: "Less: Exchange Bonus", value: formData.exchangeBonus },
        { label: "Total Payment", value: "CALC", isBold: true }
    ];

    // Right items
    const rightItems = [
        { label: "Bank Name", value: formData.bankName },
        { label: "Loan Tenure", value: formData.loanTenure },
        { label: "Cost of Vehicle", value: formData.costOfVehicle },
        { label: "Loan Amount", value: formData.loanAmount },
        { label: "Margin Money", value: formData.marginMoney },
        { label: "EMI", value: formData.emi },
        { label: "Insurance", value: formData.financeInsurance },
        { label: "Fastag/Auto Card", value: formData.financeFastag },
        { label: "EW", value: formData.ew },
        { label: "Registration", value: formData.financeRegistration },
        { label: "Accessories", value: formData.financeAccessories },
        { label: "Stamp Duty & PF", value: formData.stampDutyPF },
        { label: "Less: Corporate Offer", value: formData.financeCorporateOffer },
        { label: "Less: MSIL Offer", value: formData.financeMSILOffer },
        { label: "Net Down Payment", value: formData.netDownPayment || '', isBold: true }
    ];

    const rowHeight = 7.5; 
    
    // Left side starts immediately after Main Header
    const leftStartY = tableTop + headerHeight;
    
    // Right side starts after Sub-Header
    const rightStartY = tableTop + headerHeight + subHeaderHeight;
    
    // Determine max rows
    const maxRows = Math.max(leftItems.length, rightItems.length);
    
    // Calculate totals for left side if needed
    const calcTotalOnRoad = () => {
        const sum = [
            formData.exShowroomPrice, formData.regServiceCharges, formData.insuranceZeroDep,
            formData.extendedWarranty, formData.accessories, formData.tcs, formData.loyaltyCard, formData.fastagCharges
        ].reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
        return sum.toFixed(2);
    };
    const totalOnRoadVal = calcTotalOnRoad();
    const totalPaymentVal = (parseFloat(totalOnRoadVal) - (parseFloat(formData.consumerOffer) || 0) - (parseFloat(formData.corporateOffer) || 0) - (parseFloat(formData.exchangeBonus) || 0)).toFixed(2);
    
    // Render Rows
    for (let i = 0; i < maxRows; i++) {
        // Calculate distinct Y for left and right
        const leftY = leftStartY + (i * rowHeight);
        const rightY = rightStartY + (i * rowHeight);
        
        // --- Left Side ---
        // Only draw left side if there's content
        if (i < leftItems.length) {
            doc.rect(leftMargin, leftY, colWidth, rowHeight); // Outer frame
            
            // Columns: Label | Vacant | Amount
            // User requested "other two column in same gap" -> Equal width
            const equalGap = 22; 
            const leftAmtColWidth = equalGap; 
            const vacantColWidth = equalGap;
            
            // Line separating Vacant | Amount
            doc.line(leftMargin + colWidth - leftAmtColWidth, leftY, leftMargin + colWidth - leftAmtColWidth, leftY + rowHeight);
            
            // Line separating Label | Vacant
            doc.line(leftMargin + colWidth - leftAmtColWidth - vacantColWidth, leftY, leftMargin + colWidth - leftAmtColWidth - vacantColWidth, leftY + rowHeight);
            
            const item = leftItems[i];
            
            doc.setFont("helvetica", item.isBold ? "bold" : "normal");
            doc.setFontSize(8); 
            // Better vertical centering
            doc.text(item.label, leftMargin + 2, leftY + (rowHeight / 2) + 1);
            
            // Value
            let val = item.value;
            if (val === "CALC") {
                if (item.label.includes("On Road")) val = totalOnRoadVal;
                if (item.label.includes("Total Payment")) val = totalPaymentVal;
            }
            
            doc.setFont("times", "normal"); 
            if (item.isBold) doc.setFont("helvetica", "bold");
            
            if (val) {
                // Right align value with padding in Amount column
                doc.text(val.toString(), leftMargin + colWidth - 3, leftY + (rowHeight / 2) + 1, { align: 'right' });
            }
        }
        
        // --- Right Side ---
        // Only draw right side if there's content
        if (i < rightItems.length) {
            doc.rect(rightTableX, rightY, colWidth, rowHeight); // Outer frame
            // Vertical lines
            doc.line(rightTableX + labelColWidth, rightY, rightTableX + labelColWidth, rightY + rowHeight); // Label | Sch1
            doc.line(rightTableX + labelColWidth + schColWidth, rightY, rightTableX + labelColWidth + schColWidth, rightY + rowHeight); // Sch1 | Sch2
            
            const item = rightItems[i];
            
            doc.setFont("helvetica", item.isBold ? "bold" : "normal");
            doc.setFontSize(9);
            doc.text(item.label, rightTableX + 2, rightY + (rowHeight / 2) + 1);
            
            // Value
            doc.setFont("times", "normal");
             if (item.isBold) doc.setFont("helvetica", "bold");
             
            if (item.value) {
                // Center
                doc.text(item.value, rightTableX + labelColWidth + (schColWidth/2), rightY + (rowHeight / 2) + 1, { align: 'center' });
            }
        }
    }
    
    // Calculate final Y based on the max extent of both tables
    const finalLeftY = leftStartY + (leftItems.length * rowHeight);
    const finalRightY = rightStartY + (rightItems.length * rowHeight);
    const finalY = Math.max(finalLeftY, finalRightY);
    
    // --- Footer Section ---
    // Align "DOCUMENTS REQUIRED..." with "Less: Corporate Offer" (Right table, 2nd to last row)
    // Shift slightly down as requested
    const corporateOfferRowY = rightStartY + (12 * rowHeight);
    
    // Left Box: Documents & Terms
    // Ensure we start below the lowest table content on the left side
    const leftTableBottom = leftStartY + (leftItems.length * rowHeight);
    
    // Start footer text below the greater of these, plus extra buffer
    // User requested "shift little down"
    let leftY = Math.max(corporateOfferRowY + 5, leftTableBottom + 8);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("DOCUMENTS REQUIRED FOR FINANCE CASES :", leftMargin, leftY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7); 
    const docs = [
        "1) Last 3 Months Salary Slip, Last Two Years Form 16/TDS.1",
        "2) Last 2 Years Computation on Invoice, Balance Sheet.",
        "3) Last 2 Years of IT Returns (Saral), 2 Passports Size Photograph.",
        "4) Latest 1 year Bank Statement/ Signatures Verification.",
        "5) Address Proof (Telephone/Electrical/LIC Policy) Photo copy of Any.",
        "6) Identity Proof (Passport/Driving License/Pan card) Photo copy of Any.",
        "7) Partnership Deed / MOA / AOA / Authority letter from partners.",
        "8) Board Resolution."
    ];
    
    leftY += 4.5; // Increased gap after header
    docs.forEach(d => {
        doc.text(d, leftMargin, leftY);
        leftY += 4; // Increased line height for better spacing
    });
    
    // Terms
    leftY += 5; // Extra gap before new section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TERMS & CONDITIONS :", leftMargin, leftY);
    leftY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const terms = [
        "* Payment 100% Advance along with order and before final invoicing.",
        "* Cheques in favour of VELOX MOTORS PRIVATE LIMITED",
        "* Price/Schemes prevailing at the time of Invoicing/Delivery shall be applicable.",
        "* Delivery subject to availability of stock & colour with manufacturer.",
        "* The above offer is valid till _________________"
    ];
    terms.forEach(t => {
        doc.text(t, leftMargin, leftY);
        leftY += 4; // Increased line height
    });
    
    // GSTIN 
    leftY += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("GSTIN : 27AAHCC0119N1ZM", leftMargin, leftY);
    
    // Bank Details
    leftY += 6;
    doc.setFont("helvetica", "bold"); 
    doc.text("BANK DETAILS :", leftMargin, leftY);
    leftY += 4.5; 
    
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(7);
    const bankStartY = leftY;
    const bankDetails = [
        "1.- BANK NAME - STATE BANK OF INDIA",
        "2.- ACCOUNT NO. - 37647664736",
        "3.- IFSC CODE - SBIN0001053",
        "4.- ACCOUNT TYPE - CURRENT A/C.",
        "5.- BRANCH - (01053) WAGLE INDUSTRIAL ESTATE."
    ];
    bankDetails.forEach(bd => {
        doc.text(bd, leftMargin, leftY);
        leftY += 4;
    });

     // QR Code Image
    const qrUrl = '/Website-Images/velox paymenet scanner.jpeg';
    const qrData = await loadImageAsBase64(qrUrl);
    if (qrData) {
        // Place QR code to the right of Bank details
        // Bank details text is about 60-70mm wide?
        // Note: The file on disk is a JPEG, so we specify 'JPEG' format
        doc.addImage(qrData, 'JPEG', leftMargin + 65, bankStartY - 10, 25, 25);
    }
    
    // --- Right Footer Box ---
    // Align with Right Table (rightTableX to rightTableX + colWidth)
    const rightBoxX = rightTableX; 
    const rightBoxW = colWidth;
    // Attach directly to the bottom of the right table
    const rightBoxTop = finalRightY;
    
    // "Note" Box
    const noteHeight = 15;
    doc.rect(rightBoxX, rightBoxTop, rightBoxW, noteHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10); // Increased from 8 (approx +2px visual)
    const noteText = "Note: Price, Schemes & Discounts prevailing at the time of Delivery/Invoicing will only be applicable.";
    
    // Using maxWidth and align: justify
    doc.text(noteText, rightBoxX + 2, rightBoxTop + 6, { 
        maxWidth: rightBoxW - 4, 
        align: 'justify' 
    });
    
    // "For Velox Motors" Box
    const signBoxTop = rightBoxTop + noteHeight;
    // Title part
    doc.rect(rightBoxX, signBoxTop, rightBoxW, 12); // Slightly taller header to fit larger text
    doc.setFont("helvetica", "bold");
    // User asked to increase by "8px". 9pt is ~12px. New is 20px -> ~15pt.
    doc.setFontSize(15); 
    doc.text("For Velox Motors Pvt. Ltd.", rightBoxX + (rightBoxW/2), signBoxTop + 8, { align: 'center' });
    
    // Main Signature Box body
    const signBodyTop = signBoxTop + 12; // Adjusted for taller header
    // Align bottom line with page border
    const signBodyHeight = 63; // Slightly reduced to compensate for header
    doc.rect(rightBoxX, signBodyTop, rightBoxW, signBodyHeight);
    
    // Labels inside
    
    // Move "(Sales Department)" here
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    // Placing it at the top of the body, centered
    doc.text("(Sales Department)", rightBoxX + (rightBoxW/2), signBodyTop + 5, { align: 'center' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9); 
    
    let signY = signBodyTop + 12; // Start lower to accommodate Sales Dept
    doc.text("Relationship Manager :", rightBoxX + 3, signY);
    
    signY += 10; // Reduced from 14
    doc.text("Contact No :", rightBoxX + 3, signY);
    
    signY += 10;
    doc.text("Sr. Relationship Manager:", rightBoxX + 3, signY);
    
    signY += 10;
    doc.text("Contact No :", rightBoxX + 3, signY);
    
    signY += 10;
    doc.text("RM's Signature :", rightBoxX + 3, signY);
    
    signY += 10; // gap
    doc.text("Dealer Stamp :", rightBoxX + 3, signY);
    
    // Stamp Image
    const stampUrl = '/Website-Images/stampandsign.png';
    const stampData = await loadImageAsBase64(stampUrl);
    
    if (stampData) {
        // Position stamp on the right side of the signature box, overlapping lines slightly
        // Box width is ~93mm. Place it around 50mm from left of box?
        const stampSize = 35; // Adjust size as needed
        const stampX = rightBoxX + 45; 
        const stampY = signBodyTop + 15;
        doc.addImage(stampData, 'PNG', stampX, stampY, stampSize, stampSize);
    }
    
    // --- Z-Index 999: Maruti Suzuki Logo (Draw Last) ---
    // Moved here to be on top of everything
    const logoUrl = '/Website-Images/Maruti-Suzuki-Logo.png'; 
    const logoData = await loadImageAsBase64(logoUrl);
    if (logoData) {
        // Logo size adjustment
        // Increased height slightly as requested approx 5px
        doc.addImage(logoData, 'PNG', 150, 5, 50, 10); 
    }
    
    // Save
    doc.save(`Proforma_Invoice_${formData.name || 'Draft'}.pdf`);
};
