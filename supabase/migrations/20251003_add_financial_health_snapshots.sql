-- Create financial health snapshots table for diagnostic trend tracking
CREATE TABLE IF NOT EXISTS financial_health_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  breakdown JSONB DEFAULT '{}'::jsonb,
  inputs JSONB DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'diagnostic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_health_snapshots_user_id
  ON financial_health_snapshots(user_id);

CREATE INDEX IF NOT EXISTS idx_financial_health_snapshots_created_at
  ON financial_health_snapshots(created_at);

ALTER TABLE financial_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health snapshots" ON financial_health_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health snapshots" ON financial_health_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health snapshots" ON financial_health_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health snapshots" ON financial_health_snapshots
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_health_snapshots_updated_at
  BEFORE UPDATE ON financial_health_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
