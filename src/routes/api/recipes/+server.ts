import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDb, requireHouseholdId } from '$lib/server/db';
import type { components } from '$lib/api-types';

type Recipe = components['schemas']['Recipe'];
type CreateRecipeRequest = components['schemas']['CreateRecipeRequest'];

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

function validateCreateRequest(payload: Partial<CreateRecipeRequest>): asserts payload is CreateRecipeRequest {
    if (!payload.title || !payload.title.trim()) {
        throw error(400, 'Title is required.');
    }

    if (!Array.isArray(payload.ingredients)) {
        throw error(400, 'Ingredients are required.');
    }

    if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
        throw error(400, 'At least one step is required.');
    }
}

export async function GET(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);

    const result = await db
        .prepare(
            `SELECT id, title, description, servings, prep_time_minutes, cook_time_minutes,
                    ingredients_json, steps_json, tags_json, is_public
             FROM recipes
             WHERE household_id = ?
             ORDER BY title ASC`
        )
        .bind(householdId)
        .all<RecipeRow>();

    const recipes = (result.results ?? []).map(mapRowToRecipe);
    return json(recipes);
}

export async function POST(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);
    const payload = (await event.request.json()) as Partial<CreateRecipeRequest>;

    validateCreateRequest(payload);

    const recipeId = crypto.randomUUID();
    const nowUtc = new Date().toISOString();

    await db
        .prepare(
            `INSERT INTO recipes (
                id, household_id, title, description, servings, prep_time_minutes, cook_time_minutes,
                ingredients_json, steps_json, tags_json, is_public, created_utc, updated_utc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
            recipeId,
            householdId,
            payload.title,
            payload.description ?? null,
            payload.servings ?? 4,
            payload.prepTimeMinutes ?? null,
            payload.cookTimeMinutes ?? null,
            JSON.stringify(payload.ingredients),
            JSON.stringify(payload.steps),
            JSON.stringify(payload.tags ?? []),
            payload.isPublic ? 1 : 0,
            nowUtc,
            nowUtc
        )
        .run();

    const createdRecipe: Recipe = {
        id: recipeId,
        title: payload.title,
        description: payload.description,
        servings: payload.servings ?? 4,
        prepTimeMinutes: payload.prepTimeMinutes,
        cookTimeMinutes: payload.cookTimeMinutes,
        ingredients: payload.ingredients,
        steps: payload.steps,
        tags: payload.tags ?? [],
        isPublic: payload.isPublic ?? false,
    };

    return json(createdRecipe, {
        status: 201,
        headers: {
            Location: `/api/recipes/${recipeId}`,
        },
    });
}
