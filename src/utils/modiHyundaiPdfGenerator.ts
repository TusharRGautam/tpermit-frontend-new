import jsPDF from 'jspdf';


interface ProformaData {
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
    
    // Additional fields might be mapped from common data
    color?: string; // If available in formData
    hypothecation?: string; // Hypothecation Details
    hypothecationAmount?: string;
    safetyPackage?: string;
    accPackage?: string;
}

const loadImageAsBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

export const generateModiHyundaiProformaPDF = async (formData: ProformaData, serialNumber: string) => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, Millimeters, A4
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Helper for centering text
    const centerText = (text: string, y: number, fontSize: number = 10, font: string = "helvetica", fontStyle: string = "normal") => {
        doc.setFont(font, fontStyle);
        doc.setFontSize(fontSize);
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        const x = (width - textWidth) / 2;
        doc.text(text, x, y);
    };

    // Global Styles for "Exact Borders"
    doc.setDrawColor(0, 0, 0); // Black borders
    doc.setLineWidth(0.25); // Sharp thin lines matching table grid

    // --- Header Section ---
    // Header Box: Full width, height around 13mm
    doc.setLineWidth(0.25);
    
    // Hyundai Logo (Top Left) - Draw FIRST ("z-index -999")
    const logoUrl = '/Website-Images/Brands/hyundailogo.png';
    try {
        const logoData = await loadImageAsBase64(logoUrl);
        if (logoData) {
            // Place logo inside the box on the left
            // Increased width "little bit" (14 -> 20), Height proportional-ish (10 -> 14)
            doc.addImage(logoData, 'PNG', 12, 11, 20, 14); 
        }
    } catch (e) {
        console.error("Error loading logo", e);
    }

    // Header Border (Stroke Only - No Fill)
    doc.setDrawColor(0, 0, 0);
    // Removed Yellow Fill as requested ("only on performa invoice column")
    doc.rect(10, 10, width - 20, 15, 'S'); 
    
    // MODI HYUNDAI MALAD Text (Centered)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14); // Slightly larger for main title
    doc.setFont("helvetica", "bold");
    doc.text("MODI HYUNDAI MALAD", width / 2, 16, { align: 'center' });
    
    // Sub-header Text
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("LINK ROAD,NEAR FIRE BRIGADE,MALAD WEST,MUMBAI", width / 2, 21, { align: 'center' });
    
    // PROFORMA INVOICE BAR
    doc.setFillColor(255, 255, 0); // Yellow
    doc.rect(10, 26, width - 20, 6, 'F');
    doc.rect(10, 26, width - 20, 6, 'S');
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PROFORMA INVOICE", width / 2, 30, { align: 'center' });

    // --- Customer Details Table ---
    // Start below Proforma Invoice bar
    let startY = 34;
    const leftX = 10;
    const rightX = width - 20; // 200mm
    // Exact column widths based on visual estimation
    const col1W = 28; // Customer Label
    const col2W = 82; // Customer Name
    const col3W = 25; // P Inv No Label
    const col4W = 55; // P Inv No Value

    // Standard Row Height
    const rowH = 6;

    // Helper to draw row
    const drawRow = (y: number, l1: string, v1: string, l2: string, v2: string, v1Bold: boolean = true) => {
        doc.rect(leftX, y, width - 20, rowH);
        
        // Vertical Lines
        doc.line(leftX + col1W, y, leftX + col1W, y + rowH); // After Label 1
        doc.line(leftX + col1W + col2W, y, leftX + col1W + col2W, y + rowH); // Middle Split
        doc.line(leftX + col1W + col2W + col3W, y, leftX + col1W + col2W + col3W, y + rowH); // After Label 2

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        // Label 1
        doc.text(l1, leftX + 2, y + 4.5);
        
        // Value 1
        doc.setFont("helvetica", v1Bold ? "bold" : "normal");
        doc.text(v1 || "", leftX + col1W + 2, y + 4.5);
        
        // Label 2
        doc.setFont("helvetica", "normal");
        doc.text(l2, leftX + col1W + col2W + 2, y + 4.5);
        
        // Value 2
        doc.setFont("helvetica", "bold"); // Usually bold
        doc.text(v2 || "", leftX + col1W + col2W + col3W + 2, y + 4.5);
    };

    // Row 1
    drawRow(startY, "Customer :", formData.name, "P. Inv. No.", serialNumber);
    startY += rowH;

    // Row 2
    drawRow(startY, "Model :", formData.model, "Date :", formData.date || new Date().toLocaleDateString('en-IN'));
    startY += rowH;

    // Row 3 (Special case for Regn/Hyp split)
    // Draw outer frame
    doc.rect(leftX, startY, width - 20, rowH);
    // Vertical lines main grid
    doc.line(leftX + col1W, startY, leftX + col1W, startY + rowH); 
    doc.line(leftX + col1W + col2W, startY, leftX + col1W + col2W, startY + rowH);
    doc.line(leftX + col1W + col2W + col3W, startY, leftX + col1W + col2W + col3W, startY + rowH);

    doc.setFont("helvetica", "normal");
    doc.text("Regn :", leftX + 2, startY + 4.5);
    
    // Split Value Column 1 for HYP/HPA
    const regnW = 35;
    const hypLabelW = 20; // Width for "HYP/HPA :" label
    doc.setFont("helvetica", "bold");
    doc.text(formData.registration || "MUMBAI", leftX + col1W + 2, startY + 4.5);
    
    // Hyp Separator line
    doc.line(leftX + col1W + regnW, startY, leftX + col1W + regnW, startY + rowH);
    
    // Hyp Label
    doc.setFont("helvetica", "normal");
    doc.text("HYP/HPA :", leftX + col1W + regnW + 2, startY + 4.5);
    
    // Hyp Vertical Separator
    doc.line(leftX + col1W + regnW + hypLabelW, startY, leftX + col1W + regnW + hypLabelW, startY + rowH);
    
    // Hyp Value (Placeholder or actual data)
    // Using a placeholder '-' or empty if not provided
    doc.setFont("helvetica", "bold");
    doc.text(formData.hypothecation || "-", leftX + col1W + regnW + hypLabelW + 2, startY + 4.5);
    
    // Value 2 (Colour)
    doc.text("Colour:", leftX + col1W + col2W + 2, startY + 4.5);
    doc.setFont("helvetica", "bold");
    doc.text("TBC", leftX + col1W + col2W + col3W + 2, startY + 4.5);
    startY += rowH;

    // Row 4
    drawRow(startY, "CONTACT NO :", formData.contactNo, "MFG Year", new Date().getFullYear().toString());
    startY += rowH; // No Gap - merged with Price Table

    // --- Price Details Table (Manual) ---
    // autoTable borders can be tricky to match "exact" reference perfectly.
    // Drawing manually ensures strict control.
    
    // Attach directly to the previous row
    const priceTableY = startY;
    const priceCol1W = 140; 
    const priceCol2W = (width - 20) - priceCol1W; // Remaining width (~50mm)
    
    // Header Row
    doc.rect(leftX, priceTableY, width - 20, 7);
    doc.line(leftX + priceCol1W, priceTableY, leftX + priceCol1W, priceTableY + 7);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    // Center alignment for headers
    doc.text("DETAILS OF VEHICLE PRICE", leftX + (priceCol1W/2), priceTableY + 4.5, { align: 'center' });
    doc.text("AMOUNT", leftX + priceCol1W + (priceCol2W/2), priceTableY + 4.5, { align: 'center' });
    
    let currentY = priceTableY + 7;
    const priceRowH = 6.5;

    // Data Items
    const priceItems = [
        ["EX-SHOWROOM PRICE", formData.exShowroomPrice || "0.00"],
        ["DISCOUNT", formData.consumerOffer || "0.00"],
        ["INSURANCE (1+3) (0 DEPT+RTI+ENG Protect+CM)", formData.insuranceZeroDep || "0.00"],
        ["REGISTRATION CHARGES", formData.regServiceCharges || "0.00"],
        ["HYP", formData.hypothecationAmount || "0.00"],
        ["FASTAG CHARGES", formData.fastagCharges || "0.00"],
        ["GPS FITMENT", formData.accessories || "0.00"],
        ["SAFETY PACKAGE (ANTIRUST+FLOOR LAMINATION+SILENCER COATING+PPF)", formData.safetyPackage || "0.00"],
        ["ACC PACKAGE", formData.accPackage || "0.00"]
    ];

    // Calculate Total
    const parseCurrency = (str?: string) => parseFloat((str || '').replace(/,/g, '') || '0');
    const totalOnRoad = 
        parseCurrency(formData.exShowroomPrice) + 
        parseCurrency(formData.insuranceZeroDep) + 
        parseCurrency(formData.regServiceCharges) + 
        parseCurrency(formData.hypothecationAmount) + 
        parseCurrency(formData.fastagCharges) + 
        parseCurrency(formData.accessories) + 
        parseCurrency(formData.safetyPackage) +
        parseCurrency(formData.accPackage) - // Assuming these are additive? Yes.
        parseCurrency(formData.consumerOffer); // Deduct Discount
    
    const fmt = (num: number) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalItem = ["ON ROAD PRICE", fmt(totalOnRoad)];

    // Draw Data Rows
    doc.setFontSize(9);
    priceItems.forEach(item => {
        doc.rect(leftX, currentY, width - 20, priceRowH);
        doc.line(leftX + priceCol1W, currentY, leftX + priceCol1W, currentY + priceRowH);
        
        doc.setFont("helvetica", "bold");
        doc.text(item[0], leftX + 2, currentY + 4.5); // Label left aligned
        
        doc.setFont("helvetica", "normal"); // Amounts usually normal? Reference shows standard
        // Right align amount
        const textW = doc.getStringUnitWidth(item[1]) * 9 / doc.internal.scaleFactor;
        doc.text(item[1], leftX + width - 20 - 2, currentY + 4.5, { align: 'right' });
        
        currentY += priceRowH;
    });
    
    // Total Row
    doc.rect(leftX, currentY, width - 20, priceRowH);
    doc.line(leftX + priceCol1W, currentY, leftX + priceCol1W, currentY + priceRowH);
    doc.setFont("helvetica", "bold");
    doc.text(totalItem[0], leftX + 2, currentY + 4.5);
    doc.text(totalItem[1], leftX + width - 20 - 2, currentY + 4.5, { align: 'right' });
    
    currentY += priceRowH + 5; // Gap

    // --- Terms & Conditions (Table Style) ---
    // Reference shows each term has a horizontal line separating it.
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // "TERMS AND CONDITIONS :" Header Box
    // Boxing the header as requested ("table border lines missing")
    doc.rect(10, currentY, width - 20, 6);
    doc.text("TERMS AND CONDITIONS :", 12, currentY + 4);
    currentY += 6; 
    
    // Terms Box
    const termRowH = 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    const terms = [
        "WAITING PERIOD :- 4 TO 6 WEEKS",
        "Above prices and scheme are subject to change without prior notice.",
        "Prices prevailing at the time delivery / Invoicing will be applicable.", 
        "Any changes in the tax levied by the Rto Office will be applicable.",
        "Please note the process will start only on completion of Documentation and clearance of Payment into our account",
        "Home / Office Address delivery will at Owner's Risk.",
        "DD / Payorder / Cheque to be made in favour of \" NORTH VIEW CARS PRIVATE LIMITED\"."
    ];
    
    terms.forEach((term, index) => {
        // Draw Rect for each row
        doc.rect(10, currentY, width - 20, termRowH);
        
        if (index === 2) doc.setTextColor(200, 0, 0); // Red
        else doc.setTextColor(0, 0, 0);
        
        doc.text(term, 12, currentY + 3.5); // Vertical center aligned
        currentY += termRowH;
    });

    // GST ID (Below terms table) - Boxing
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    // currentY += 5; // No Gap if we want it attached? Or small gap.
    // User asked for "GST ID" table border. Usually it's separate or attached at bottom.
    // I'll attach it as a separate row box.
    doc.rect(10, currentY, width - 20, 6);
    doc.text("GST ID : 27AAHCN3692D1ZC", 12, currentY + 4);
    
    currentY += 10; // Gap before footer

    // --- Footer: Bank Details (Grid) & Signatures ---
    const footerH = 40;
    
    // Left Box: Bank Details Grid
    const leftBoxW = 95;
    doc.rect(leftX, currentY, leftBoxW, footerH);
    
    // Right Box: Signatures
    const rightBoxW = (width - 20) - leftBoxW;
    doc.rect(leftX + leftBoxW, currentY, rightBoxW, footerH);
    
    // --- Bank Details Section ---
    // Header Row "Bank Details:"
    const bankHeaderH = 6;
    doc.line(leftX, currentY + bankHeaderH, leftX + leftBoxW, currentY + bankHeaderH);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Details:", leftX + 2, currentY + 4);
    
    // Bank Details Rows
    // We have 5 remaining items fitting in (footerH - bankHeaderH) = 34mm?
    // Items: North View, ICICI, Acc No, IFSC, Branch
    const bankItems = [
        "North View Cars Pvt Ltd",
        "ICICI BANK LTD",
        "Account No.: 001105038487.",
        "IFSC Code: ICIC0000011",
        "Branch: ANDHERI (West)"
    ];
    // Calculate row height to fit exactly? 
    // Or fixed height. 34 / 5 = 6.8mm per row.
    const bankRowH = (footerH - bankHeaderH) / bankItems.length;
    
    let bankRowY = currentY + bankHeaderH;
    
    // Vertical Lines for Bank Grid (tri-column look)
    // Col 1: Text (~60mm), Col 2: Empty (~17mm), Col 3: Empty (~18mm)
    const bCol1W = 60;
    const bCol2W = 17.5;
    // Lines strictly within the Bank Details Box (Start Y from Header Bottom to End Y)
    const bankGridTopY = currentY + bankHeaderH;
    doc.line(leftX + bCol1W, bankGridTopY, leftX + bCol1W, currentY + footerH);
    doc.line(leftX + bCol1W + bCol2W, bankGridTopY, leftX + bCol1W + bCol2W, currentY + footerH);
    
    doc.setFont("helvetica", "bold"); // Values are bold? Reference seems bold/dark
    doc.setFontSize(8); // slightly smaller to fit
    
    bankItems.forEach((item, index) => {
        // Horizontal line for next row (except last)
        if (index < bankItems.length - 1) {
            doc.line(leftX, bankRowY + bankRowH, leftX + leftBoxW, bankRowY + bankRowH);
        }
        
        doc.text(item, leftX + 2, bankRowY + 4.5);
        bankRowY += bankRowH;
    });

    // --- Right Side Content (Signature) ---
    // Round Stamp Image
    const stampX = leftX + leftBoxW + (rightBoxW / 2);
    const stampY = currentY + (footerH / 2) - 8;
    // const stampR = 12; // Unused if image loads
    
    // Load Stamp Image
    const stampUrl = '/Website-Images/Brands/stamp odi hyndai.png';
    try {
        const stampData = await loadImageAsBase64(stampUrl);
        if (stampData) {
            // Place stamp in center of right box
            // Increased size to 45mm (another +10mm/40px)
            doc.addImage(stampData, 'PNG', stampX - 22.5, stampY - 22.5, 45, 45);
        } else {
             // Fallback to circle if image fails
            const stampR = 12;
            doc.setTextColor(0, 0, 139);
            doc.setDrawColor(0, 0, 139);
            doc.circle(stampX, stampY, stampR);
            doc.setFontSize(6);
            doc.text("NORTH VIEW CARS PVT. LTD.", stampX, stampY - 2, { align: 'center' });
            doc.text("MUMBAI", stampX, stampY + 2, { align: 'center' });
        }
    } catch (e) {
        console.error("Error loading stamp", e);
    }

    doc.setDrawColor(0, 0, 0); // Reset black
    doc.setTextColor(0, 0, 0);
    
    // Bottom separator for Sales Consultant
    const bottomH = 10; 
    const bottomY = currentY + footerH - bottomH;
    doc.line(leftX + leftBoxW, bottomY, leftX + leftBoxW + rightBoxW, bottomY);
    
    // Vertical split for Sales | Mobile labels vs values
    const labelW = 35;
    doc.line(leftX + leftBoxW + labelW, bottomY, leftX + leftBoxW + labelW, currentY + footerH);
    
    // Horizontal split between Sales and Mobile
    const midLineY = bottomY + (bottomH / 2);
    doc.line(leftX + leftBoxW, midLineY, leftX + leftBoxW + rightBoxW, midLineY);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Consultant :", leftX + leftBoxW + 2, bottomY + 3.5);
    doc.text("Mobile No :", leftX + leftBoxW + 2, midLineY + 3.5);
    
    doc.text("Mr PRAMOD GAVTADE", leftX + leftBoxW + labelW + 2, bottomY + 3.5);
    doc.text("8828107460", leftX + leftBoxW + labelW + 2, midLineY + 3.5);

    doc.save(`Proforma_Invoice_${serialNumber}.pdf`);
};


