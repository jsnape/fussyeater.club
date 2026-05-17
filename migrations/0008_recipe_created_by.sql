-- Add created_by column to track recipe ownership for edit authorization
ALTER TABLE recipes ADD COLUMN created_by TEXT REFERENCES users(id) ON DELETE SET NULL;
