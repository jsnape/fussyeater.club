import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { GET } from './+server';

describe('GET /api/auth/session', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    it('should return anonymous session shape when no session cookie is present', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET({
            request: new Request('http://localhost/api/auth/session'),
            platform: { env: { DB: pair.first, AUTH_MICROSOFT_OAUTH_ENABLED: 'false' } }
        } as never);

        expect(response.status).toBe(200);
        expect(response.headers.get('x-request-id')).toMatch(/^[A-Za-z0-9._-]{8,64}$/);
        await expect(response.json()).resolves.toEqual({
            user: null,
            featureFlags: { microsoftOAuthEnabled: false },
            canManageHousehold: false
        });
    });

    it('should return user session details when session cookie is valid', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name, auth_provider) VALUES ('user-1', 'user@example.com', 'User One', 'password')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'user-1', 'Family')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'user-1', datetime('now', '+7 day'))"
            )
            .run();

        const response = await GET({
            request: new Request('http://localhost/api/auth/session', {
                headers: { cookie: 'session=sess-1', 'x-request-id': 'req-session-0001' }
            }),
            platform: { env: { DB: pair.first, AUTH_MICROSOFT_OAUTH_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(200);
        expect(response.headers.get('x-request-id')).toBe('req-session-0001');
        await expect(response.json()).resolves.toEqual({
            user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'User One',
                authProvider: 'password'
            },
            featureFlags: { microsoftOAuthEnabled: true },
            canManageHousehold: true
        });
    });

    it('should keep authenticated sessions valid when registration rollout flag is off', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name, auth_provider) VALUES ('user-2', 'user2@example.com', 'User Two', 'password')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-2', 'user-2', datetime('now', '+7 day'))"
            )
            .run();

        const response = await GET({
            request: new Request('http://localhost/api/auth/session', {
                headers: { cookie: 'session=sess-2' }
            }),
            platform: {
                env: {
                    DB: pair.first,
                    AUTH_MICROSOFT_OAUTH_ENABLED: 'false',
                    AUTH_REGISTRATION_V2_ENABLED: 'false'
                }
            }
        } as never);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            user: {
                id: 'user-2',
                email: 'user2@example.com',
                name: 'User Two',
                authProvider: 'password'
            },
            featureFlags: { microsoftOAuthEnabled: false },
            canManageHousehold: false
        });
    });
});
