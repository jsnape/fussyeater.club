import { createApiClient, type Recipe } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch);
    const recipeList: Recipe[] = await api.recipes.list();
    return { recipes: recipeList };
};
