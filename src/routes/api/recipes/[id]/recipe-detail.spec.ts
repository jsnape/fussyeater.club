import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { GET } from './+server';

describe('GET /api/recipes/[id]', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    function makeEvent(
        slug: string,
        db: ReturnType<typeof createTestDbPair>['first'],
        headers: Record<string, string> = {}
    ) {
        return {
            request: new Request(`http://localhost/api/recipes/${slug}`, { headers }),
            platform: { env: { DB: db } },
            params: { id: slug }
        } as never;
    }

    async function seedHouseholdAndUser(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('user-1', 'user@example.com', 'Test User')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'user-1', 'Family')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_memberships (user_id, household_id, role) VALUES ('user-1', 'house-1', 'owner')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'user-1', datetime('now', '+7 day'))"
            )
            .run();
    }

    async function seedPublicFullRecipe(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, description, type, visibility, servings, yield, prep_minutes, cook_minutes, ingredients, method, notes, tags)
				 VALUES ('spaghetti-carbonara', 'Spaghetti Carbonara', 'Creamy pasta.', 'full', 'public', 4, '1 bowl', 10, 15,
				 '[{"amount":400,"unit":"g","ingredient":"spaghetti","ingredientGroup":"Pasta"}]',
				 '["Cook pasta.","Add sauce."]',
				 'A classic.',
				 '["italian","quick"]')`
            )
            .run();
    }

    async function seedPrivateRecipe(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, type, visibility, household_id, ingredients, tags)
				 VALUES ('secret-recipe', 'Secret Recipe', 'full', 'private', 'house-1', '[]', '[]')`
            )
            .run();
    }

    async function seedReferenceRecipe(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, type, visibility, ingredients, source_reference, tags)
				 VALUES ('beef-bourguignon', 'Beef Bourguignon', 'reference', 'public',
				 '[{"amount":1.5,"unit":"kg","ingredient":"beef chuck"}]',
				 '{"kind":"book","label":"Mastering French Cooking, p. 315","bookTitle":"Mastering French Cooking","pageNumber":315,"isbn":"978-0375413407"}',
				 '["french"]')`
            )
            .run();
    }

    it('should return a full public recipe for an existing slug', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedPublicFullRecipe(pair);

        const response = await GET(makeEvent('spaghetti-carbonara', pair.first));
        const body = (await response.json()) as Record<string, unknown>;

        expect(response.status).toBe(200);
        expect(body.id).toBe('spaghetti-carbonara');
        expect(body.title).toBe('Spaghetti Carbonara');
        expect(body.description).toBe('Creamy pasta.');
        expect(body.type).toBe('full');
        expect(body.visibility).toBe('public');
        expect(body.servings).toBe(4);
        expect(body.yield).toBe('1 bowl');
        expect(body.notes).toBe('A classic.');
    });

    it('should return timings for a recipe with prep and cook minutes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedPublicFullRecipe(pair);

        const response = await GET(makeEvent('spaghetti-carbonara', pair.first));
        const body = (await response.json()) as {
            timings: { prepMinutes: number; cookMinutes: number };
        };

        expect(response.status).toBe(200);
        expect(body.timings).toEqual({ prepMinutes: 10, cookMinutes: 15 });
    });

    it('should return tags and ingredients as parsed JSON arrays', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedPublicFullRecipe(pair);

        const response = await GET(makeEvent('spaghetti-carbonara', pair.first));
        const body = (await response.json()) as {
            tags: string[];
            ingredients: Array<{ amount: number; unit: string; ingredient: string }>;
        };

        expect(response.status).toBe(200);
        expect(body.tags).toEqual(['italian', 'quick']);
        expect(body.ingredients).toHaveLength(1);
        expect(body.ingredients[0].ingredient).toBe('spaghetti');
    });

    it('should return method steps for full recipes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedPublicFullRecipe(pair);

        const response = await GET(makeEvent('spaghetti-carbonara', pair.first));
        const body = (await response.json()) as { method: string[] };

        expect(response.status).toBe(200);
        expect(body.method).toEqual(['Cook pasta.', 'Add sauce.']);
    });

    it('should omit method and include sourceReference for reference recipes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedReferenceRecipe(pair);

        const response = await GET(makeEvent('beef-bourguignon', pair.first));
        const body = (await response.json()) as {
            method?: string[];
            sourceReference: { kind: string; label: string; bookTitle: string };
        };

        expect(response.status).toBe(200);
        expect(body.method).toBeUndefined();
        expect(body.sourceReference).toBeDefined();
        expect(body.sourceReference.kind).toBe('book');
        expect(body.sourceReference.bookTitle).toBe('Mastering French Cooking');
    });

    it('should return 404 for an unknown slug', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET(makeEvent('does-not-exist', pair.first));
        expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid slug format', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET(makeEvent('INVALID_SLUG!', pair.first));
        expect(response.status).toBe(400);
    });

    it('should return 403 for a private recipe when unauthenticated', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedHouseholdAndUser(pair);
        await seedPrivateRecipe(pair);

        const response = await GET(makeEvent('secret-recipe', pair.first));
        expect(response.status).toBe(403);
    });

    it('should return a private recipe for an authenticated household member', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedHouseholdAndUser(pair);
        await seedPrivateRecipe(pair);

        const response = await GET(
            makeEvent('secret-recipe', pair.first, { cookie: 'session=sess-1' })
        );
        const body = (await response.json()) as { id: string; visibility: string };

        expect(response.status).toBe(200);
        expect(body.id).toBe('secret-recipe');
        expect(body.visibility).toBe('private');
    });

    it('should return 403 for a private recipe when user is in a different household', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedHouseholdAndUser(pair);
        await seedPrivateRecipe(pair);

        // Create a different user in a different household
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('user-2', 'other@example.com', 'Other User')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO households (id, owner_user_id, name) VALUES ('house-2', 'user-2', 'Other Family')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO household_memberships (user_id, household_id, role) VALUES ('user-2', 'house-2', 'owner')"
            )
            .run();
        await pair.first
            .prepare(
                "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-2', 'user-2', datetime('now', '+7 day'))"
            )
            .run();

        const response = await GET(
            makeEvent('secret-recipe', pair.first, { cookie: 'session=sess-2' })
        );
        expect(response.status).toBe(403);
    });

    it('should include x-request-id header in responses', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedPublicFullRecipe(pair);

        const response = await GET(makeEvent('spaghetti-carbonara', pair.first));
        expect(response.headers.get('x-request-id')).toBeTruthy();
    });
});
