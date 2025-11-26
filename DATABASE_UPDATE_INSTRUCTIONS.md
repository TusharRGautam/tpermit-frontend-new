# Database Update Instructions

## Important: Run These SQL Scripts in Supabase

To complete the receipt number update and add variant support, you need to run the following SQL scripts in your Supabase SQL Editor.

### Step 1: Add Variant Column to Database

Run this SQL script in Supabase SQL Editor:

```sql
-- Add variant column to payment_receipts table
ALTER TABLE payment_receipts
ADD COLUMN IF NOT EXISTS variant VARCHAR(100);

COMMENT ON COLUMN payment_receipts.variant IS 'Car variant (e.g., VXI, ZXI, LXI)';
```

**File Location:** `database/add_variant_column.sql`

### Step 2: Update Receipt Number Function to Start from GM500

Run this SQL script in Supabase SQL Editor:

```sql
-- Update the get_next_receipt_number function to start from GM500
CREATE OR REPLACE FUNCTION get_next_receipt_number()
RETURNS TEXT AS $$
DECLARE
  last_number INTEGER;
  next_number INTEGER;
  next_receipt_number TEXT;
BEGIN
  -- Get the last receipt number
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(receipt_number FROM 3) AS INTEGER)),
    499  -- Start from 499 so next number will be 500
  ) INTO last_number
  FROM payment_receipts
  WHERE receipt_number ~ '^GM[0-9]+$';

  -- Calculate next number
  next_number := last_number + 1;

  -- Format with leading zeros (GM500, GM501, etc.) - 3 digits
  next_receipt_number := 'GM' || LPAD(next_number::TEXT, 3, '0');

  RETURN next_receipt_number;
END;
$$ LANGUAGE plpgsql;
```

**File Location:** `database/update_receipt_number_to_500.sql`

### Step 3: Verify the Changes

After running both scripts, test by:

1. Go to the "Create Receipt" page in your dashboard
2. Check that the receipt number shows **GM500** (or the next number if you already have receipts)
3. Select a car model and verify that variants appear in the dropdown
4. Create a test receipt and download the PDF
5. Verify that the PDF includes:
   - Logo in top left corner
   - Variant field (if selected)
   - Receipt number starting from GM500

## What Was Updated in the Code

### Frontend Changes:
1. ✅ Updated `PaymentReceipt.tsx` to include car variants dropdown
2. ✅ Updated `receiptService.js` to default to GM500 with 3-digit padding
3. ✅ Updated `receiptPdfGenerator.ts` to:
   - Add logo (L3.png) in top left corner
   - Include variant field in payment details
   - Support the new variant field

### Database Changes Required:
1. ⚠️ **Must run `add_variant_column.sql` in Supabase**
2. ⚠️ **Must run `update_receipt_number_to_500.sql` in Supabase**

## Troubleshooting

### ⚠️ If receipt number still shows GM03 (COMPLETE FIX):

The issue is likely that you have existing receipts (GM01, GM02, GM03) in the database, and the function is calculating the next number based on those.

**Solution: Run the Complete Fix Script**

1. Open Supabase SQL Editor
2. Run the script from `database/fix_receipt_number_complete.sql`
3. This script will:
   - Drop and recreate the function with proper logic
   - Force minimum starting number to 499 (so next = 500)
   - Optionally renumber existing receipts

**Option A: Keep existing receipts, start new ones from GM500**
- Just run the script as-is
- Existing receipts keep their numbers (GM01, GM02, GM03...)
- New receipts will start from GM500, GM501, etc.

**Option B: Renumber all existing receipts**
- Uncomment the section marked with `/* ... */` in the script
- This will renumber ALL existing receipts starting from GM500
- GM01 → GM500, GM02 → GM501, GM03 → GM502, etc.

**After running the script:**
1. Refresh your browser (Ctrl+F5)
2. Go to Create Receipt page
3. You should now see GM500 (or GM503 if you kept existing receipts)

### If variant field doesn't save:
- Make sure you ran the `add_variant_column.sql` script in Supabase
- Check that the column was added successfully by viewing the table structure

### If logo doesn't appear in PDF:
- Verify that the file exists at: `public/Website-Images/L3.png`
- Check browser console for any image loading errors
- The PDF will still generate without logo if image loading fails

## Next Steps

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Run `add_variant_column.sql`
4. Run `update_receipt_number_to_500.sql`
5. Test the receipt creation functionality
6. Generate a test PDF to verify all changes

---

**Note:** These database changes are one-time operations. Once completed, all new receipts will automatically start from GM500 and support the variant field.
