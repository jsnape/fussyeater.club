import type { PageLoad } from './$types';
import { apiFetchWith, ApiError } from '$lib/api';
import type { components } from '$lib/api-types';

type RecipeDetail = components['schemas']['RecipeDetail'];

type RecipePageData = {
    recipe: RecipeDetail | null;
    error: 'not-found' | 'forbidden' | 'unavailable' | null;
};

export const load: PageLoad = async ({ fetch, params }): Promise<RecipePageData> => {
    try {
        const recipe = await apiFetchWith<RecipeDetail>(fetch, `/api/recipes/${params.id}`);
        return { recipe, error: null };
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.status === 404) {
                return { recipe: null, error: 'not-found' };
            }

            if (err.status === 403) {
                return { recipe: null, error: 'forbidden' };
            }
        }

        return { recipe: null, error: 'unavailable' };
    }
};
