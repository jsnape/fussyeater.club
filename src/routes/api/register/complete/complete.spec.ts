import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { POST } from './+server';

describe('POST /api/register/complete', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    function buildRequest(body: unknown, withCsrf = true): Request {
        const headers: Record<string, string> = {
            'content-type': 'application/json'
        };

        if (withCsrf) {
            headers.cookie = 'csrf-token=test-csrf';
            headers['x-csrf-token'] = 'test-csrf';
        }

        return new Request('http://localhost/api/register/complete', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
    }

    it('should return 404 when registration feature is disabled', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await POST({
            request: buildRequest({
                name: 'Taylor',
                email: 'taylor@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                householdAction: 'create',
                householdName: 'Taylor Family',
                idempotencyKey: 'idem-disabled'
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'false' } }
        } as never);

        expect(response.status).toBe(404);
    });

    it('should enforce csrf validation', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await POST({
            request: buildRequest(
                {
                    name: 'Taylor',
                    email: 'taylor@example.com',
                    password: 'Password123',
                    confirmPassword: 'Password123',
                    householdAction: 'create',
                    householdName: 'Taylor Family',
                    idempotencyKey: 'idem-no-csrf'
                },
                false
            ),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ message: 'CSRF verification failed' });
    });

    it('should replay the original response for duplicate idempotency keys', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const payload = {
            name: 'Taylor',
            email: 'taylor@example.com',
            password: 'Password123',
            confirmPassword: 'Password123',
            householdAction: 'create' as const,
            householdName: 'Taylor Family',
            idempotencyKey: 'idem-register-1'
        };

        const firstResponse = await POST({
            request: buildRequest(payload),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);
        const firstBody = await firstResponse.json();

        const replayResponse = await POST({
            request: buildRequest(payload),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);
        const replayBody = await replayResponse.json();

        expect(firstResponse.status).toBe(201);
        expect(replayResponse.status).toBe(201);
        expect(replayBody).toEqual(firstBody);
    });

    it('should return 409 when duplicate idempotency request is in progress', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                `INSERT INTO idempotency_keys (idempotency_key, endpoint, user_id, result_status, result_body)
 VALUES ('idem-pending', '/api/register/complete', 'anonymous:taylor@example.com', 0, '{}')`
            )
            .run();

        const response = await POST({
            request: buildRequest({
                name: 'Taylor',
                email: 'taylor@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                householdAction: 'create',
                householdName: 'Taylor Family',
                idempotencyKey: 'idem-pending'
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toEqual({ message: 'Duplicate request in progress' });
    });

    it('should reject mismatched confirm password', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await POST({
            request: buildRequest({
                name: 'Taylor',
                email: 'taylor@example.com',
                password: 'Password123',
                confirmPassword: 'Password456',
                householdAction: 'create',
                householdName: 'Taylor Family',
                idempotencyKey: 'idem-register-mismatch'
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ message: 'Validation failed' });
    });

    it('should return 410 for invalid join intent token', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await POST({
            request: buildRequest({
                name: 'Taylor',
                householdAction: 'join',
                joinIntentToken: 'missing-token',
                idempotencyKey: 'idem-join-missing',
                email: 'taylor@example.com',
                password: 'Password123',
                confirmPassword: 'Password123'
            }),
            platform: { env: { DB: pair.first, AUTH_REGISTRATION_V2_ENABLED: 'true' } }
        } as never);

        expect(response.status).toBe(410);
        await expect(response.json()).resolves.toEqual({
            message: 'Join invitation is no longer valid'
        });
    });
});
