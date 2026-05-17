import type { PageLoad } from './$types';
import { apiFetchWith, ApiError } from '$lib/api';
import type { components } from '$lib/api-types';

type MealPlanResponse = components['schemas']['MealPlanResponse'];
type RecipeListResponse = components['schemas']['RecipeListResponse'];

export type PlannerPageData = {
	plan: MealPlanResponse | null;
	recipes: RecipeListResponse | null;
	error: 'unauthenticated' | 'no-household' | 'unavailable' | null;
	initialWeek: string;
};

function getCurrentWeekMonday(): string {
	const now = new Date();
	const day = now.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	const monday = new Date(now);
	monday.setDate(now.getDate() + diff);
	return monday.toISOString().slice(0, 10);
}

export const load: PageLoad = async ({ fetch, url }): Promise<PlannerPageData> => {
	const weekParam = url.searchParams.get('week');
	const initialWeek = weekParam ?? getCurrentWeekMonday();

	try {
		const [plan, recipes] = await Promise.all([
			apiFetchWith<MealPlanResponse>(fetch, `/api/planner?week=${initialWeek}`),
			apiFetchWith<RecipeListResponse>(fetch, '/api/recipes?pageSize=100')
		]);

		return { plan, recipes, error: null, initialWeek };
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.status === 401) {
				return { plan: null, recipes: null, error: 'unauthenticated', initialWeek };
			}
			if (err.status === 403) {
				return { plan: null, recipes: null, error: 'no-household', initialWeek };
			}
		}

		return { plan: null, recipes: null, error: 'unavailable', initialWeek };
	}
};
