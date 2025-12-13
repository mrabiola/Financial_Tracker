-- Add API integration fields to accounts table
-- This will support stock/crypto/real estate API integrations

-- Add new columns for API integration
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS asset_type TEXT,
ADD COLUMN IF NOT EXISTS api_symbol TEXT,
ADD COLUMN IF NOT EXISTS api_provider TEXT, -- 'yahoo', 'coinmarketcap', 'zillow', etc.
ADD COLUMN IF NOT EXISTS quantity DECIMAL(15,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_price DECIMAL(15,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_price_updated TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_update BOOLEAN DEFAULT false;

-- Add constraint for asset_type
ALTER TABLE accounts
ADD CONSTRAINT accounts_asset_type_check
CHECK (asset_type IN ('manual', 'stock', 'crypto', 'real_estate', 'etf', 'mutual_fund', 'bond', 'commodity'));

-- Create indexes for API fields
CREATE INDEX IF NOT EXISTS idx_accounts_api_symbol ON accounts(api_symbol);
CREATE INDEX IF NOT EXISTS idx_accounts_api_provider ON accounts(api_provider);
CREATE INDEX IF NOT EXISTS idx_accounts_asset_type ON accounts(asset_type);
CREATE INDEX IF NOT EXISTS idx_accounts_auto_update ON accounts(auto_update) WHERE auto_update = true;