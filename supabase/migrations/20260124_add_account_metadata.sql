-- Add metadata column to accounts table
-- This stores flexible, type-specific account details like:
-- - Property: address, lender, purchase price, property type
-- - Vehicle: make/model, year, VIN
-- - Investment: ticker, shares, custodian
-- - Credit Card: last 4, bank, limit, APR
-- - Loan: lender, interest rate, term, payoff date

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for efficient metadata queries if needed
CREATE INDEX IF NOT EXISTS idx_accounts_metadata ON accounts USING gin(metadata);
