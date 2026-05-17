import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type ShoppingListResponse = components['schemas']['ShoppingListResponse'];

export const load: PageLoad = async ({ fetch, url }) => {
	const week = url.searchParams.get('week');
	const query = week ? `?week=${encodeURIComponent(week)}` : '';

	try {
		const list = await apiFetchWith<ShoppingListResponse>(fetch, `/api/shopping${query}`);
		return { list };
	} catch {
		return { list: null };
	}
};
