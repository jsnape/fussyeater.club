PRAGMA foreign_keys = ON;

WITH ranked_active_invites AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY household_id
            ORDER BY updated_at DESC, created_at DESC, id DESC
        ) AS row_number
    FROM household_invites
    WHERE status = 'active' AND revoked_at IS NULL
)
UPDATE household_invites
SET status = 'revoked',
    -- Migration-only cleanup: use SQLite CURRENT_TIMESTAMP; runtime writes use nowIso().
    revoked_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT id
    FROM ranked_active_invites
    WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_household_invites_single_active
ON household_invites(household_id)
WHERE status = 'active' AND revoked_at IS NULL;
