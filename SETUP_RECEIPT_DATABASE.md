# Payment Receipt System - Database Setup

## Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com/project/gbcncisbxiuzkrazbyew
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema
1. Copy the entire content from `database/payment_receipts_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify Setup
Run this query to verify:
```sql
SELECT get_next_receipt_number();
```
You should see `GM01` as the result.

### Step 4: Test the System
1. Open your dashboard: http://localhost:3000/dashboard
2. Click "🧾 Create Receipt" in the sidebar
3. The receipt number should auto-populate as `GM01`
4. Fill in the form and click "Save & Download PDF"

## That's it! 🎉

Your payment receipt system is now fully operational.

## Features Available:
- ✅ Auto-generated receipt numbers (GM01, GM02, GM03...)
- ✅ Professional PDF generation
- ✅ Search receipts by customer name, mobile, car model
- ✅ Filter by payment mode, car model, date range
- ✅ View, edit, delete receipts
- ✅ Amount converted to Indian words format

## Troubleshooting

### If you see "Failed to fetch receipt number"
- Check Supabase connection in browser console
- Verify the SQL schema was executed successfully
- Check if RLS policies are enabled

### If PDF download doesn't work
- Check browser console for errors
- Ensure all required fields are filled

## Database Credentials (Already Configured)
- **Supabase URL**: https://gbcncisbxiuzkrazbyew.supabase.co
- **Config File**: `src/config/supabaseClient.ts` (hardcoded from backend .env)
