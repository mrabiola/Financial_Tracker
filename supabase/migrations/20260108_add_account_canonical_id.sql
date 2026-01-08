ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS canonical_id UUID;

UPDATE accounts
SET canonical_id = id
WHERE canonical_id IS NULL;

ALTER TABLE accounts
ALTER COLUMN canonical_id SET DEFAULT uuid_generate_v4();

ALTER TABLE accounts
ALTER COLUMN canonical_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_user_canonical_id
ON accounts(user_id, canonical_id);
