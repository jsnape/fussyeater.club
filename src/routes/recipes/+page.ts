import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type RecipeListResponse = components['schemas']['RecipeListResponse'];

export type RecipeSort = 'latest' | 'quickest' | 'alphabetical';

const VALID_SORTS: ReadonlySet<string> = new Set(['latest', 'quickest', 'alphabetical']);

export const load: PageLoad = async ({ fetch, url }) => {
    const q = url.searchParams.get('q') ?? '';
    const tag = url.searchParams.get('tag') ?? '';
    const page = url.searchParams.get('page') ?? '1';
    const sortRaw = url.searchParams.get('sort') ?? 'latest';
    const sort: RecipeSort = VALID_SORTS.has(sortRaw) ? (sortRaw as RecipeSort) : 'latest';

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    params.set('page', page);
    params.set('pageSize', '24');
    params.set('sort', sort);

    try {
        const data = await apiFetchWith<RecipeListResponse>(
            fetch,
            `/api/recipes?${params.toString()}`
        );
        return { ...data, q, tag, sort, error: null };
    } catch {
        return {
            items: [],
            page: 1,
            pageSize: 24,
            total: 0,
            q,
            tag,
            sort,
            error: 'unavailable' as const
        };
    }
};
