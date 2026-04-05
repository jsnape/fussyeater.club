import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { POST as redeemInvite } from './invites/redeem/+server';
import { POST as completeRegistration } from './register/complete/+server';

describe('registration flow integration', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    it('should redeem invite then complete join registration in one end-to-end flow', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name, auth_provider) VALUES ('owner-1', 'owner@example.com', 'Owner', 'password')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'owner-1', 'Owner Household')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_invites (id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id) VALUES ('inv-1', 'house-1', 'JOINCODE', 'active', datetime('now', '+7 day'), 2, 2, 'owner-1')"
            )
            .run();

        const platform = {
            env: {
                DB: pair.first,
                AUTH_REGISTRATION_V2_ENABLED: 'true'
            }
        };

        const redeemResponse = await redeemInvite({
            request: new Request('http://localhost/api/invites/redeem', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    cookie: 'csrf-token=test-csrf',
                    'x-csrf-token': 'test-csrf',
                    'x-request-id': 'req-integration-redeem'
                },
                body: JSON.stringify({ code: 'JOINCODE' })
            }),
            platform
        } as never);

        expect(redeemResponse.status).toBe(200);
        expect(redeemResponse.headers.get('x-request-id')).toBe('req-integration-redeem');
        const redeemBody = (await redeemResponse.json()) as {
            joinIntentToken: string;
            remainingUses: number;
        };
        expect(redeemBody.joinIntentToken).toBeTruthy();
        expect(redeemBody.remainingUses).toBe(2);

        const joinResponse = await completeRegistration({
            request: new Request('http://localhost/api/register/complete', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    cookie: 'csrf-token=test-csrf',
                    'x-csrf-token': 'test-csrf',
                    'x-request-id': 'req-integration-register'
                },
                body: JSON.stringify({
                    name: 'Joiner',
                    email: 'joiner@example.com',
                    password: 'Password123',
                    confirmPassword: 'Password123',
                    householdAction: 'join',
                    joinIntentToken: redeemBody.joinIntentToken,
                    idempotencyKey: 'idem-join-flow-1'
                })
            }),
            platform
        } as never);

        expect(joinResponse.status).toBe(201);
        expect(joinResponse.headers.get('x-request-id')).toBe('req-integration-register');

        const membership = await pair.first
            .prepare(
                `SELECT u.email, uh.household_id as householdId
                 FROM users u
                 JOIN household_memberships uh ON uh.user_id = u.id
                 WHERE u.email = 'joiner@example.com'
                 LIMIT 1`
            )
            .first<{ email: string; householdId: string }>();

        expect(membership).toEqual({
            email: 'joiner@example.com',
            householdId: 'house-1'
        });

        const invite = await pair.first
            .prepare(
                "SELECT remaining_uses as remainingUses FROM household_invites WHERE id = 'inv-1'"
            )
            .first<{ remainingUses: number }>();

        expect(invite?.remainingUses).toBe(1);
    });
});
