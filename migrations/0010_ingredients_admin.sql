PRAGMA foreign_keys = ON;

-- Add admin flag to users
ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

-- Canonical ingredient database
CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL COLLATE NOCASE,
    food_group TEXT NOT NULL,
    allergens TEXT NOT NULL DEFAULT '[]',
    plant_colour TEXT,
    aliases TEXT NOT NULL DEFAULT '[]',
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_ingredients_food_group ON ingredients(food_group);
CREATE INDEX IF NOT EXISTS idx_ingredients_plant_colour ON ingredients(plant_colour);
