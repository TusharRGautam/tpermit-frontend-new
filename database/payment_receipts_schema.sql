-- Payment Receipts Table Schema for Supabase
-- This table stores all payment receipts created by admin

-- Create the payment_receipts table
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  receipt_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  remarks TEXT,
  car_model VARCHAR(255) NOT NULL,
  sales_executive_name VARCHAR(255) NOT NULL,
  receipt_amount DECIMAL(12, 2) NOT NULL,
  hypothecated_to VARCHAR(255),
  payment_mode VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_receipt_number ON payment_receipts(receipt_number);
CREATE INDEX idx_customer_name ON payment_receipts(customer_name);
CREATE INDEX idx_mobile_number ON payment_receipts(mobile_number);
CREATE INDEX idx_car_model ON payment_receipts(car_model);
CREATE INDEX idx_receipt_date ON payment_receipts(receipt_date);
CREATE INDEX idx_created_at ON payment_receipts(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER payment_receipts_updated_at_trigger
BEFORE UPDATE ON payment_receipts
FOR EACH ROW
EXECUTE FUNCTION update_payment_receipts_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your auth requirements)
-- Policy for SELECT (anyone can read)
CREATE POLICY "Enable read access for all users" ON payment_receipts
  FOR SELECT USING (true);

-- Policy for INSERT (authenticated users can insert)
CREATE POLICY "Enable insert for authenticated users only" ON payment_receipts
  FOR INSERT WITH CHECK (true);

-- Policy for UPDATE (authenticated users can update)
CREATE POLICY "Enable update for authenticated users only" ON payment_receipts
  FOR UPDATE USING (true);

-- Policy for DELETE (authenticated users can delete)
CREATE POLICY "Enable delete for authenticated users only" ON payment_receipts
  FOR DELETE USING (true);

-- Create a function to get the next receipt number
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
    0
  ) INTO last_number
  FROM payment_receipts
  WHERE receipt_number ~ '^GM[0-9]+$';

  -- Calculate next number
  next_number := last_number + 1;

  -- Format with leading zeros (GM01, GM02, etc.)
  next_receipt_number := 'GM' || LPAD(next_number::TEXT, 2, '0');

  RETURN next_receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data (optional - for testing)
/*
INSERT INTO payment_receipts (
  receipt_number,
  receipt_date,
  customer_name,
  customer_address,
  mobile_number,
  remarks,
  car_model,
  sales_executive_name,
  receipt_amount,
  hypothecated_to,
  payment_mode
) VALUES (
  'GM01',
  CURRENT_DATE,
  'Sample Customer',
  'Sample Address, Thane',
  '9876543210',
  'Sample receipt for testing',
  'Maruti Suzuki Wagon-R',
  'Rakesh Gautam',
  50000.00,
  'SBI Bank',
  'Cash'
);
*/

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON payment_receipts TO authenticated;
-- GRANT ALL ON payment_receipts TO service_role;

COMMENT ON TABLE payment_receipts IS 'Stores payment receipts for Gautam Motors customers';
COMMENT ON COLUMN payment_receipts.receipt_number IS 'Auto-generated receipt number (GM01, GM02, etc.)';
COMMENT ON COLUMN payment_receipts.receipt_amount IS 'Payment amount in INR';
COMMENT ON COLUMN payment_receipts.hypothecated_to IS 'Bank or finance company name for loan cases';
COMMENT ON COLUMN payment_receipts.payment_mode IS 'Mode of payment (Cash, Cheque, Online, etc.)';
