import type { DbLike } from './db';
import { nowIso } from './db';

export type AllergyEntry = {
	ingredient: string;
	severity: 'severe' | 'moderate' | 'mild';
};

export type MemberProfileRow = {
	userId: string;
	householdId: string;
	name: string;
	role: string;
	allergies: string;
	textures: string;
	safeFoods: string;
	dislikes: string;
};

export type MemberProfile = {
	userId: string;
	name: string;
	role: string;
	allergies: AllergyEntry[];
	textures: string[];
	safeFoods: string[];
	dislikes: string[];
};

export type SaveProfileInput = {
	allergies: AllergyEntry[];
	textures: string[];
	safeFoods: string[];
	dislikes: string[];
};

export type HouseholdSettingsRow = {
	syncProfilesEnabled: number;
};

function parseJsonColumn<T>(raw: string): T {
	try {
		return JSON.parse(raw) as T;
	} catch {
		return [] as unknown as T;
	}
}

export async function getProfilesForHousehold(
	db: DbLike,
	householdId: string
): Promise<MemberProfile[]> {
	const rows = await db
		.prepare(
			`SELECT
				mp.user_id AS userId,
				u.name AS name,
				hm.role AS role,
				mp.allergies AS allergies,
				mp.textures AS textures,
				mp.safe_foods AS safeFoods,
				mp.dislikes AS dislikes
			FROM member_profiles mp
			JOIN users u ON u.id = mp.user_id
			JOIN household_memberships hm ON hm.user_id = mp.user_id AND hm.household_id = mp.household_id
			WHERE mp.household_id = ?1
			ORDER BY u.name ASC`
		)
		.bind(householdId)
		.all<MemberProfileRow>();

	return (rows.results ?? []).map((row) => ({
		userId: row.userId,
		name: row.name ?? '',
		role: row.role ?? 'member',
		allergies: parseJsonColumn<AllergyEntry[]>(row.allergies),
		textures: parseJsonColumn<string[]>(row.textures),
		safeFoods: parseJsonColumn<string[]>(row.safeFoods),
		dislikes: parseJsonColumn<string[]>(row.dislikes)
	}));
}

export async function getProfileForMember(
	db: DbLike,
	userId: string,
	householdId: string
): Promise<MemberProfile | null> {
	const row = await db
		.prepare(
			`SELECT
				mp.user_id AS userId,
				u.name AS name,
				hm.role AS role,
				mp.allergies AS allergies,
				mp.textures AS textures,
				mp.safe_foods AS safeFoods,
				mp.dislikes AS dislikes
			FROM member_profiles mp
			JOIN users u ON u.id = mp.user_id
			JOIN household_memberships hm ON hm.user_id = mp.user_id AND hm.household_id = mp.household_id
			WHERE mp.user_id = ?1 AND mp.household_id = ?2`
		)
		.bind(userId, householdId)
		.first<MemberProfileRow>();

	if (!row) return null;

	return {
		userId: row.userId,
		name: row.name ?? '',
		role: row.role ?? 'member',
		allergies: parseJsonColumn<AllergyEntry[]>(row.allergies),
		textures: parseJsonColumn<string[]>(row.textures),
		safeFoods: parseJsonColumn<string[]>(row.safeFoods),
		dislikes: parseJsonColumn<string[]>(row.dislikes)
	};
}

export async function saveProfile(
	db: DbLike,
	userId: string,
	householdId: string,
	input: SaveProfileInput
): Promise<void> {
	const now = nowIso();
	await db
		.prepare(
			`INSERT INTO member_profiles (user_id, household_id, allergies, textures, safe_foods, dislikes, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)
			ON CONFLICT(user_id) DO UPDATE SET
				household_id = excluded.household_id,
				allergies = excluded.allergies,
				textures = excluded.textures,
				safe_foods = excluded.safe_foods,
				dislikes = excluded.dislikes,
				updated_at = excluded.updated_at`
		)
		.bind(
			userId,
			householdId,
			JSON.stringify(input.allergies),
			JSON.stringify(input.textures),
			JSON.stringify(input.safeFoods),
			JSON.stringify(input.dislikes),
			now
		)
		.run();
}

export async function getHouseholdSettings(
	db: DbLike,
	householdId: string
): Promise<{ syncProfilesEnabled: boolean }> {
	const row = await db
		.prepare(`SELECT sync_profiles_enabled AS syncProfilesEnabled FROM household_settings WHERE household_id = ?1`)
		.bind(householdId)
		.first<HouseholdSettingsRow>();

	return { syncProfilesEnabled: row?.syncProfilesEnabled === 1 };
}

export async function updateHouseholdSettings(
	db: DbLike,
	householdId: string,
	syncProfilesEnabled: boolean
): Promise<void> {
	const now = nowIso();
	await db
		.prepare(
			`INSERT INTO household_settings (household_id, sync_profiles_enabled, updated_at)
			VALUES (?1, ?2, ?3)
			ON CONFLICT(household_id) DO UPDATE SET
				sync_profiles_enabled = excluded.sync_profiles_enabled,
				updated_at = excluded.updated_at`
		)
		.bind(householdId, syncProfilesEnabled ? 1 : 0, now)
		.run();
}

const VALID_SEVERITIES = new Set(['severe', 'moderate', 'mild']);

export function validateProfileInput(
	input: unknown
): { valid: true; data: SaveProfileInput } | { valid: false; error: string } {
	if (!input || typeof input !== 'object') {
		return { valid: false, error: 'Request body is required' };
	}

	const body = input as Record<string, unknown>;

	if (!Array.isArray(body.allergies)) {
		return { valid: false, error: 'allergies must be an array' };
	}

	for (const allergy of body.allergies) {
		if (!allergy || typeof allergy !== 'object') {
			return { valid: false, error: 'Each allergy must be an object with ingredient and severity' };
		}
		if (typeof allergy.ingredient !== 'string' || allergy.ingredient.trim().length === 0) {
			return { valid: false, error: 'Each allergy must have a non-empty ingredient' };
		}
		if (typeof allergy.severity !== 'string' || !VALID_SEVERITIES.has(allergy.severity)) {
			return { valid: false, error: `Invalid severity. Must be one of: ${[...VALID_SEVERITIES].join(', ')}` };
		}
	}

	if (!Array.isArray(body.textures) || !body.textures.every((t: unknown) => typeof t === 'string')) {
		return { valid: false, error: 'textures must be an array of strings' };
	}

	if (!Array.isArray(body.safeFoods) || !body.safeFoods.every((f: unknown) => typeof f === 'string')) {
		return { valid: false, error: 'safeFoods must be an array of strings' };
	}

	if (!Array.isArray(body.dislikes) || !body.dislikes.every((d: unknown) => typeof d === 'string')) {
		return { valid: false, error: 'dislikes must be an array of strings' };
	}

	return {
		valid: true,
		data: {
			allergies: body.allergies.map((a: { ingredient: string; severity: string }) => ({
				ingredient: a.ingredient.trim(),
				severity: a.severity as 'severe' | 'moderate' | 'mild'
			})),
			textures: body.textures.map((t: string) => t.trim()).filter(Boolean),
			safeFoods: body.safeFoods.map((f: string) => f.trim()).filter(Boolean),
			dislikes: body.dislikes.map((d: string) => d.trim()).filter(Boolean)
		}
	};
}
