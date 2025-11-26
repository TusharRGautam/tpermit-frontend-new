# Payment Receipt Management System - Setup Guide

## Overview
This document provides complete setup instructions for the Payment Receipt Management System for Gautam Motors.

---

## 📋 Features

✅ **Create Payment Receipts**
- Auto-generated receipt numbers (GM01, GM02, etc.)
- Auto-select current date
- Customer information capture
- Vehicle and payment details
- PDF download functionality

✅ **Manage Receipts**
- View all receipts in a table
- Search by customer name, mobile, car model, or receipt number
- Filter by car model, payment mode, and date range
- View detailed receipt information
- Download PDF receipts
- Delete receipts

✅ **Professional PDF Generation**
- Company logo and branding
- Detailed receipt layout
- Amount in words (Indian format)
- Signature and stamp section
- Clean, professional design

---

## 🗄️ Database Setup

### Step 1: Create Supabase Table

1. **Login to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor** in your project
3. **Copy and paste the SQL code** from `database/payment_receipts_schema.sql`
4. **Click "Run"** to execute the SQL

The SQL file will create:
- `payment_receipts` table with all required columns
- Indexes for performance optimization
- RLS (Row Level Security) policies
- Trigger for auto-updating `updated_at` field
- Function `get_next_receipt_number()` for auto-generating receipt numbers

### Step 2: Verify Table Creation

Run this query to verify the table was created successfully:

\`\`\`sql
SELECT * FROM payment_receipts LIMIT 1;
\`\`\`

---

## 🔧 Configuration

### Supabase Client Setup

Ensure your `config/supabaseClient.ts` (or `.js`) is properly configured:

\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
\`\`\`

### Environment Variables

Create/update your `.env` file:

\`\`\`env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

---

## 📁 File Structure

\`\`\`
tpermit-frontend/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       ├── PaymentReceipt.tsx      # Receipt creation form
│   │       ├── ReceiptList.tsx         # Receipt list with search/filter
│   │       └── DashboardLayout.tsx     # Updated with receipt routes
│   ├── services/
│   │   └── receiptService.js           # Supabase CRUD operations
│   ├── utils/
│   │   └── receiptPdfGenerator.ts      # PDF generation logic
│   └── config/
│       └── supabaseClient.ts           # Supabase configuration
├── database/
│   └── payment_receipts_schema.sql     # Database schema
└── public/
    └── Website-Images/
        └── signandstamp.jpg            # Signature & stamp image
\`\`\`

---

## 🖼️ Add Signature and Stamp Image

1. **Place the signature/stamp image** at:
   \`\`\`
   public/Website-Images/signandstamp.jpg
   \`\`\`

2. **Image Requirements**:
   - Format: JPG, PNG, or WEBP
   - Recommended size: 200x100 pixels
   - Should contain both signature and company stamp
   - Transparent background preferred

---

## 🚀 Navigation Routes

The following routes have been added to the dashboard:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/dashboard/receipt/new` | PaymentReceipt | Create new receipt |
| `/dashboard/receipts` | ReceiptList | View and manage receipts |

### Sidebar Navigation

New menu items in the dashboard sidebar:
- 🧾 **Create Receipt** → `/dashboard/receipt/new`
- 📋 **Manage Receipts** → `/dashboard/receipts`

---

## 📊 Database Schema

### Table: `payment_receipts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `receipt_number` | VARCHAR(50) | Unique receipt number (GM01, GM02...) |
| `receipt_date` | DATE | Date of receipt |
| `customer_name` | VARCHAR(255) | Customer's name |
| `customer_address` | TEXT | Customer's address |
| `mobile_number` | VARCHAR(15) | Customer's mobile number |
| `remarks` | TEXT | Additional remarks (optional) |
| `car_model` | VARCHAR(255) | Selected car model |
| `sales_executive_name` | VARCHAR(255) | Sales executive's name |
| `receipt_amount` | DECIMAL(12,2) | Payment amount in INR |
| `hypothecated_to` | VARCHAR(255) | Bank/finance company (optional) |
| `payment_mode` | VARCHAR(50) | Payment method |
| `created_at` | TIMESTAMP | Auto-generated timestamp |
| `updated_at` | TIMESTAMP | Auto-updated timestamp |

### Indexes

For optimal query performance, the following indexes are created:
- `receipt_number` (unique)
- `customer_name`
- `mobile_number`
- `car_model`
- `receipt_date`
- `created_at`

---

## 🔍 Search & Filter Features

### Search Functionality
Search across multiple fields:
- Customer name
- Mobile number
- Car model
- Receipt number

### Filter Options
- **Car Model**: Filter by specific car model
- **Payment Mode**: Filter by payment method (Cash, Cheque, UPI, etc.)
- **Date Range**: Filter by receipt date (from/to)

---

## 📥 Receipt PDF Features

### PDF Contents

1. **Header Section**
   - Company name: GAUTAM MOTORS
   - Company address: Diva, Thane – 400612
   - Receipt number (right-aligned)
   - Receipt date (right-aligned)

2. **Customer Details Box**
   - Customer name
   - Customer address
   - Mobile number

3. **Payment Details**
   - Car model
   - Sales executive name
   - Payment mode
   - Hypothecated to (if applicable)
   - **Receipt amount** (highlighted in green)
   - Amount in words (Indian format)

4. **Remarks Section** (if provided)

5. **Footer**
   - Thank you message
   - Authorized signatory section with stamp/signature
   - Computer-generated receipt note

### PDF Naming Convention

\`\`\`
Receipt_{ReceiptNumber}_{CustomerName}.pdf
\`\`\`

Example: `Receipt_GM01_John_Doe.pdf`

---

## 💡 Usage Guide

### Creating a Receipt

1. Navigate to **Dashboard → Create Receipt**
2. Fill in all required fields (marked with *)
3. Optional: Add hypothecation details and remarks
4. Click **"Save Receipt"** to save to database
5. Click **"Download PDF"** to generate PDF without saving

### Managing Receipts

1. Navigate to **Dashboard → Manage Receipts**
2. Use search bar for quick search
3. Apply filters for specific results
4. Click **👁️ View** to see full details
5. Click **📄 Download** to generate PDF
6. Click **🗑️ Delete** to remove receipt (with confirmation)

---

## 🔒 Security & Permissions

### Row Level Security (RLS)

The table has RLS enabled with the following policies:
- **SELECT**: Anyone can read (public receipts)
- **INSERT**: Authenticated users only
- **UPDATE**: Authenticated users only
- **DELETE**: Authenticated users only

**Note**: Adjust these policies based on your specific security requirements.

---

## 🎨 Styling

The receipt components use the existing dashboard CSS:
- `Dashboard.css` - Main dashboard styles
- Reuses existing form components and styles
- Consistent with quotation management UI

### Payment Mode Badges

Different colors for payment modes:
- Cash: Green
- Cheque: Blue
- Online: Purple
- UPI: Orange
- Card: Teal
- RTGS/NEFT: Gray

---

## 🐛 Troubleshooting

### Issue: Receipt number not auto-generating

**Solution**:
1. Verify the SQL function was created:
   \`\`\`sql
   SELECT get_next_receipt_number();
   \`\`\`
2. Check Supabase logs for errors
3. Ensure proper permissions on the function

### Issue: PDF download not working

**Solution**:
1. Verify `jspdf` package is installed:
   \`\`\`bash
   npm install jspdf
   \`\`\`
2. Check browser console for errors
3. Ensure all required data is present

### Issue: Signature image not showing in PDF

**Solution**:
1. Verify image exists at `/public/Website-Images/signandstamp.jpg`
2. Check image file permissions
3. Currently, the PDF uses text placeholder - image embedding requires base64 conversion

---

## 📦 Dependencies

Required npm packages:
- `@supabase/supabase-js` - Supabase client
- `jspdf` - PDF generation
- `react-router-dom` - Routing
- `react` - React framework

Install if missing:
\`\`\`bash
npm install @supabase/supabase-js jspdf react-router-dom
\`\`\`

---

## 🔄 Future Enhancements

Potential improvements:
- [ ] Email receipt to customer
- [ ] SMS notification on receipt generation
- [ ] Receipt templates customization
- [ ] Bulk receipt generation
- [ ] Receipt series management (e.g., FY-specific)
- [ ] Image embedding in PDF (signature/stamp)
- [ ] Receipt editing functionality
- [ ] Export receipts to Excel/CSV
- [ ] Receipt analytics dashboard

---

## 📞 Support

For issues or questions:
1. Check Supabase dashboard logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Check database connectivity

---

## ✅ Checklist

Before going live:

- [ ] Database table created in Supabase
- [ ] Environment variables configured
- [ ] Signature/stamp image uploaded
- [ ] Test receipt creation
- [ ] Test PDF generation
- [ ] Test search functionality
- [ ] Test filters
- [ ] Verify receipt number auto-increment
- [ ] Test delete functionality
- [ ] Review RLS policies for security

---

**Created by**: Gautam Motors Development Team
**Last Updated**: December 2024
**Version**: 1.0.0
