PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
id TEXT PRIMARY KEY,
email TEXT UNIQUE,
name TEXT NOT NULL,
password_hash TEXT,
auth_provider TEXT NOT NULL DEFAULT 'password',
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS households (
id TEXT PRIMARY KEY,
owner_user_id TEXT NOT NULL,
name TEXT COLLATE NOCASE NOT NULL,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
UNIQUE (owner_user_id, name)
);

CREATE TABLE IF NOT EXISTS household_memberships (
user_id TEXT PRIMARY KEY,
household_id TEXT NOT NULL,
role TEXT NOT NULL DEFAULT 'member',
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS household_invites (
id TEXT PRIMARY KEY,
household_id TEXT NOT NULL,
code TEXT COLLATE NOCASE NOT NULL UNIQUE,
status TEXT NOT NULL DEFAULT 'active',
expires_at TEXT NOT NULL,
max_uses INTEGER NOT NULL CHECK (max_uses >= 1),
remaining_uses INTEGER NOT NULL CHECK (remaining_uses >= 0),
revoked_at TEXT,
created_by_user_id TEXT NOT NULL,
last_redeemed_at TEXT,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_household_invites_household ON household_invites(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invites_status ON household_invites(status, expires_at, remaining_uses);
CREATE UNIQUE INDEX IF NOT EXISTS idx_household_invites_single_active
ON household_invites(household_id)
WHERE status = 'active' AND revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS join_intents (
token TEXT PRIMARY KEY,
invite_id TEXT NOT NULL,
household_id TEXT NOT NULL,
issued_for_user_id TEXT,
expires_at TEXT NOT NULL,
consumed_at TEXT,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (invite_id) REFERENCES household_invites(id) ON DELETE CASCADE,
FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
FOREIGN KEY (issued_for_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_join_intents_household ON join_intents(household_id);
CREATE INDEX IF NOT EXISTS idx_join_intents_expires ON join_intents(expires_at);

CREATE TABLE IF NOT EXISTS invite_redemption_audit (
id INTEGER PRIMARY KEY AUTOINCREMENT,
invite_id TEXT,
user_id TEXT,
outcome TEXT NOT NULL,
metadata TEXT,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (invite_id) REFERENCES household_invites(id) ON DELETE SET NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invite_redemption_audit_invite ON invite_redemption_audit(invite_id, created_at);

CREATE TABLE IF NOT EXISTS idempotency_keys (
	idempotency_key TEXT NOT NULL,
	endpoint TEXT NOT NULL,
	user_id TEXT NOT NULL,
	result_status INTEGER NOT NULL,
	result_body TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (idempotency_key, endpoint, user_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	revoked_at TEXT,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, expires_at);
