-- Complete fix for receipt number to start from GM500
-- Run this ENTIRE script in your Supabase SQL Editor

-- Step 1: Drop the existing function to clear any cache
DROP FUNCTION IF EXISTS get_next_receipt_number();

-- Step 2: Create the new function with GM500 starting point
CREATE OR REPLACE FUNCTION get_next_receipt_number()
RETURNS TEXT AS $$
DECLARE
  last_number INTEGER;
  next_number INTEGER;
  next_receipt_number TEXT;
BEGIN
  -- Get the last receipt number, ensuring it's at least 499
  SELECT GREATEST(
    COALESCE(
      MAX(CAST(SUBSTRING(receipt_number FROM 3) AS INTEGER)),
      499  -- Minimum value to ensure next number is 500
    ),
    499  -- Force minimum to be 499
  ) INTO last_number
  FROM payment_receipts
  WHERE receipt_number ~ '^GM[0-9]+$';

  -- Calculate next number (will be at least 500)
  next_number := last_number + 1;

  -- Format with 3 digits padding (GM500, GM501, etc.)
  next_receipt_number := 'GM' || LPAD(next_number::TEXT, 3, '0');

  RETURN next_receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Test the function (should return GM500 if no receipts exist)
SELECT get_next_receipt_number() as next_receipt_number;

-- Step 4: If you have existing receipts numbered GM01, GM02, GM03 etc.
-- and want to renumber them to start from GM500, uncomment the following:

/*
DO $$
DECLARE
  receipt_record RECORD;
  new_number INTEGER := 500;
BEGIN
  -- Loop through all existing receipts in creation order
  FOR receipt_record IN
    SELECT id, receipt_number
    FROM payment_receipts
    ORDER BY created_at ASC
  LOOP
    -- Update each receipt with new number starting from GM500
    UPDATE payment_receipts
    SET receipt_number = 'GM' || LPAD(new_number::TEXT, 3, '0')
    WHERE id = receipt_record.id;

    new_number := new_number + 1;
  END LOOP;

  RAISE NOTICE 'Successfully renumbered % receipts starting from GM500', new_number - 500;
END $$;
*/

-- Step 5: Verify the results
SELECT
  receipt_number,
  customer_name,
  created_at
FROM payment_receipts
ORDER BY created_at DESC
LIMIT 10;
