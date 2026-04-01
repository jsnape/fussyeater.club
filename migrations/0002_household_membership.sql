CREATE TABLE IF NOT EXISTS households (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS household_members (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    display_name TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_utc TEXT NOT NULL,
    FOREIGN KEY (household_id) REFERENCES households(id)
);

CREATE INDEX IF NOT EXISTS idx_household_members_email ON household_members(user_email);
CREATE INDEX IF NOT EXISTS idx_household_members_household ON household_members(household_id);
