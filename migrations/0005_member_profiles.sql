PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS member_profiles (
    user_id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    allergies TEXT NOT NULL DEFAULT '[]',
    textures TEXT NOT NULL DEFAULT '[]',
    safe_foods TEXT NOT NULL DEFAULT '[]',
    dislikes TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_household ON member_profiles(household_id);

CREATE TABLE IF NOT EXISTS household_settings (
    household_id TEXT PRIMARY KEY,
    sync_profiles_enabled INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);
