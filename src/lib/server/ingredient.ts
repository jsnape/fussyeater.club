import type { DbLike } from './db';
import { nowIso } from './db';

// ── Constants ────────────────────────────────────────────

export const FOOD_GROUPS = [
	'dairy', 'meat', 'poultry', 'fish', 'shellfish', 'grain',
	'fruit', 'vegetable', 'herb', 'spice', 'legume',
	'nut', 'seed', 'oil', 'condiment', 'sweetener', 'other'
] as const;

export type FoodGroup = (typeof FOOD_GROUPS)[number];

export const PLANT_FOOD_GROUPS: ReadonlySet<string> = new Set([
	'fruit', 'vegetable', 'herb', 'spice', 'legume'
]);

export const PLANT_COLOURS = [
	'red', 'orange', 'yellow', 'green', 'blue-purple', 'white-brown'
] as const;

export type PlantColour = (typeof PLANT_COLOURS)[number];

export const STANDARD_ALLERGENS = [
	'celery', 'gluten', 'crustaceans', 'eggs', 'fish', 'lupin',
	'dairy', 'molluscs', 'mustard', 'tree-nuts', 'peanuts',
	'sesame', 'soya', 'sulphites', 'buckwheat'
] as const;

export type StandardAllergen = (typeof STANDARD_ALLERGENS)[number];

// ── Types ────────────────────────────────────────────────

export type IngredientRow = {
	id: string;
	name: string;
	food_group: FoodGroup;
	allergens: string;
	plant_colour: PlantColour | null;
	aliases: string;
	description: string | null;
	created_at: string;
	updated_at: string;
};

export type IngredientInput = {
	name: string;
	foodGroup: FoodGroup;
	allergens: string[];
	plantColour: PlantColour | null;
	aliases: string[];
	description: string | null;
};

export type IngredientResponse = {
	id: string;
	name: string;
	foodGroup: FoodGroup;
	allergens: string[];
	plantColour: PlantColour | null;
	aliases: string[];
	description: string | null;
	createdAt: string;
	updatedAt: string;
};

export type UnmappedIngredient = {
	name: string;
	recipeCount: number;
};

// ── Helpers ──────────────────────────────────────────────

function parseJsonColumn<T>(value: string | null | undefined): T {
	if (!value) return [] as unknown as T;
	try {
		return JSON.parse(value) as T;
	} catch {
		return [] as unknown as T;
	}
}

export function toIngredientResponse(row: IngredientRow): IngredientResponse {
	return {
		id: row.id,
		name: row.name,
		foodGroup: row.food_group,
		allergens: parseJsonColumn<string[]>(row.allergens),
		plantColour: row.plant_colour,
		aliases: parseJsonColumn<string[]>(row.aliases),
		description: row.description,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

export function isValidFoodGroup(value: unknown): value is FoodGroup {
	return typeof value === 'string' && FOOD_GROUPS.includes(value as FoodGroup);
}

export function isValidPlantColour(value: unknown): value is PlantColour {
	return typeof value === 'string' && PLANT_COLOURS.includes(value as PlantColour);
}

export function isPlantFoodGroup(group: string): boolean {
	return PLANT_FOOD_GROUPS.has(group);
}

export function validateAllergens(allergens: unknown[]): boolean {
	return allergens.every(
		(a) => typeof a === 'string' && STANDARD_ALLERGENS.includes(a as StandardAllergen)
	);
}

// ── CRUD ─────────────────────────────────────────────────

export async function createIngredient(
	db: DbLike,
	input: IngredientInput
): Promise<IngredientRow> {
	const id = crypto.randomUUID();
	const now = nowIso();

	await db
		.prepare(
			`INSERT INTO ingredients (id, name, food_group, allergens, plant_colour, aliases, description, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
		)
		.bind(
			id,
			input.name.trim(),
			input.foodGroup,
			JSON.stringify(input.allergens),
			input.plantColour,
			JSON.stringify(input.aliases.map((a) => a.trim().toLowerCase())),
			input.description,
			now,
			now
		)
		.run();

	const row = await db
		.prepare('SELECT * FROM ingredients WHERE id = ?')
		.bind(id)
		.first<IngredientRow>();

	if (!row) throw new Error('Failed to create ingredient');
	return row;
}

export async function updateIngredient(
	db: DbLike,
	id: string,
	input: IngredientInput
): Promise<IngredientRow | null> {
	const now = nowIso();

	const result = await db
		.prepare(
			`UPDATE ingredients
			 SET name = ?1, food_group = ?2, allergens = ?3, plant_colour = ?4, aliases = ?5, description = ?6, updated_at = ?7
			 WHERE id = ?8`
		)
		.bind(
			input.name.trim(),
			input.foodGroup,
			JSON.stringify(input.allergens),
			input.plantColour,
			JSON.stringify(input.aliases.map((a) => a.trim().toLowerCase())),
			input.description,
			now,
			id
		)
		.run();

	if (!result.meta?.changes) return null;

	return db.prepare('SELECT * FROM ingredients WHERE id = ?').bind(id).first<IngredientRow>();
}

export async function getIngredientById(
	db: DbLike,
	id: string
): Promise<IngredientRow | null> {
	return db.prepare('SELECT * FROM ingredients WHERE id = ?').bind(id).first<IngredientRow>();
}

export async function deleteIngredient(
	db: DbLike,
	id: string
): Promise<boolean> {
	const result = await db
		.prepare('DELETE FROM ingredients WHERE id = ?')
		.bind(id)
		.run();

	return (result.meta?.changes ?? 0) > 0;
}

export type ListIngredientsOptions = {
	search?: string;
	foodGroup?: string;
	allergen?: string;
	plantColour?: string;
	sort?: 'name' | 'name-desc' | 'updated' | 'food-group';
	page?: number;
	pageSize?: number;
};

export async function listIngredients(
	db: DbLike,
	options: ListIngredientsOptions = {}
): Promise<{ items: IngredientRow[]; total: number }> {
	const page = Math.max(1, options.page ?? 1);
	const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 50));
	const offset = (page - 1) * pageSize;

	const conditions: string[] = [];
	const params: unknown[] = [];
	let paramIndex = 1;

	if (options.search) {
		const searchLower = `%${options.search.toLowerCase()}%`;
		conditions.push(`(LOWER(name) LIKE ?${paramIndex} OR LOWER(aliases) LIKE ?${paramIndex})`);
		params.push(searchLower);
		paramIndex++;
	}

	if (options.foodGroup) {
		conditions.push(`food_group = ?${paramIndex}`);
		params.push(options.foodGroup);
		paramIndex++;
	}

	if (options.allergen) {
		conditions.push(`allergens LIKE ?${paramIndex}`);
		params.push(`%"${options.allergen}"%`);
		paramIndex++;
	}

	if (options.plantColour) {
		conditions.push(`plant_colour = ?${paramIndex}`);
		params.push(options.plantColour);
		paramIndex++;
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	let orderBy = 'name COLLATE NOCASE ASC';
	switch (options.sort) {
		case 'name-desc':
			orderBy = 'name COLLATE NOCASE DESC';
			break;
		case 'updated':
			orderBy = 'updated_at DESC';
			break;
		case 'food-group':
			orderBy = 'food_group ASC, name COLLATE NOCASE ASC';
			break;
	}

	const countResult = await db
		.prepare(`SELECT COUNT(*) as count FROM ingredients ${where}`)
		.bind(...params)
		.first<{ count: number }>();

	const total = countResult?.count ?? 0;

	const listResult = await db
		.prepare(
			`SELECT * FROM ingredients ${where} ORDER BY ${orderBy} LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}`
		)
		.bind(...params, pageSize, offset)
		.all<IngredientRow>();

	return { items: listResult.results ?? [], total };
}

export async function getUnmappedIngredients(
	db: DbLike
): Promise<UnmappedIngredient[]> {
	// Extract all unique ingredient names from recipe JSON, then find those
	// not matching any canonical ingredient name or alias
	const recipes = await db
		.prepare('SELECT ingredients FROM recipes WHERE ingredients IS NOT NULL AND ingredients != \'[]\'')
		.all<{ ingredients: string }>();

	const ingredientCounts = new Map<string, number>();

	for (const recipe of recipes.results ?? []) {
		try {
			const items = JSON.parse(recipe.ingredients) as { ingredient?: string }[];
			for (const item of items) {
				if (item.ingredient) {
					const name = item.ingredient.trim().toLowerCase();
					ingredientCounts.set(name, (ingredientCounts.get(name) ?? 0) + 1);
				}
			}
		} catch {
			// skip invalid JSON
		}
	}

	// Get all canonical names and aliases
	const canonicals = await db
		.prepare('SELECT name, aliases FROM ingredients')
		.all<{ name: string; aliases: string }>();

	const knownNames = new Set<string>();
	for (const row of canonicals.results ?? []) {
		knownNames.add(row.name.toLowerCase());
		const aliases = parseJsonColumn<string[]>(row.aliases);
		for (const alias of aliases) {
			knownNames.add(alias.toLowerCase());
		}
	}

	const unmapped: UnmappedIngredient[] = [];
	for (const [name, count] of ingredientCounts) {
		if (!knownNames.has(name)) {
			unmapped.push({ name, recipeCount: count });
		}
	}

	unmapped.sort((a, b) => b.recipeCount - a.recipeCount);
	return unmapped;
}

export async function ingredientNameExists(
	db: DbLike,
	name: string,
	excludeId?: string
): Promise<boolean> {
	const query = excludeId
		? 'SELECT id FROM ingredients WHERE name = ? COLLATE NOCASE AND id != ?'
		: 'SELECT id FROM ingredients WHERE name = ? COLLATE NOCASE';

	const row = excludeId
		? await db.prepare(query).bind(name.trim(), excludeId).first()
		: await db.prepare(query).bind(name.trim()).first();

	return row !== null;
}
