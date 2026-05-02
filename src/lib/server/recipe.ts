import type { DbLike } from './db';
import type { AuthContext } from './security';

export type RecipeRow = {
	id: string;
	title: string;
	description: string | null;
	image_url: string | null;
	type: 'full' | 'reference';
	visibility: 'public' | 'private';
	household_id: string | null;
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

export async function getRecipeBySlug(db: DbLike, slug: string): Promise<RecipeRow | null> {
	return db
		.prepare(
			`SELECT id, title, description, image_url, type, visibility, household_id,
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
