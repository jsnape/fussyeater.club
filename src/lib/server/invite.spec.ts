import { afterEach, describe, expect, it } from 'vitest';
import { createHouseholdInvite, listHouseholdInvites, redeemInviteCode } from './invite';
import { createTestDbPair } from './test-db';

describe('invite service', () => {
	const pairs: Array<ReturnType<typeof createTestDbPair>> = [];
	afterEach(() => {
		for (const pair of pairs.splice(0)) {
			pair.cleanup();
		}
	});

	it('should list masked invite codes only', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		const { first } = pair;
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('owner-1', 'Owner', 'owner@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'owner-1', 'Family Home')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-1', 'house-1', 'ABCDEFGH', 'active', datetime('now', '+1 day'), 3, 3, 'owner-1')"
			)
			.run();

		const invites = await listHouseholdInvites(first, 'house-1');
		expect(invites).toHaveLength(1);
		expect(invites[0].codeMasked).toBe('ABC…FGH');
		expect(invites[0]).not.toHaveProperty('code');
	});

	it('should fail redeem for exhausted invite', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		const { first } = pair;
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('owner-2', 'Owner', 'owner2@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO households (id, owner_user_id, name) VALUES ('house-2', 'owner-2', 'Family Home')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-2', 'house-2', 'EXHAUST1', 'exhausted', datetime('now', '+1 day'), 1, 0, 'owner-2')"
			)
			.run();

		await expect(redeemInviteCode(first, 'EXHAUST1', null)).rejects.toThrow(
			'INVITE_NOT_JOINABLE'
		);
	});

	it('should regenerate invite and revoke prior active links', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		const { first } = pair;
		await first
			.prepare(
				"INSERT INTO users (id, name, email) VALUES ('owner-3', 'Owner', 'owner3@example.com')"
			)
			.run();
		await first
			.prepare(
				"INSERT INTO households (id, owner_user_id, name) VALUES ('house-3', 'owner-3', 'Family Home')"
			)
			.run();
		await createHouseholdInvite(first, 'house-3', 'owner-3', 2, 7, false);
		await createHouseholdInvite(first, 'house-3', 'owner-3', 2, 7, true);

		const revokedCount = await first
			.prepare(
				"SELECT COUNT(*) as count FROM household_invites WHERE household_id = 'house-3' AND status = 'revoked'"
			)
			.first<{ count: number }>();
		expect(revokedCount?.count).toBe(1);
	});
});
