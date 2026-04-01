CREATE TABLE IF NOT EXISTS store_cupboards (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    items_json TEXT NOT NULL,
    updated_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_store_cupboards_household_updated ON store_cupboards(household_id, updated_utc DESC);
