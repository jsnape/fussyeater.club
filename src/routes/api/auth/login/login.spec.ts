import { afterEach, describe, expect, it, vi } from 'vitest';
import { hashPassword } from '$lib/server/db';
import { createTestDbPair } from '$lib/server/test-db';
import { POST } from './+server';

describe('POST /api/auth/login', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    it('should reject requests without a valid csrf token', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const cookies = { set: vi.fn() };
        const response = await POST({
            request: new Request('http://localhost/api/auth/login', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email: 'user@example.com', password: 'Password123' })
            }),
            cookies,
            platform: { env: { DB: pair.first } }
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ message: 'CSRF verification failed' });
        expect(cookies.set).not.toHaveBeenCalled();
    });

    it('should create a session cookie for valid credentials', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const passwordHash = await hashPassword('Password123');
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name, password_hash, auth_provider) VALUES (?1, ?2, ?3, ?4, 'password')"
            )
            .bind('user-1', 'user@example.com', 'User One', passwordHash)
            .run();

        const cookies = { set: vi.fn() };
        const response = await POST({
            request: new Request('http://localhost/api/auth/login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    cookie: 'csrf-token=test-csrf',
                    'x-csrf-token': 'test-csrf'
                },
                body: JSON.stringify({ email: 'user@example.com', password: 'Password123' })
            }),
            cookies,
            platform: { env: { DB: pair.first } }
        } as never);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(cookies.set).toHaveBeenCalledTimes(1);
    });
});
