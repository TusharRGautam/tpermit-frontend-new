-- Add variant column to payment_receipts table
-- Run this in your Supabase SQL Editor

ALTER TABLE payment_receipts
ADD COLUMN IF NOT EXISTS variant VARCHAR(100);

COMMENT ON COLUMN payment_receipts.variant IS 'Car variant (e.g., VXI, ZXI, LXI)';
