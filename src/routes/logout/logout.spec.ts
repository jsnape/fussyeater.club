import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { POST } from './+server';

describe('POST /logout', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    it('should revoke active session and clear cookie on logout', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('user-1', 'user@example.com', 'User One')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'user-1', datetime('now', '+7 day'))"
            )
            .run();

        const cookies = {
            get: vi.fn().mockReturnValue('sess-1'),
            delete: vi.fn()
        };

        const response = await POST({
            request: new Request('http://localhost/logout', {
                method: 'POST',
                headers: {
                    cookie: 'session=sess-1; csrf-token=test-csrf',
                    'x-csrf-token': 'test-csrf',
                    'x-request-id': 'req-logout-0001'
                }
            }),
            cookies,
            platform: { env: { DB: pair.first } }
        } as never);

        expect(response.status).toBe(200);
        expect(response.headers.get('x-request-id')).toBe('req-logout-0001');
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(cookies.delete).toHaveBeenCalledWith('session', { path: '/' });

        const revoked = await pair.first
            .prepare("SELECT revoked_at FROM user_sessions WHERE id = 'sess-1'")
            .first<{ revoked_at: string | null }>();
        expect(revoked?.revoked_at).not.toBeNull();
    });

    it('should reject logout requests without csrf token', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const cookies = {
            get: vi.fn().mockReturnValue(null),
            delete: vi.fn()
        };

        const response = await POST({
            request: new Request('http://localhost/logout', {
                method: 'POST'
            }),
            cookies,
            platform: { env: { DB: pair.first } }
        } as never);

        expect(response.status).toBe(403);
        expect(response.headers.get('x-request-id')).toMatch(/^[A-Za-z0-9._-]{8,64}$/);
        await expect(response.json()).resolves.toEqual({ message: 'CSRF verification failed' });
    });
});
