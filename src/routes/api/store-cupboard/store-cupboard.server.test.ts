import { describe, expect, it, vi } from 'vitest';
import { GET, PUT } from './+server';

type StoreCupboardRow = {
    id: string;
    household_id: string;
    items_json: string;
    updated_utc: string;
};

function createEvent(options?: {
    requireAccessAuth?: boolean;
    householdId?: string | null;
    accessUserEmail?: string | null;
    row?: StoreCupboardRow | null;
    existingId?: string | null;
    body?: unknown;
}) {
    const statement = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(options?.row ?? (options?.existingId ? { id: options.existingId } : null)),
        run: vi.fn().mockResolvedValue({ success: true }),
    };

    const db = {
        prepare: vi.fn().mockReturnValue(statement),
    };

    return {
        request: new Request('http://localhost/api/store-cupboard', {
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

describe('store-cupboard API route', () => {
    it('GET should reject unauthenticated requests when strict access auth is enabled', async () => {
        const event = createEvent({ requireAccessAuth: true });

        await expect(GET(event)).rejects.toMatchObject({
            status: 401,
            body: { message: 'Cloudflare Access authentication is required.' },
        });
    });

    it('GET should return 404 when no cupboard exists', async () => {
        const event = createEvent({ householdId: 'household-1' });

        const response = await GET(event);

        expect(response.status).toBe(404);
    });

    it('GET should return mapped cupboard payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            row: {
                id: 'cupboard-1',
                household_id: 'household-1',
                items_json: JSON.stringify([
                    {
                        name: 'Rice',
                        category: 'Other',
                        alwaysStocked: true,
                    },
                ]),
                updated_utc: '2026-01-03T00:00:00Z',
            },
        });

        const response = await GET(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            id: 'cupboard-1',
            householdId: 'household-1',
            items: [
                {
                    name: 'Rice',
                    category: 'Other',
                    alwaysStocked: true,
                },
            ],
            updatedAt: '2026-01-03T00:00:00Z',
        });
    });

    it('PUT should upsert cupboard and return payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            existingId: 'cupboard-1',
            body: {
                items: [{ name: 'Pasta', category: 'Other', alwaysStocked: true }],
            },
        });

        const response = await PUT(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.id).toBe('cupboard-1');
        expect(payload.items).toHaveLength(1);
    });

    it('PUT should reject invalid payloads', async () => {
        const event = createEvent({
            householdId: 'household-1',
            body: {
                items: null,
            },
        });

        await expect(PUT(event)).rejects.toMatchObject({
            status: 400,
            body: { message: 'Items must be an array.' },
        });
    });
});
