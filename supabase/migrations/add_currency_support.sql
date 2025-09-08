-- Migration to add multi-currency support with original value preservation

-- Add currency columns to account_snapshots table
ALTER TABLE account_snapshots 
ADD COLUMN IF NOT EXISTS original_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3),
ADD COLUMN IF NOT EXISTS entry_date TIMESTAMP WITH TIME ZONE;

-- Add currency columns to goals table
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS original_target_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS original_current_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(3),
ADD COLUMN IF NOT EXISTS target_currency VARCHAR(3),
ADD COLUMN IF NOT EXISTS entry_date TIMESTAMP WITH TIME ZONE;

-- Add user currency preference to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';

-- Create a currency_conversions table for audit trail
CREATE TABLE IF NOT EXISTS currency_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  exchange_rate DECIMAL(15,8) NOT NULL,
  conversion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'exchangerate-api'
);

-- Create index for currency conversions
CREATE INDEX IF NOT EXISTS idx_currency_conversions_user_id ON currency_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_conversions_date ON currency_conversions(conversion_date);

-- Enable RLS for currency_conversions
ALTER TABLE currency_conversions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for currency_conversions
CREATE POLICY "Users can view own conversions" ON currency_conversions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversions" ON currency_conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Migration function to populate original values for existing data
CREATE OR REPLACE FUNCTION migrate_existing_currency_data()
RETURNS void AS $$
BEGIN
  -- Migrate account_snapshots: copy existing values as original values
  UPDATE account_snapshots
  SET 
    original_value = value,
    original_currency = 'USD', -- Default assumption
    entry_date = created_at
  WHERE original_value IS NULL;
  
  -- Migrate goals: copy existing values as original values
  UPDATE goals
  SET
    original_target_amount = target_amount,
    original_current_amount = current_amount,
    original_currency = 'USD', -- Default assumption
    target_currency = 'USD',
    entry_date = created_at
  WHERE original_target_amount IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_existing_currency_data();

-- Drop the migration function after use
DROP FUNCTION IF EXISTS migrate_existing_currency_data();