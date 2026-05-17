import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type IngredientListResponse = components['schemas']['IngredientListResponse'];

export const load: PageLoad = async ({ fetch, url }) => {
	const params = new URLSearchParams();
	const search = url.searchParams.get('search');
	const foodGroup = url.searchParams.get('foodGroup');
	const allergen = url.searchParams.get('allergen');
	const plantColour = url.searchParams.get('plantColour');
	const sort = url.searchParams.get('sort');
	const page = url.searchParams.get('page');

	if (search) params.set('search', search);
	if (foodGroup) params.set('foodGroup', foodGroup);
	if (allergen) params.set('allergen', allergen);
	if (plantColour) params.set('plantColour', plantColour);
	if (sort) params.set('sort', sort);
	if (page) params.set('page', page);

	try {
		const data = await apiFetchWith<IngredientListResponse>(
			fetch,
			`/api/admin/ingredients?${params.toString()}`
		);
		return { ingredients: data };
	} catch {
		return {
			ingredients: { items: [], page: 1, pageSize: 50, total: 0 } as IngredientListResponse
		};
	}
};
