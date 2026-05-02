PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('full', 'reference')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    household_id TEXT,
    servings INTEGER,
    yield TEXT,
    prep_minutes INTEGER,
    cook_minutes INTEGER,
    ingredients TEXT NOT NULL DEFAULT '[]',
    method TEXT,
    source_reference TEXT,
    notes TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_recipes_type ON recipes(type);
CREATE INDEX IF NOT EXISTS idx_recipes_visibility ON recipes(visibility);
CREATE INDEX IF NOT EXISTS idx_recipes_household ON recipes(household_id);
