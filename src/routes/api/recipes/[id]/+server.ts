import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDb, requireHouseholdId } from '$lib/server/db';
import type { components } from '$lib/api-types';

type Recipe = components['schemas']['Recipe'];

type RecipeRow = {
    id: string;
    title: string;
    description: string | null;
    servings: number;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    ingredients_json: string;
    steps_json: string;
    tags_json: string;
    is_public: number;
};

function mapRowToRecipe(row: RecipeRow): Recipe {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        servings: row.servings,
        prepTimeMinutes: row.prep_time_minutes ?? undefined,
        cookTimeMinutes: row.cook_time_minutes ?? undefined,
        ingredients: JSON.parse(row.ingredients_json),
        steps: JSON.parse(row.steps_json),
        tags: JSON.parse(row.tags_json),
        isPublic: row.is_public === 1,
    };
}

export async function GET(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);
    const recipeId = event.params.id;

    const result = await db
        .prepare(
            `SELECT id, title, description, servings, prep_time_minutes, cook_time_minutes,
                    ingredients_json, steps_json, tags_json, is_public
             FROM recipes
             WHERE household_id = ? AND id = ?`
        )
        .bind(householdId, recipeId)
        .first<RecipeRow>();

    if (!result) {
        return new Response(null, { status: 404 });
    }

    return json(mapRowToRecipe(result));
}
