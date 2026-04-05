import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { GET, POST } from './+server';

describe('/api/households/invites routes', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    async function seedOwnerSession(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
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
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'owner-1', datetime('now', '+7 day'))"
            )
            .run();
    }

    function authHeaders(withCsrf = true): Record<string, string> {
        const headers: Record<string, string> = {
            'content-type': 'application/json',
            cookie: 'session=sess-1'
        };
        if (withCsrf) {
            headers.cookie = 'session=sess-1; csrf-token=test-csrf';
            headers['x-csrf-token'] = 'test-csrf';
        }
        return headers;
    }

    it('should reject access when feature flag is disabled', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET({
            request: new Request('http://localhost/api/households/invites', {
                headers: authHeaders()
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'false' } }
        } as never);

        expect(response.status).toBe(404);
    });

    it('should require authentication for listing invites', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET({
            request: new Request('http://localhost/api/households/invites'),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ message: 'Forbidden' });
    });

    it('should create and replay invite creation with idempotency key', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedOwnerSession(pair);

        const requestBody = {
            maxUses: 3,
            expiresInDays: 7,
            regenerate: false,
            idempotencyKey: 'idem-household-invite-1'
        };

        const firstResponse = await POST({
            request: new Request('http://localhost/api/households/invites', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(requestBody)
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);
        const firstBody = await firstResponse.json();

        const replayResponse = await POST({
            request: new Request('http://localhost/api/households/invites', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(requestBody)
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);
        const replayBody = await replayResponse.json();

        expect(firstResponse.status).toBe(201);
        expect(replayResponse.status).toBe(201);
        expect(replayBody).toEqual(firstBody);
        expect(firstBody.code).toHaveLength(8);
    });

    it('should list masked invite codes for owner household', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedOwnerSession(pair);

        await pair.first
            .prepare(
                "INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-1', 'house-1', 'ABCDEFGH', 'active', datetime('now', '+7 day'), 3, 3, 'owner-1')"
            )
            .run();

        const response = await GET({
            request: new Request('http://localhost/api/households/invites', {
                headers: authHeaders()
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.invites).toHaveLength(1);
        expect(body.invites[0].codeMasked).toBe('ABC…FGH');
        expect(body.invites[0].code).toBeUndefined();
    });
});
