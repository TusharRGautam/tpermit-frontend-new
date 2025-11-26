-- Check the current status of receipt numbers
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check what receipts currently exist
SELECT
  receipt_number,
  customer_name,
  car_model,
  created_at
FROM payment_receipts
ORDER BY created_at DESC;

-- 2. Test what the function returns
SELECT get_next_receipt_number() as "Next Receipt Number";

-- 3. Check the function definition
SELECT
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'get_next_receipt_number';

-- 4. Check if variant column exists
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'payment_receipts'
ORDER BY ordinal_position;
