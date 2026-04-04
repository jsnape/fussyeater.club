import { afterEach, describe, expect, it } from 'vitest';
import { completeRegistration } from './registration';
import { createTestDbPair } from './test-db';

describe('registration service', () => {
	const pairs: Array<ReturnType<typeof createTestDbPair>> = [];
	afterEach(() => {
		for (const pair of pairs.splice(0)) {
			pair.cleanup();
		}
	});

	it('should create household in create mode', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		const { first } = pair;
		const result = await completeRegistration(first, {
			name: 'Taylor',
			email: 'taylor@example.com',
			password: 'Password123',
			householdAction: 'create',
			householdName: 'Taylor Family'
		});

		expect(result.actionApplied).toBe('create');
		expect(result.userId).toBeTruthy();
		expect(result.householdId).toBeTruthy();
	});

	it('should allow idempotent replay for consumed join intent', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		const { first } = pair;
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('owner-4', 'Owner', 'owner4@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO households (id, owner_user_id, name) VALUES ('house-4', 'owner-4', 'Family Home')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-4', 'house-4', 'JOINABCD', 'active', datetime('now', '+1 day'), 2, 2, 'owner-4')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('user-4', 'User Four', 'user4@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO join_intents (token, invite_id, household_id, issued_for_user_id, expires_at) VALUES ('token-4', 'inv-4', 'house-4', 'user-4', datetime('now', '+1 day'))"
			)
			.run();

		const firstResult = await completeRegistration(first, {
			name: 'Alex',
			householdAction: 'join',
			joinIntentToken: 'token-4',
			authUserId: 'user-4',
			authEmail: 'user4@example.com',
			socialProvider: 'microsoft'
		});

		const secondResult = await completeRegistration(first, {
			name: 'Alex',
			householdAction: 'join',
			joinIntentToken: 'token-4',
			authUserId: 'user-4',
			authEmail: 'user4@example.com',
			socialProvider: 'microsoft'
		});

		expect(secondResult).toEqual(firstResult);
	});

	it('should allow only one success for parallel last-use joins', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		const { first, second } = pair;
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('owner-5', 'Owner', 'owner5@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO households (id, owner_user_id, name) VALUES ('house-5', 'owner-5', 'Family Home')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-5', 'house-5', 'RACE1234', 'active', datetime('now', '+1 day'), 1, 1, 'owner-5')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('user-5a', 'User Five A', 'user5a@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('user-5b', 'User Five B', 'user5b@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO join_intents (token, invite_id, household_id, issued_for_user_id, expires_at) VALUES ('token-5a', 'inv-5', 'house-5', 'user-5a', datetime('now', '+1 day'))"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO join_intents (token, invite_id, household_id, issued_for_user_id, expires_at) VALUES ('token-5b', 'inv-5', 'house-5', 'user-5b', datetime('now', '+1 day'))"
			)
			.run();

		const attempts = await Promise.allSettled([
			completeRegistration(first, {
				name: 'User A',
				householdAction: 'join',
				joinIntentToken: 'token-5a',
				authUserId: 'user-5a',
				authEmail: 'user5a@example.com',
				socialProvider: 'microsoft'
			}),
			completeRegistration(second, {
				name: 'User B',
				householdAction: 'join',
				joinIntentToken: 'token-5b',
				authUserId: 'user-5b',
				authEmail: 'user5b@example.com',
				socialProvider: 'microsoft'
			})
		]);

		const fulfilled = attempts.filter((attempt) => attempt.status === 'fulfilled');
		const rejected = attempts.filter((attempt) => attempt.status === 'rejected');

		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(Error);
		expect((rejected[0] as PromiseRejectedResult).reason.message).toMatch(
			/INVITE_EXHAUSTED|database is locked/
		);
	});
});
