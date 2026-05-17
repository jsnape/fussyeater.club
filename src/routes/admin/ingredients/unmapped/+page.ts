import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type UnmappedResponse = components['schemas']['UnmappedIngredientsResponse'];
type CanonicalIngredient = components['schemas']['CanonicalIngredient'];
type IngredientsPage = { items: CanonicalIngredient[]; total: number };

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [unmapped, allIngredients] = await Promise.all([
			apiFetchWith<UnmappedResponse>(fetch, '/api/admin/ingredients/unmapped'),
			apiFetchWith<IngredientsPage>(fetch, '/api/admin/ingredients?pageSize=100&sort=name')
		]);

		// Fetch remaining pages if needed
		let ingredients = allIngredients.items;
		if (allIngredients.total > 100) {
			const pages = Math.ceil(allIngredients.total / 100);
			const remaining = await Promise.all(
				Array.from({ length: pages - 1 }, (_, i) =>
					apiFetchWith<IngredientsPage>(fetch, `/api/admin/ingredients?pageSize=100&sort=name&page=${i + 2}`)
				)
			);
			for (const page of remaining) {
				ingredients = [...ingredients, ...page.items];
			}
		}

		return { unmapped, allIngredients: ingredients };
	} catch {
		return {
			unmapped: { items: [], total: 0 } as UnmappedResponse,
			allIngredients: [] as CanonicalIngredient[]
		};
	}
};
