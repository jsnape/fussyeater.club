import type { DbLike } from './db';

export type HouseholdMembership = {
	householdId: string;
	role: string;
};

export async function getMembership(
	db: DbLike,
	userId: string
): Promise<HouseholdMembership | null> {
	const membership = await db
		.prepare(
			`SELECT household_id as householdId, role
 FROM household_memberships
 WHERE user_id = ?1`
		)
		.bind(userId)
		.first<HouseholdMembership>();

	return membership;
}

export async function getOwnerHouseholdId(db: DbLike, userId: string): Promise<string | null> {
	const household = await db
		.prepare(
			`SELECT id
 FROM households
 WHERE owner_user_id = ?1
 LIMIT 1`
		)
		.bind(userId)
		.first<{ id: string }>();

	return household?.id ?? null;
}

export async function requireOwnerHouseholdId(db: DbLike, userId: string): Promise<string> {
	const householdId = await getOwnerHouseholdId(db, userId);
	if (!householdId) {
		throw new Error('FORBIDDEN_NOT_OWNER');
	}

	return householdId;
}
