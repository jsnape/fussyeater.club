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
});
