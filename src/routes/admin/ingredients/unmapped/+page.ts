import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type UnmappedResponse = components['schemas']['UnmappedIngredientsResponse'];

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await apiFetchWith<UnmappedResponse>(
			fetch,
			'/api/admin/ingredients/unmapped'
		);
		return { unmapped: data };
	} catch {
		return { unmapped: { items: [], total: 0 } as UnmappedResponse };
	}
};
