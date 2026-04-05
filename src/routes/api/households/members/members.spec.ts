import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { GET } from './+server';

describe('GET /api/households/members', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    async function seedOwnerAndMember(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare("INSERT INTO users (id, email, name) VALUES ('owner-1', 'owner@example.com', 'Owner')")
            .run();
        await pair.first
            .prepare("INSERT INTO users (id, email, name) VALUES ('member-1', 'member@example.com', 'Member')")
            .run();
        await pair.first
            .prepare("INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'owner-1', 'Family')")
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_memberships (user_id, household_id, role, created_at) VALUES ('owner-1', 'house-1', 'owner', datetime('now', '-1 day'))"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_memberships (user_id, household_id, role, created_at) VALUES ('member-1', 'house-1', 'member', datetime('now'))"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'owner-1', datetime('now', '+7 day'))"
            )
            .run();
    }

    function authHeaders(): Record<string, string> {
        return {
            cookie: 'session=sess-1'
        };
    }

    it('should list household members for owner', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedOwnerAndMember(pair);

        const response = await GET({
            request: new Request('http://localhost/api/households/members', {
                headers: authHeaders()
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        const body = (await response.json()) as {
            members: Array<{ userId: string; email: string; name: string; role: string; joinedAt: string }>;
        };

        expect(response.status).toBe(200);
        expect(body.members).toHaveLength(2);
        expect(body.members[0]).toMatchObject({
            userId: 'owner-1',
            email: 'owner@example.com',
            name: 'Owner',
            role: 'owner'
        });
        expect(body.members[0].joinedAt).toContain('T');
        expect(body.members[0].joinedAt.endsWith('Z')).toBe(true);
    });

    it('should return 403 for unauthenticated request', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET({
            request: new Request('http://localhost/api/households/members'),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(403);
    });
});
