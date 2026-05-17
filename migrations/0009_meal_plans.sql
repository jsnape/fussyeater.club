PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    UNIQUE(household_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_household ON meal_plans(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(week_start);

CREATE TABLE IF NOT EXISTS meal_plan_entries (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    entry_date TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    recipe_id TEXT,
    custom_note TEXT,
    servings INTEGER DEFAULT 4,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
    UNIQUE(plan_id, entry_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_plan ON meal_plan_entries(plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_recipe ON meal_plan_entries(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_date ON meal_plan_entries(entry_date);
