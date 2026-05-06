import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type RecipeListResponse = components['schemas']['RecipeListResponse'];

export const load: PageLoad = async ({ fetch, url }) => {
    const q = url.searchParams.get('q') ?? '';
    const page = url.searchParams.get('page') ?? '1';

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', page);
    params.set('pageSize', '24');
    params.set('sort', 'latest');

    try {
        const data = await apiFetchWith<RecipeListResponse>(
            fetch,
            `/api/recipes?${params.toString()}`
        );
        return { ...data, q, error: null };
    } catch {
        return { items: [], page: 1, pageSize: 24, total: 0, q, error: 'unavailable' as const };
    }
};
