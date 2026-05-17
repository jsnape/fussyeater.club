import type { RecipeRow } from './recipe';
import type { AuthContext } from './security';
import { canEditRecipe } from './recipe';

export function parseJsonField<T>(raw: string | null, fallback: T): T {
    if (!raw) {
        return fallback;
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function toRecipeDetailResponse(
    recipe: RecipeRow,
    auth?: AuthContext,
    userHouseholdId?: string | null
): Record<string, unknown> {
    const timings =
        recipe.prep_minutes != null || recipe.cook_minutes != null
            ? {
                  prepMinutes: recipe.prep_minutes ?? undefined,
                  cookMinutes: recipe.cook_minutes ?? undefined
              }
            : undefined;

    const base: Record<string, unknown> = {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description ?? undefined,
        imageUrl: recipe.image_url ?? undefined,
        type: recipe.type,
        visibility: recipe.visibility,
        timings,
        servings: recipe.servings ?? undefined,
        yield: recipe.yield ?? undefined,
        tags: parseJsonField<string[]>(recipe.tags, []),
        ingredients: parseJsonField<unknown[]>(recipe.ingredients, []),
        notes: recipe.notes ?? undefined
    };

    if (auth) {
        base.canEdit = canEditRecipe(recipe, auth, userHouseholdId ?? null);
    }

    if (recipe.type === 'full') {
        return {
            ...base,
            method: parseJsonField<string[]>(recipe.method, [])
        };
    }

    return {
        ...base,
        sourceReference: parseJsonField<Record<string, unknown> | undefined>(
            recipe.source_reference,
            undefined
        )
    };
}
