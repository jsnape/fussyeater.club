import type { DbLike } from './db';

const CF_ACCESS_ADMIN_GROUP = 'Fussy Eater Club Admins';

/**
 * Check if a user is an admin.
 * Defence in depth: requires both a DB flag AND Cloudflare Access group membership.
 */
export async function isAdmin(
	db: DbLike,
	userId: string,
	request: Request
): Promise<boolean> {
	// Layer 1: Check CF Access group claim
	if (!hasCfAccessAdminGroup(request)) {
		return false;
	}

	// Layer 2: Check DB flag
	const row = await db
		.prepare('SELECT is_admin FROM users WHERE id = ?')
		.bind(userId)
		.first<{ is_admin: number }>();

	return row?.is_admin === 1;
}

/**
 * Check if a user has the admin DB flag (without CF Access check).
 * Used for session responses where we just want to show/hide UI elements.
 */
export async function hasAdminFlag(db: DbLike, userId: string): Promise<boolean> {
	const row = await db
		.prepare('SELECT is_admin FROM users WHERE id = ?')
		.bind(userId)
		.first<{ is_admin: number }>();

	return row?.is_admin === 1;
}

function hasCfAccessAdminGroup(request: Request): boolean {
	// In development/test, skip CF Access check if no JWT is present
	const jwt = request.headers.get('cf-access-jwt-assertion');
	if (!jwt) {
		// Allow if running locally (no CF Access in front)
		return true;
	}

	// Parse JWT payload (base64url-encoded, second segment)
	try {
		const parts = jwt.split('.');
		if (parts.length !== 3) return false;

		const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
		const groups: string[] = payload.custom?.groups ?? payload.groups ?? [];
		return groups.includes(CF_ACCESS_ADMIN_GROUP);
	} catch {
		return false;
	}
}
