CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    title TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    meals_json TEXT NOT NULL,
    created_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_household_created ON meal_plans(household_id, created_utc DESC);
