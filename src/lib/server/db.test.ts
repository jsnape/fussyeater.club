import { describe, expect, it } from 'vitest';
import { requireHouseholdId } from './db';

function createEvent(overrides?: {
    requireAccessAuth?: boolean;
    accessUserEmail?: string | null;
    householdId?: string | null;
    defaultHouseholdId?: string | undefined;
}) {
    return {
        locals: {
            accessUserEmail: overrides?.accessUserEmail ?? null,
            householdId: overrides?.householdId ?? null,
        },
        platform: {
            env: {
                REQUIRE_ACCESS_AUTH: overrides?.requireAccessAuth ? 'true' : 'false',
                DEFAULT_HOUSEHOLD_ID: overrides?.defaultHouseholdId,
            },
        },
    } as any;
}

describe('requireHouseholdId', () => {
    it('should return household id when available in locals', () => {
        const event = createEvent({ householdId: 'household-1' });

        const householdId = requireHouseholdId(event);

        expect(householdId).toBe('household-1');
    });

    it('should return default household id when auth is not required', () => {
        const event = createEvent({
            requireAccessAuth: false,
            defaultHouseholdId: 'default-household',
        });

        const householdId = requireHouseholdId(event);

        expect(householdId).toBe('default-household');
    });

    it('should throw 401 when auth required and user is not authenticated', () => {
        const event = createEvent({ requireAccessAuth: true });

        try {
            requireHouseholdId(event);
            throw new Error('Expected requireHouseholdId to throw.');
        } catch (thrown) {
            const error = thrown as { status?: number; body?: { message?: string } };
            expect(error.status).toBe(401);
            expect(error.body?.message).toBe('Cloudflare Access authentication is required.');
        }
    });

    it('should throw 403 when auth required but user has no household membership', () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'user@example.com',
            householdId: null,
        });

        try {
            requireHouseholdId(event);
            throw new Error('Expected requireHouseholdId to throw.');
        } catch (thrown) {
            const error = thrown as { status?: number; body?: { message?: string } };
            expect(error.status).toBe(403);
            expect(error.body?.message).toBe('No household membership found for authenticated user.');
        }
    });
});
