import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type CanonicalIngredient = components['schemas']['CanonicalIngredient'];

export const load: PageLoad = async ({ fetch, params }) => {
    const ingredient = await apiFetchWith<CanonicalIngredient>(
        fetch,
        `/api/admin/ingredients/${params.id}`
    );
    return { ingredient };
};
