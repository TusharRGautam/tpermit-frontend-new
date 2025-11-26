# Quick Fix: Receipt Number Still Shows GM03

## Problem
You ran the SQL scripts but the receipt number still shows **GM03** instead of **GM500**.

## Why This Happens
You have existing receipts in the database (GM01, GM02, GM03), and the function calculates: `MAX(3) + 1 = 4 = GM04`.

## Solution (2 Minutes)

### Step 1: Open Supabase
1. Go to your Supabase dashboard
2. Click on **SQL Editor**

### Step 2: Run This Complete Fix

Copy and paste this **entire script** into the SQL Editor:

```sql
-- Complete fix for receipt number
DROP FUNCTION IF EXISTS get_next_receipt_number();

CREATE OR REPLACE FUNCTION get_next_receipt_number()
RETURNS TEXT AS $$
DECLARE
  last_number INTEGER;
  next_number INTEGER;
  next_receipt_number TEXT;
BEGIN
  SELECT GREATEST(
    COALESCE(
      MAX(CAST(SUBSTRING(receipt_number FROM 3) AS INTEGER)),
      499
    ),
    499
  ) INTO last_number
  FROM payment_receipts
  WHERE receipt_number ~ '^GM[0-9]+$';

  next_number := last_number + 1;
  next_receipt_number := 'GM' || LPAD(next_number::TEXT, 3, '0');

  RETURN next_receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Test it
SELECT get_next_receipt_number();
```

### Step 3: Click "RUN"

### Step 4: Check the Result
You should see: **GM500**

### Step 5: Refresh Your Browser
Press **Ctrl+F5** (or Cmd+Shift+R on Mac)

### Step 6: Test
Go to **Create Receipt** page - you should now see **GM500**!

---

## Alternative: Renumber Existing Receipts

If you want to renumber your existing receipts (GM01→GM500, GM02→GM501, etc.), add this at the end of the above script:

```sql
DO $$
DECLARE
  receipt_record RECORD;
  new_number INTEGER := 500;
BEGIN
  FOR receipt_record IN
    SELECT id FROM payment_receipts ORDER BY created_at ASC
  LOOP
    UPDATE payment_receipts
    SET receipt_number = 'GM' || LPAD(new_number::TEXT, 3, '0')
    WHERE id = receipt_record.id;
    new_number := new_number + 1;
  END LOOP;
END $$;
```

---

## Still Having Issues?

Run this diagnostic script to see what's happening:

```sql
-- Check current receipts
SELECT receipt_number, created_at FROM payment_receipts ORDER BY created_at;

-- Test the function
SELECT get_next_receipt_number();
```

Then share the output with your developer.
