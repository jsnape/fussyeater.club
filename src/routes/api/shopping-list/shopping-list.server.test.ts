import { describe, expect, it, vi } from 'vitest';
import { GET, PUT } from './+server';

type ShoppingListRow = {
    id: string;
    household_id: string;
    meal_plan_id: string;
    items_json: string;
    created_utc: string;
};

function createEvent(options?: {
    requireAccessAuth?: boolean;
    householdId?: string | null;
    accessUserEmail?: string | null;
    row?: ShoppingListRow | null;
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
        request: new Request('http://localhost/api/shopping-list', {
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

describe('shopping-list API route', () => {
    it('GET should reject authenticated users without household membership when strict access auth is enabled', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: null,
        });

        await expect(GET(event)).rejects.toMatchObject({
            status: 403,
            body: { message: 'No household membership found for authenticated user.' },
        });
    });

    it('GET should return 404 when no shopping list exists', async () => {
        const event = createEvent({ householdId: 'household-1' });

        const response = await GET(event);

        expect(response.status).toBe(404);
    });

    it('GET should return mapped shopping list payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            row: {
                id: 'list-1',
                household_id: 'household-1',
                meal_plan_id: 'meal-plan-1',
                items_json: JSON.stringify([
                    {
                        name: 'Milk',
                        quantity: 1,
                        unit: 'litre',
                        category: 'Dairy',
                        isChecked: false,
                    },
                ]),
                created_utc: '2026-01-02T00:00:00Z',
            },
        });

        const response = await GET(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            id: 'list-1',
            householdId: 'household-1',
            mealPlanId: 'meal-plan-1',
            items: [
                {
                    name: 'Milk',
                    quantity: 1,
                    unit: 'litre',
                    category: 'Dairy',
                    isChecked: false,
                },
            ],
            createdAt: '2026-01-02T00:00:00Z',
        });
    });

    it('PUT should upsert shopping list and return payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            existingId: 'list-1',
            body: {
                mealPlanId: 'meal-plan-1',
                items: [],
            },
        });

        const response = await PUT(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.id).toBe('list-1');
        expect(payload.mealPlanId).toBe('meal-plan-1');
    });

    it('PUT should reject invalid payloads', async () => {
        const event = createEvent({
            householdId: 'household-1',
            body: {
                mealPlanId: '',
                items: [],
            },
        });

        await expect(PUT(event)).rejects.toMatchObject({
            status: 400,
            body: { message: 'Meal plan id is required.' },
        });
    });
});
