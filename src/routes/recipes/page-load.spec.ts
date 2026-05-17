import { describe, expect, it, vi } from 'vitest';
import type { components } from '$lib/api-types';
import { load } from './+page';

type RecipeSummary = components['schemas']['RecipeSummary'];
type RecipeListResponse = components['schemas']['RecipeListResponse'];

const sampleRecipes: RecipeSummary[] = [
    {
        id: 'pasta-bake',
        title: 'Pasta Bake',
        description: 'Easy family pasta.',
        type: 'full',
        visibility: 'public',
        timings: { prepMinutes: 5, cookMinutes: 20 },
        tags: ['quick', 'family']
    }
];

describe('/recipes page load', () => {
    function makeLoadArgs(searchParams: Record<string, string> = {}) {
        const url = new URL('http://localhost/recipes');
        for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value);
        }

        return { url };
    }

    it('should return recipe data on success', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response(
                JSON.stringify({ items: sampleRecipes, page: 1, pageSize: 24, total: 1 } satisfies RecipeListResponse),
                { status: 200, headers: { 'content-type': 'application/json' } }
            )
        );

        const result = (await load({ fetch: fetchMock, ...makeLoadArgs() } as never)) as RecipeListResponse & {
            q: string;
            sort: 'latest' | 'quickest' | 'alphabetical';
            error: null | 'unavailable';
        };

        expect(result).toEqual({
            items: sampleRecipes,
            page: 1,
            pageSize: 24,
            total: 1,
            q: '',
            tag: '',
            sort: 'latest',
            error: null
        });
    });

    it('should pass search query to API', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response(JSON.stringify({ items: [], page: 1, pageSize: 24, total: 0 } satisfies RecipeListResponse), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            })
        );

        await load({ fetch: fetchMock, ...makeLoadArgs({ q: 'pasta' }) } as never);

        expect(String(fetchMock.mock.calls[0]?.[0])).toContain('q=pasta');
    });

    it('should pass tag param to API', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response(JSON.stringify({ items: [], page: 1, pageSize: 24, total: 0 } satisfies RecipeListResponse), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            })
        );

        const result = (await load({ fetch: fetchMock, ...makeLoadArgs({ tag: 'breakfast' }) } as never)) as {
            tag: string;
        };

        expect(String(fetchMock.mock.calls[0]?.[0])).toContain('tag=breakfast');
        expect(result.tag).toBe('breakfast');
    });

    it('should pass sort param to API', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response(
                JSON.stringify({ items: sampleRecipes, page: 1, pageSize: 24, total: 1 } satisfies RecipeListResponse),
                { status: 200, headers: { 'content-type': 'application/json' } }
            )
        );

        const result = (await load({ fetch: fetchMock, ...makeLoadArgs({ sort: 'quickest' }) } as never)) as {
            sort: 'latest' | 'quickest' | 'alphabetical';
        };

        expect(String(fetchMock.mock.calls[0]?.[0])).toContain('sort=quickest');
        expect(result.sort).toBe('quickest');
    });

    it('should default sort to latest for invalid values', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            new Response(JSON.stringify({ items: [], page: 1, pageSize: 24, total: 0 } satisfies RecipeListResponse), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            })
        );

        const result = (await load({ fetch: fetchMock, ...makeLoadArgs({ sort: 'invalid' }) } as never)) as {
            sort: 'latest' | 'quickest' | 'alphabetical';
        };

        expect(String(fetchMock.mock.calls[0]?.[0])).toContain('sort=latest');
        expect(result.sort).toBe('latest');
    });

    it('should return error state on fetch failure', async () => {
        const fetchMock = vi.fn().mockRejectedValueOnce(new Error('network'));

        const result = (await load({
            fetch: fetchMock,
            ...makeLoadArgs({ q: 'pasta', sort: 'quickest' })
        } as never)) as {
            items: RecipeSummary[];
            page: number;
            pageSize: number;
            total: number;
            q: string;
            sort: 'latest' | 'quickest' | 'alphabetical';
            error: null | 'unavailable';
        };

        expect(result).toEqual({
            items: [],
            page: 1,
            pageSize: 24,
            total: 0,
            q: 'pasta',
            tag: '',
            sort: 'quickest',
            error: 'unavailable'
        });
    });
});
