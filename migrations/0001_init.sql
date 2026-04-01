CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    ingredients_json TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 0,
    created_utc TEXT NOT NULL,
    updated_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipes_household ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_recipes_household_title ON recipes(household_id, title);
