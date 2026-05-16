import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { GET } from './+server';

describe('GET /api/recipes', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    function makeEvent(
        db: ReturnType<typeof createTestDbPair>['first'],
        query = '',
        headers: Record<string, string> = {}
    ) {
        const url = new URL(`http://localhost/api/recipes${query ? `?${query}` : ''}`);
        return {
            request: new Request(url.toString(), { headers }),
            platform: { env: { DB: db } },
            url,
            params: {}
        } as never;
    }

    async function seedRecipes(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, description, type, visibility, prep_minutes, cook_minutes, ingredients, tags, created_at)
				 VALUES ('pasta-bake', 'Pasta Bake', 'Easy family pasta.', 'full', 'public', 5, 20, '[]', '["quick"]', '2026-01-02T00:00:00Z')`
            )
            .run();
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, description, type, visibility, ingredients, tags, created_at)
				 VALUES ('slow-stew', 'Slow Stew', 'A hearty stew.', 'full', 'public', '[]', '["comfort"]', '2026-01-03T00:00:00Z')`
            )
            .run();
    }

    async function seedPrivateRecipe(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                "INSERT INTO users (id, email, name) VALUES ('user-1', 'user@example.com', 'User')"
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
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, type, visibility, household_id, ingredients, tags)
				 VALUES ('secret-soup', 'Secret Soup', 'full', 'private', 'house-1', '[]', '[]')`
            )
            .run();
    }

    it('should return paged recipes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);

        const response = await GET(makeEvent(pair.first));
        const body = (await response.json()) as {
            items: unknown[];
            page: number;
            pageSize: number;
            total: number;
        };

        expect(response.status).toBe(200);
        expect(body.total).toBe(2);
        expect(body.page).toBe(1);
        expect(body.pageSize).toBe(24);
        expect(body.items).toHaveLength(2);
    });

    it('should sort by latest (created_at DESC) by default', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);

        const response = await GET(makeEvent(pair.first));
        const body = (await response.json()) as { items: Array<{ id: string }> };

        expect(response.status).toBe(200);
        expect(body.items[0].id).toBe('slow-stew');
        expect(body.items[1].id).toBe('pasta-bake');
    });

    it('should filter by keyword search', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);

        const response = await GET(makeEvent(pair.first, 'q=pasta'));
        const body = (await response.json()) as { items: Array<{ id: string }>; total: number };

        expect(response.status).toBe(200);
        expect(body.total).toBe(1);
        expect(body.items[0].id).toBe('pasta-bake');
    });

    it('should return 400 for invalid page', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET(makeEvent(pair.first, 'page=0'));
        expect(response.status).toBe(400);
    });

    it('should return 400 for pageSize exceeding max', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const response = await GET(makeEvent(pair.first, 'pageSize=101'));
        expect(response.status).toBe(400);
    });

    it('should only return public recipes for anonymous users', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);
        await seedPrivateRecipe(pair);

        const response = await GET(makeEvent(pair.first));
        const body = (await response.json()) as { items: Array<{ id: string }>; total: number };

        expect(response.status).toBe(200);
        expect(body.total).toBe(2);
        expect(body.items.every((i) => i.id !== 'secret-soup')).toBe(true);
    });

    it('should include private household recipes for authenticated member', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);
        await seedPrivateRecipe(pair);

        const response = await GET(makeEvent(pair.first, '', { cookie: 'session=sess-1' }));
        const body = (await response.json()) as { items: Array<{ id: string }>; total: number };

        expect(response.status).toBe(200);
        expect(body.total).toBe(3);
        expect(body.items.some((i) => i.id === 'secret-soup')).toBe(true);
    });

    it('should support pagination', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);

        const response = await GET(makeEvent(pair.first, 'page=1&pageSize=1'));
        const body = (await response.json()) as {
            items: unknown[];
            total: number;
            page: number;
            pageSize: number;
        };

        expect(response.status).toBe(200);
        expect(body.items).toHaveLength(1);
        expect(body.total).toBe(2);
        expect(body.pageSize).toBe(1);
    });

    it('should return empty items for page beyond results', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);

        const response = await GET(makeEvent(pair.first, 'page=99'));
        const body = (await response.json()) as { items: unknown[]; total: number };

        expect(response.status).toBe(200);
        expect(body.items).toHaveLength(0);
        expect(body.total).toBe(2);
    });

    it('should sort alphabetically when sort=alphabetical', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipes(pair);

        const response = await GET(makeEvent(pair.first, 'sort=alphabetical'));
        const body = (await response.json()) as { items: Array<{ id: string }> };

        expect(response.status).toBe(200);
        expect(body.items[0].id).toBe('pasta-bake');
        expect(body.items[1].id).toBe('slow-stew');
    });
});
