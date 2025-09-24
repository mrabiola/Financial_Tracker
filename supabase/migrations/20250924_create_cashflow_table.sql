-- Create cashflow table for tracking income and expenses
CREATE TABLE IF NOT EXISTS public.cashflow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  income JSONB DEFAULT '{}',
  expenses JSONB DEFAULT '{}',
  goals JSONB DEFAULT '{"savingsTarget": 20, "emergencyFund": 10000}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user per year
  CONSTRAINT unique_user_year UNIQUE (user_id, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cashflow_user_year ON public.cashflow(user_id, year);

-- Enable RLS (Row Level Security)
ALTER TABLE public.cashflow ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own cashflow data
CREATE POLICY "Users can view their own cashflow data" ON public.cashflow
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own cashflow data
CREATE POLICY "Users can insert their own cashflow data" ON public.cashflow
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own cashflow data
CREATE POLICY "Users can update their own cashflow data" ON public.cashflow
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own cashflow data
CREATE POLICY "Users can delete their own cashflow data" ON public.cashflow
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_cashflow_updated_at BEFORE UPDATE ON public.cashflow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();