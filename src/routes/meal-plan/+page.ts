import { createApiClient, type MealPlan } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch);

    try {
        const mealPlan: MealPlan = await api.mealPlan.getCurrent();
        return { mealPlan };
    } catch {
        return { mealPlan: null };
    }
};
