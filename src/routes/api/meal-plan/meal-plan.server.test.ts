import { describe, expect, it, vi } from 'vitest';
import { GET, PUT } from './+server';

type MealPlanRow = {
    id: string;
    household_id: string;
    title: string;
    start_date: string;
    end_date: string;
    meals_json: string;
    created_utc: string;
};

function createEvent(options?: {
    requireAccessAuth?: boolean;
    householdId?: string | null;
    accessUserEmail?: string | null;
    row?: MealPlanRow | null;
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
        request: new Request('http://localhost/api/meal-plan', {
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

describe('meal-plan API route', () => {
    it('GET should reject unauthenticated requests when strict access auth is enabled', async () => {
        const event = createEvent({ requireAccessAuth: true });

        await expect(GET(event)).rejects.toMatchObject({
            status: 401,
            body: { message: 'Cloudflare Access authentication is required.' },
        });
    });

    it('GET should return 404 when no meal plan exists', async () => {
        const event = createEvent({ householdId: 'household-1' });

        const response = await GET(event);

        expect(response.status).toBe(404);
    });

    it('GET should return mapped meal plan payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            row: {
                id: 'meal-plan-1',
                household_id: 'household-1',
                title: 'Week Plan',
                start_date: '2026-01-01',
                end_date: '2026-01-07',
                meals_json: JSON.stringify([
                    {
                        date: '2026-01-01',
                        mealType: 'Dinner',
                        recipeId: 'recipe-1',
                        servings: 4,
                    },
                ]),
                created_utc: '2026-01-01T00:00:00Z',
            },
        });

        const response = await GET(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            id: 'meal-plan-1',
            householdId: 'household-1',
            title: 'Week Plan',
            startDate: '2026-01-01',
            endDate: '2026-01-07',
            meals: [
                {
                    date: '2026-01-01',
                    mealType: 'Dinner',
                    recipeId: 'recipe-1',
                    servings: 4,
                },
            ],
            createdAt: '2026-01-01T00:00:00Z',
        });
    });

    it('PUT should upsert meal plan and return payload', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            existingId: 'meal-plan-1',
            body: {
                title: 'Updated Week',
                startDate: '2026-01-08',
                endDate: '2026-01-14',
                meals: [],
            },
        });

        const response = await PUT(event);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.id).toBe('meal-plan-1');
        expect(payload.title).toBe('Updated Week');
    });

    it('PUT should reject invalid payloads', async () => {
        const event = createEvent({
            householdId: 'household-1',
            body: {
                title: '',
                startDate: '2026-01-08',
                endDate: '2026-01-14',
                meals: [],
            },
        });

        await expect(PUT(event)).rejects.toMatchObject({
            status: 400,
            body: { message: 'Title is required.' },
        });
    });
});
