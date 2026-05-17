-- Remove PII age_range column from member_profiles.
-- D1 supports ALTER TABLE DROP COLUMN on SQLite 3.35+.
ALTER TABLE member_profiles DROP COLUMN age_range;
