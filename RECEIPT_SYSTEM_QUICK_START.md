# Payment Receipt System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js jspdf
```

### Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Where to find these values:**
   - Login to https://supabase.com/dashboard
   - Go to your project → Settings → API
   - Copy "Project URL" and "anon/public" key

### Step 3: Setup Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire content from `database/payment_receipts_schema.sql`
3. Paste and click "Run"
4. Verify table creation:
   ```sql
   SELECT * FROM payment_receipts LIMIT 1;
   ```

### Step 4: Add Signature/Stamp Image

Place your signature and stamp image at:
```
public/Website-Images/signandstamp.jpg
```

**Image specs:**
- Format: JPG (or PNG/WEBP)
- Recommended size: 200x100 pixels
- Contains: Signature + Company Stamp

### Step 5: Start the Application

```bash
npm start
```

### Step 6: Test the System

1. Navigate to: http://localhost:3000/dashboard
2. Click "Create Receipt" in sidebar
3. Fill in sample data:
   - Customer Name: Test Customer
   - Mobile: 9876543210
   - Car Model: Select any
   - Amount: 50000
   - Payment Mode: Cash
4. Click "Save Receipt"
5. Go to "Manage Receipts" to view

---

## 📍 Navigation

After setup, access receipts from dashboard:

| Menu Item | URL | Purpose |
|-----------|-----|---------|
| 🧾 Create Receipt | `/dashboard/receipt/new` | Create new receipts |
| 📋 Manage Receipts | `/dashboard/receipts` | View, search, download, delete |

---

## 🎯 Key Features

✅ **Auto-generated receipt numbers** (GM01, GM02, GM03...)
✅ **Professional PDF download** with company branding
✅ **Search & filter** by customer, mobile, car model
✅ **Amount in words** (Indian format)
✅ **Secure storage** in Supabase
✅ **Mobile responsive** design

---

## 🔧 Troubleshooting

### Error: "Module not found: supabaseClient"
**Fix:** Make sure you've created `.env` file with Supabase credentials

### Error: "Failed to fetch receipts"
**Fix:**
1. Check Supabase URL and key in `.env`
2. Verify database table was created
3. Check Supabase dashboard → Database → Tables

### Receipt number not incrementing
**Fix:**
```sql
-- Run this in Supabase SQL Editor
SELECT get_next_receipt_number();
```
Should return "GM01" or next number

### PDF not downloading
**Fix:** Check browser console for errors. Ensure jspdf is installed:
```bash
npm install jspdf
```

---

## 📊 Database Structure

```
payment_receipts
├── id (UUID, Primary Key)
├── receipt_number (VARCHAR, Unique) ← Auto-generated
├── receipt_date (DATE)
├── customer_name (VARCHAR)
├── customer_address (TEXT)
├── mobile_number (VARCHAR)
├── car_model (VARCHAR)
├── sales_executive_name (VARCHAR)
├── receipt_amount (DECIMAL)
├── payment_mode (VARCHAR)
├── hypothecated_to (VARCHAR, Optional)
├── remarks (TEXT, Optional)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

## 🎨 Customization

### Change Receipt Number Format

Edit `database/payment_receipts_schema.sql`, line 73:
```sql
-- Current: GM01, GM02, GM03...
next_receipt_number := 'GM' || LPAD(next_number::TEXT, 2, '0');

-- Change to: RCPT001, RCPT002...
next_receipt_number := 'RCPT' || LPAD(next_number::TEXT, 3, '0');
```

### Add More Payment Modes

Edit `src/components/dashboard/PaymentReceipt.tsx`, line 26:
```typescript
const paymentModes = [
  'Cash',
  'Cheque',
  'Online Transfer',
  'UPI',
  'Card',
  'RTGS/NEFT',
  'DD' // Add new mode
];
```

### Modify PDF Layout

Edit `src/utils/receiptPdfGenerator.ts` to customize:
- Colors (lines 59-62)
- Logo position
- Font sizes
- Layout sections

---

## 📱 Usage Examples

### Creating a Receipt
```
1. Fill customer details
2. Select car model from dropdown
3. Enter payment amount
4. Choose payment mode
5. Add hypothecation if loan
6. Click "Save Receipt"
```

### Searching Receipts
```
Search bar accepts:
- Customer name: "John Doe"
- Mobile: "9876543210"
- Car model: "Wagon-R"
- Receipt number: "GM01"
```

### Filtering Receipts
```
Filters available:
- Car Model dropdown
- Payment Mode dropdown
- From Date picker
- To Date picker
- "Clear Filters" button
```

---

## 🔐 Security Notes

**RLS Policies:** Receipts table has Row Level Security enabled
- Current: Public read, authenticated write
- **Recommended:** Restrict based on user roles

**To restrict access:**
1. Go to Supabase → Authentication → Policies
2. Modify `payment_receipts` policies
3. Add user role checks

---

## 📈 Analytics

View receipt statistics:
```javascript
import receiptService from './services/receiptService';

const stats = await receiptService.getReceiptStats();
console.log(stats);
// {
//   totalReceipts: 25,
//   totalAmount: 1250000,
//   paymentModes: { Cash: 10, UPI: 8, Cheque: 7 },
//   recentReceipts: [...]
// }
```

---

## ✅ Verification Checklist

Before going live:

- [ ] Supabase credentials in `.env`
- [ ] Database table created
- [ ] Test receipt creation works
- [ ] PDF download works
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Delete confirmation works
- [ ] Signature image added
- [ ] Mobile responsive checked
- [ ] Receipt numbers increment correctly

---

## 📞 Need Help?

1. **Supabase Issues:** Check https://supabase.com/docs
2. **PDF Issues:** Check jspdf docs https://github.com/parallax/jsPDF
3. **General:** Review `PAYMENT_RECEIPT_SETUP.md` for detailed guide

---

**System Ready!** 🎉

You can now create professional payment receipts for Gautam Motors customers.
