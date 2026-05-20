-- Add attendance tracking columns to meal_plan_entries (denormalised)
-- absent_member_ids: JSON array of member IDs who are NOT eating this meal
-- guest_covers: number of additional guest servings
ALTER TABLE meal_plan_entries ADD COLUMN absent_member_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE meal_plan_entries ADD COLUMN guest_covers INTEGER NOT NULL DEFAULT 0;
