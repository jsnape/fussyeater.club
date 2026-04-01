import { describe, expect, it, vi } from 'vitest';
import { GET, POST } from './+server';

type DbResultRow = {
    id: string;
    title: string;
    description: string | null;
    servings: number;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    ingredients_json: string;
    steps_json: string;
    tags_json: string;
    is_public: number;
};

function createDbMocks() {
    const statement = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] as DbResultRow[] }),
        run: vi.fn().mockResolvedValue({ success: true }),
    };

    const db = {
        prepare: vi.fn().mockReturnValue(statement),
    };

    return { db, statement };
}

function createEvent(options?: {
    requireAccessAuth?: boolean;
    householdId?: string | null;
    accessUserEmail?: string | null;
    body?: unknown;
}) {
    const { db } = createDbMocks();

    return {
        request: new Request('http://localhost/api/recipes', {
            method: options?.body ? 'POST' : 'GET',
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

describe('recipes API route', () => {
    it('GET should reject unauthenticated requests when strict access auth is enabled', async () => {
        const event = createEvent({ requireAccessAuth: true });

        await expect(GET(event)).rejects.toMatchObject({
            status: 401,
            body: { message: 'Cloudflare Access authentication is required.' },
        });
    });

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

    it('POST should create a recipe for resolved household context', async () => {
        const event = createEvent({
            requireAccessAuth: true,
            accessUserEmail: 'member@example.com',
            householdId: 'household-1',
            body: {
                title: 'Quick Pasta',
                servings: 4,
                ingredients: [],
                steps: ['Boil water', 'Cook pasta'],
                tags: ['quick'],
                isPublic: false,
            },
        });

        const response = await POST(event);
        const payload = await response.json();

        expect(response.status).toBe(201);
        expect(response.headers.get('Location')).toContain('/api/recipes/');
        expect(payload.id).toBeDefined();
        expect(payload.title).toBe('Quick Pasta');
    });
});
