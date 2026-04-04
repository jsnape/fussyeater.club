import { hashPassword, nowIso, type DbLike } from './db';

export type RegisterCompleteInput = {
	name: string;
	email?: string;
	password?: string;
	householdAction: 'create' | 'join';
	householdName?: string;
	joinIntentToken?: string;
	authUserId?: string | null;
	authEmail?: string | null;
	socialProvider?: 'microsoft' | null;
};

export type RegisterCompleteResult = {
	userId: string;
	householdId: string;
	actionApplied: 'create' | 'join';
};

type JoinIntentRow = {
	token: string;
	invite_id: string;
	household_id: string;
	expires_at: string;
	consumed_at: string | null;
	issued_for_user_id: string | null;
};

async function ensureUser(
	db: DbLike,
	input: RegisterCompleteInput
): Promise<{ userId: string; email: string | null }> {
	if (input.authUserId) {
		const existing = await db
			.prepare('SELECT id, email FROM users WHERE id = ?1')
			.bind(input.authUserId)
			.first<{ id: string; email: string | null }>();
		if (existing) {
			return { userId: existing.id, email: existing.email };
		}

		if (!input.authEmail && !input.email) {
			throw new Error('UNAUTHENTICATED_SOCIAL_CONTINUATION');
		}

		await db
			.prepare(
				`INSERT INTO users (id, email, name, auth_provider)
 VALUES (?1, ?2, ?3, ?4)`
			)
			.bind(
				input.authUserId,
				input.authEmail ?? input.email ?? null,
				input.name.trim(),
				'microsoft'
			)
			.run();

		return { userId: input.authUserId, email: input.authEmail ?? input.email ?? null };
	}

	const email = input.email?.trim().toLowerCase();
	if (!email || !input.password) {
		throw new Error('INVALID_REGISTRATION_INPUT');
	}

	const existingByEmail = await db
		.prepare('SELECT id FROM users WHERE email = ?1')
		.bind(email)
		.first<{ id: string }>();
	if (existingByEmail) {
		throw new Error('GENERIC_AUTH_FAILURE');
	}

	const userId = crypto.randomUUID();
	const passwordHash = await hashPassword(input.password);
	await db
		.prepare(
			`INSERT INTO users (id, email, name, password_hash, auth_provider)
 VALUES (?1, ?2, ?3, ?4, 'password')`
		)
		.bind(userId, email, input.name.trim(), passwordHash)
		.run();

	return { userId, email };
}

export async function completeRegistration(
	db: DbLike,
	input: RegisterCompleteInput
): Promise<RegisterCompleteResult> {
	if (!input.name?.trim()) {
		throw new Error('INVALID_REGISTRATION_INPUT');
	}

	await db.exec('BEGIN IMMEDIATE');
	try {
		const { userId } = await ensureUser(db, input);

		const existingMembership = await db
			.prepare('SELECT household_id FROM household_memberships WHERE user_id = ?1')
			.bind(userId)
			.first<{ household_id: string }>();

		if (existingMembership) {
			if (input.householdAction === 'join' && input.joinIntentToken) {
				const joinIntent = await db
					.prepare('SELECT household_id, consumed_at FROM join_intents WHERE token = ?1')
					.bind(input.joinIntentToken)
					.first<{ household_id: string; consumed_at: string | null }>();
				if (
					joinIntent?.consumed_at &&
					joinIntent.household_id === existingMembership.household_id
				) {
					await db.exec('COMMIT');
					return {
						userId,
						householdId: existingMembership.household_id,
						actionApplied: 'join'
					};
				}
			}

			throw new Error('ALREADY_IN_HOUSEHOLD');
		}

		if (input.householdAction === 'create') {
			const householdName = input.householdName?.trim();
			if (!householdName) {
				throw new Error('INVALID_REGISTRATION_INPUT');
			}

			const householdId = crypto.randomUUID();
			await db
				.prepare(
					`INSERT INTO households (id, owner_user_id, name)
 VALUES (?1, ?2, ?3)`
				)
				.bind(householdId, userId, householdName)
				.run();

			await db
				.prepare(
					`INSERT INTO household_memberships (user_id, household_id, role)
 VALUES (?1, ?2, 'owner')`
				)
				.bind(userId, householdId)
				.run();

			await db.exec('COMMIT');
			return { userId, householdId, actionApplied: 'create' };
		}

		if (!input.joinIntentToken) {
			throw new Error('INVALID_REGISTRATION_INPUT');
		}

		const joinIntent = await db
			.prepare(
				`SELECT token, invite_id, household_id, expires_at, consumed_at, issued_for_user_id
 FROM join_intents
 WHERE token = ?1`
			)
			.bind(input.joinIntentToken)
			.first<JoinIntentRow>();

		if (!joinIntent) {
			throw new Error('JOIN_INTENT_INVALID');
		}

		if (joinIntent.issued_for_user_id && joinIntent.issued_for_user_id !== userId) {
			throw new Error('JOIN_INTENT_INVALID');
		}

		if (joinIntent.consumed_at) {
			const existing = await db
				.prepare('SELECT household_id FROM household_memberships WHERE user_id = ?1')
				.bind(userId)
				.first<{ household_id: string }>();
			if (existing?.household_id === joinIntent.household_id) {
				await db.exec('COMMIT');
				return { userId, householdId: joinIntent.household_id, actionApplied: 'join' };
			}
			throw new Error('JOIN_INTENT_EXPIRED');
		}

		if (new Date(joinIntent.expires_at).getTime() <= Date.now()) {
			throw new Error('JOIN_INTENT_EXPIRED');
		}

		const decrement = await db
			.prepare(
				`UPDATE household_invites
 SET remaining_uses = remaining_uses - 1,
 status = CASE WHEN remaining_uses - 1 <= 0 THEN 'exhausted' ELSE status END,
 last_redeemed_at = ?1,
 updated_at = ?1
 WHERE id = ?2
   AND revoked_at IS NULL
   AND expires_at > ?1
   AND remaining_uses > 0`
			)
			.bind(nowIso(), joinIntent.invite_id)
			.run();

		if ((decrement.meta?.changes ?? 0) !== 1) {
			throw new Error('INVITE_EXHAUSTED');
		}

		await db
			.prepare('UPDATE join_intents SET consumed_at = ?1 WHERE token = ?2')
			.bind(nowIso(), joinIntent.token)
			.run();

		await db
			.prepare(
				`INSERT INTO household_memberships (user_id, household_id, role)
 VALUES (?1, ?2, 'member')`
			)
			.bind(userId, joinIntent.household_id)
			.run();

		await db.exec('COMMIT');
		return { userId, householdId: joinIntent.household_id, actionApplied: 'join' };
	} catch (error) {
		await db.exec('ROLLBACK');
		throw error;
	}
}
