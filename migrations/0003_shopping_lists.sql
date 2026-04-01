CREATE TABLE IF NOT EXISTS shopping_lists (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    meal_plan_id TEXT NOT NULL,
    items_json TEXT NOT NULL,
    created_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_household_created
    ON shopping_lists(household_id, created_utc DESC);
