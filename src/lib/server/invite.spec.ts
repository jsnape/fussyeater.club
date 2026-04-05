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

    it('should list only active invite plus up to 20 recent historical invites', async () => {
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
                `INSERT INTO household_invites (
                    id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id, updated_at
                 ) VALUES (
                    'active-invite', 'house-4', 'ACTIVE01', 'active', datetime('now', '+7 day'), 3, 2, 'owner-4', datetime('now', '+10 minute')
                 )`
            )
            .run();

        for (let i = 0; i < 25; i += 1) {
            await first
                .prepare(
                    `INSERT INTO household_invites (
                        id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id, revoked_at, updated_at
                     ) VALUES (
                        ?1, 'house-4', ?2, 'revoked', datetime('now', '+7 day'), 3, 3, 'owner-4', datetime('now', '-1 day'), datetime('now', ?3)
                     )`
                )
                .bind(`hist-${i}`, `HIST${(1000 + i).toString().slice(1)}`, `-${i} minute`)
                .run();
        }

        const invites = await listHouseholdInvites(first, 'house-4');
        expect(invites).toHaveLength(21);
        expect(invites[0]?.id).toBe('active-invite');
        expect(invites.filter((invite) => invite.status === 'active')).toHaveLength(1);
    });
});
