-- Update the get_next_receipt_number function to start from GM500
-- Run this in your Supabase SQL Editor

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
