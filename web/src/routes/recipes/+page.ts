import { recipes, type Recipe } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    const recipeList: Recipe[] = await recipes.list();
    return { recipes: recipeList };
};
