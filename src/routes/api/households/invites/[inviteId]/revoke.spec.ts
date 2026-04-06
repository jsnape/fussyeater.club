import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { DELETE } from './+server';

describe('DELETE /api/households/invites/[inviteId]', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    async function seedOwnerAndInvite(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('owner-1', 'owner@example.com', 'Owner')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'owner-1', 'Family')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-1', 'house-1', 'ABCDEFGH', 'active', datetime('now', '+7 day'), 3, 3, 'owner-1')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'owner-1', datetime('now', '+7 day'))"
            )
            .run();
    }

    async function seedMemberSession(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('owner-2', 'owner2@example.com', 'Owner Two')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('member-1', 'member@example.com', 'Member')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO households (id, owner_user_id, name) VALUES ('house-2', 'owner-2', 'Family Two')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_memberships (user_id, household_id, role) VALUES ('member-1', 'house-2', 'member')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-member-1', 'member-1', datetime('now', '+7 day'))"
            )
            .run();
    }

    function authHeaders(): Record<string, string> {
        return {
            cookie: 'session=sess-1; csrf-token=test-csrf',
            'x-csrf-token': 'test-csrf'
        };
    }

    it('should require authentication', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await DELETE({
            request: new Request('http://localhost/api/households/invites/inv-1', {
                method: 'DELETE'
            }),
            params: { inviteId: 'inv-1' },
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(403);
    });

    it('should revoke an invite for owner household', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedOwnerAndInvite(pair);

        const response = await DELETE({
            request: new Request('http://localhost/api/households/invites/inv-1', {
                method: 'DELETE',
                headers: authHeaders()
            }),
            params: { inviteId: 'inv-1' },
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(204);

        const updated = await pair.first
            .prepare("SELECT status FROM household_invites WHERE id = 'inv-1'")
            .first<{ status: string }>();
        expect(updated?.status).toBe('revoked');
    });

    it('should return 403 when non-owner attempts to revoke', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedMemberSession(pair);

        const response = await DELETE({
            request: new Request('http://localhost/api/households/invites/inv-missing', {
                method: 'DELETE',
                headers: {
                    ...authHeaders(),
                    cookie: 'session=sess-member-1; csrf-token=test-csrf'
                }
            }),
            params: { inviteId: 'inv-missing' },
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(403);
    });
});
