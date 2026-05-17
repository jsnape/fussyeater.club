-- Dependent profiles: household members without their own user accounts (e.g. children).
CREATE TABLE IF NOT EXISTS dependent_profiles (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    name TEXT NOT NULL,
    allergies TEXT NOT NULL DEFAULT '[]',
    textures TEXT NOT NULL DEFAULT '[]',
    safe_foods TEXT NOT NULL DEFAULT '[]',
    dislikes TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dependent_profiles_household ON dependent_profiles(household_id);
