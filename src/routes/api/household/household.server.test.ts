import { describe, expect, it, vi } from 'vitest';
import { GET, PUT } from './+server';

type HouseholdRow = {
    id: string;
    name: string;
    invite_code: string | null;
    created_utc: string;
};

function createEvent(options?: {
    requireAccessAuth?: boolean;
    householdId?: string | null;
    accessUserEmail?: string | null;
    row?: HouseholdRow | null;
    body?: unknown;
}) {
    const statement = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(options?.row ?? null),
        run: vi.fn().mockResolvedValue({ success: true }),
    };

    const db = {
        prepare: vi.fn().mockReturnValue(statement),
    };

    return {
        request: new Request('http://localhost/api/household', {
            method: options?.body ? 'PUT' : 'GET',
            body: options?.body ? JSON.stringify(options.body) : undefined,
            headers: {
                'content-type': 'application/json',
            },
        }),
        locals: {
            accessUserEmail: options?.accessUserEmail ?? null,
            householdId: options?.householdId ?? null,
        },
        platform: {
            env: {
                DB: db,
                REQUIRE_ACCESS_AUTH: options?.requireAccessAuth ? 'true' : 'false',
                DEFAULT_HOUSEHOLD_ID: 'default-household',
            },
        },
    } as any;
}

describe('household API route', () => {
    it('GET should reject unauthenticated requests when strict access auth is enabled', async () => {
        const event = createEvent({ requireAccessAuth: true });

        await expect(GET(event)).rejects.toMatchObject({
            status: 401,
            body: { message: 'Cloudflare Access authentication is required.' },
        });
    });

    it('GET should return 404 when household does not exist', async () => {
        const event = createEvent({ householdId: 'household-1' });

        const response = await GET(event);

        expect(response.status).toBe(404);
    });

    it('GET should return mapped household payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            row: {
                id: 'household-1',
                name: 'Demo Household',
                invite_code: null,
                created_utc: '2026-01-01T00:00:00Z',
            },
        });

        const response = await GET(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            id: 'household-1',
            name: 'Demo Household',
            inviteCode: '',
            createdAt: '2026-01-01T00:00:00Z',
        });
    });

    it('PUT should save household profile and return payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            body: {
                name: 'Updated Household',
                inviteCode: 'INVITE123',
            },
        });

        const response = await PUT(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.id).toBe('household-1');
        expect(payload.name).toBe('Updated Household');
    });

    it('PUT should reject invalid payloads', async () => {
        const event = createEvent({
            householdId: 'household-1',
            body: {
                name: '',
                inviteCode: 'ABC',
            },
        });

        await expect(PUT(event)).rejects.toMatchObject({
            status: 400,
            body: { message: 'Household name is required.' },
        });
    });
});
