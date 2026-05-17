import type { DbLike } from './db';
import { nowIso } from './db';
import type { AuthContext } from './security';
import { generateSlug } from './slug';

export type RecipeRow = {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    type: 'full' | 'reference';
    visibility: 'public' | 'private';
    household_id: string | null;
    created_by: string | null;
    servings: number | null;
    yield: string | null;
    prep_minutes: number | null;
    cook_minutes: number | null;
    ingredients: string;
    method: string | null;
    source_reference: string | null;
    notes: string | null;
    tags: string;
};

export type CreateRecipeInput = {
    title: string;
    description?: string;
    imageUrl?: string;
    type: 'full' | 'reference';
    visibility: 'public' | 'private';
    servings?: number;
    yield?: string;
    prepMinutes?: number;
    cookMinutes?: number;
    ingredients: unknown[];
    method?: string[];
    sourceReference?: Record<string, unknown>;
    tags?: string[];
    notes?: string;
    householdId: string | null;
    createdBy: string | null;
};

export type UpdateRecipeInput = {
    title: string;
    description?: string;
    imageUrl?: string;
    type: 'full' | 'reference';
    visibility: 'public' | 'private';
    servings?: number;
    yield?: string;
    prepMinutes?: number;
    cookMinutes?: number;
    ingredients: unknown[];
    method?: string[];
    sourceReference?: Record<string, unknown>;
    tags?: string[];
    notes?: string;
    householdId: string | null;
};

const MAX_SLUG_ATTEMPTS = 10;

export async function generateUniqueSlug(db: DbLike, title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    if (!baseSlug) {
        throw new Error('EMPTY_SLUG');
    }

    const existing = await db
        .prepare('SELECT id FROM recipes WHERE id = ?1')
        .bind(baseSlug)
        .first<{ id: string }>();

    if (!existing) {
        return baseSlug;
    }

    for (let suffix = 2; suffix <= MAX_SLUG_ATTEMPTS + 1; suffix++) {
        const candidate = `${baseSlug}-${suffix}`;
        const clash = await db
            .prepare('SELECT id FROM recipes WHERE id = ?1')
            .bind(candidate)
            .first<{ id: string }>();

        if (!clash) {
            return candidate;
        }
    }

    throw new Error('SLUG_COLLISION_EXHAUSTED');
}

export async function createRecipe(db: DbLike, input: CreateRecipeInput): Promise<RecipeRow> {
    const slug = await generateUniqueSlug(db, input.title);
    const now = nowIso();
    const dedupedTags = [...new Set((input.tags ?? []).map((t) => t.trim().toLowerCase()))];

    await db
        .prepare(
            `INSERT INTO recipes (id, title, description, image_url, type, visibility, household_id,
				servings, yield, prep_minutes, cook_minutes, ingredients, method,
				source_reference, notes, tags, created_by, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)`
        )
        .bind(
            slug,
            input.title,
            input.description ?? null,
            input.imageUrl ?? null,
            input.type,
            input.visibility,
            input.householdId,
            input.servings ?? null,
            input.yield ?? null,
            input.prepMinutes ?? null,
            input.cookMinutes ?? null,
            JSON.stringify(input.ingredients),
            input.method ? JSON.stringify(input.method) : null,
            input.sourceReference ? JSON.stringify(input.sourceReference) : null,
            input.notes ?? null,
            JSON.stringify(dedupedTags),
            input.createdBy,
            now,
            now
        )
        .run();

    const row = await getRecipeBySlug(db, slug);
    if (!row) {
        throw new Error('RECIPE_INSERT_FAILED');
    }

    return row;
}

export async function getRecipeBySlug(db: DbLike, slug: string): Promise<RecipeRow | null> {
    return db
        .prepare(
            `SELECT id, title, description, image_url, type, visibility, household_id, created_by,
				servings, yield, prep_minutes, cook_minutes,
				ingredients, method, source_reference, notes, tags
			 FROM recipes
			 WHERE id = ?1`
        )
        .bind(slug)
        .first<RecipeRow>();
}

export function canViewRecipe(
    recipe: RecipeRow,
    auth: AuthContext,
    userHouseholdId: string | null
): boolean {
    if (recipe.visibility === 'public') {
        return true;
    }

    if (!auth.userId || !recipe.household_id) {
        return false;
    }

    return userHouseholdId === recipe.household_id;
}

export function canEditRecipe(
    recipe: RecipeRow,
    auth: AuthContext,
    userHouseholdId: string | null
): boolean {
    if (!auth.userId) {
        return false;
    }

    if (recipe.created_by === auth.userId) {
        return true;
    }

    if (recipe.household_id && userHouseholdId === recipe.household_id) {
        return true;
    }

    return false;
}

export async function updateRecipe(
    db: DbLike,
    slug: string,
    input: UpdateRecipeInput
): Promise<RecipeRow | null> {
    const now = nowIso();
    const dedupedTags = [...new Set((input.tags ?? []).map((t) => t.trim().toLowerCase()))];

    await db
        .prepare(
            `UPDATE recipes SET
				title = ?1, description = ?2, image_url = ?3, type = ?4, visibility = ?5,
				household_id = ?6, servings = ?7, yield = ?8, prep_minutes = ?9, cook_minutes = ?10,
				ingredients = ?11, method = ?12, source_reference = ?13, notes = ?14, tags = ?15,
				updated_at = ?16
			 WHERE id = ?17`
        )
        .bind(
            input.title,
            input.description ?? null,
            input.imageUrl ?? null,
            input.type,
            input.visibility,
            input.householdId,
            input.servings ?? null,
            input.yield ?? null,
            input.prepMinutes ?? null,
            input.cookMinutes ?? null,
            JSON.stringify(input.ingredients),
            input.method ? JSON.stringify(input.method) : null,
            input.sourceReference ? JSON.stringify(input.sourceReference) : null,
            input.notes ?? null,
            JSON.stringify(dedupedTags),
            now,
            slug
        )
        .run();

    return getRecipeBySlug(db, slug);
}

export async function deleteRecipe(db: DbLike, slug: string): Promise<boolean> {
    const result = await db.prepare('DELETE FROM recipes WHERE id = ?1').bind(slug).run();
    return (result.meta?.changes ?? 0) > 0;
}
