import { describe, it, expect, afterEach } from 'vitest';
import { createTestDbPair, type TestDbPair } from './test-db';
import {
	createIngredient,
	updateIngredient,
	getIngredientById,
	deleteIngredient,
	listIngredients,
	getUnmappedIngredients,
	ingredientNameExists,
	toIngredientResponse,
	isValidFoodGroup,
	isValidPlantColour,
	isPlantFoodGroup,
	validateAllergens,
	FOOD_GROUPS,
	PLANT_COLOURS,
	STANDARD_ALLERGENS,
	type IngredientInput
} from './ingredient';
import { hasAdminFlag } from './admin';
import type { DbLike } from './db';

let pair: TestDbPair | undefined;

function getDb(): DbLike {
	pair = createTestDbPair();
	return pair.first;
}

async function seedUser(db: DbLike, id = 'user-1', isAdmin = false): Promise<void> {
	await db
		.prepare(
			'INSERT INTO users (id, email, name, password_hash, auth_provider, is_admin) VALUES (?, ?, ?, ?, ?, ?)'
		)
		.bind(id, `${id}@test.com`, `User ${id}`, 'hash', 'password', isAdmin ? 1 : 0)
		.run();
}

async function seedRecipeWithIngredients(
	db: DbLike,
	recipeId: string,
	ingredients: { ingredient: string }[]
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO recipes (id, title, description, type, visibility, servings, ingredients, method, tags)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			recipeId,
			`Recipe ${recipeId}`,
			'A test recipe',
			'full',
			'public',
			4,
			JSON.stringify(ingredients.map((i) => ({ amount: 1, unit: 'cup', ...i }))),
			'["Step 1"]',
			'["test"]'
		)
		.run();
}

afterEach(() => {
	if (pair) {
		pair.cleanup();
		pair = undefined;
	}
});

// ── Validation helpers ──────────────────────────────────

describe('validation helpers', () => {
	it('should validate food groups', () => {
		expect(isValidFoodGroup('dairy')).toBe(true);
		expect(isValidFoodGroup('vegetable')).toBe(true);
		expect(isValidFoodGroup('invalid')).toBe(false);
		expect(isValidFoodGroup(123)).toBe(false);
	});

	it('should validate plant colours', () => {
		expect(isValidPlantColour('red')).toBe(true);
		expect(isValidPlantColour('blue-purple')).toBe(true);
		expect(isValidPlantColour('pink')).toBe(false);
	});

	it('should identify plant food groups', () => {
		expect(isPlantFoodGroup('fruit')).toBe(true);
		expect(isPlantFoodGroup('vegetable')).toBe(true);
		expect(isPlantFoodGroup('herb')).toBe(true);
		expect(isPlantFoodGroup('spice')).toBe(false);
		expect(isPlantFoodGroup('legume')).toBe(true);
		expect(isPlantFoodGroup('meat')).toBe(false);
		expect(isPlantFoodGroup('dairy')).toBe(false);
	});

	it('should validate allergens', () => {
		expect(validateAllergens(['dairy', 'gluten'])).toBe(true);
		expect(validateAllergens(['buckwheat'])).toBe(true);
		expect(validateAllergens(['invalid-allergen'])).toBe(false);
		expect(validateAllergens([])).toBe(true);
	});

	it('should have 17 food groups', () => {
		expect(FOOD_GROUPS).toHaveLength(17);
	});

	it('should have 7 plant colours', () => {
		expect(PLANT_COLOURS).toHaveLength(7);
	});

	it('should have 15 standard allergens', () => {
		expect(STANDARD_ALLERGENS).toHaveLength(15);
	});
});

// ── Admin flag ──────────────────────────────────────────

describe('hasAdminFlag', () => {
	it('should return true for admin users', async () => {
		const db = getDb();
		await seedUser(db, 'admin-1', true);
		expect(await hasAdminFlag(db, 'admin-1')).toBe(true);
	});

	it('should return false for non-admin users', async () => {
		const db = getDb();
		await seedUser(db, 'user-1', false);
		expect(await hasAdminFlag(db, 'user-1')).toBe(false);
	});

	it('should return false for non-existent users', async () => {
		const db = getDb();
		expect(await hasAdminFlag(db, 'nonexistent')).toBe(false);
	});
});

// ── CRUD ────────────────────────────────────────────────

describe('createIngredient', () => {
	it('should create an ingredient with all fields', async () => {
		const db = getDb();
		const input: IngredientInput = {
			name: 'Aubergine',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'blue-purple',
			aliases: ['eggplant', 'brinjal'],
			description: 'A purple nightshade'
		};

		const row = await createIngredient(db, input);
		expect(row.name).toBe('Aubergine');
		expect(row.food_group).toBe('vegetable');
		expect(row.plant_colour).toBe('blue-purple');
		expect(JSON.parse(row.aliases)).toEqual(['eggplant', 'brinjal']);
		expect(row.description).toBe('A purple nightshade');
	});

	it('should create an ingredient with allergens', async () => {
		const db = getDb();
		const input: IngredientInput = {
			name: 'Milk',
			foodGroup: 'dairy',
			allergens: ['dairy'],
			plantColour: null,
			aliases: ['whole milk'],
			description: null
		};

		const row = await createIngredient(db, input);
		expect(JSON.parse(row.allergens)).toEqual(['dairy']);
		expect(row.plant_colour).toBeNull();
	});

	it('should lowercase aliases', async () => {
		const db = getDb();
		const row = await createIngredient(db, {
			name: 'Tomato',
			foodGroup: 'fruit',
			allergens: [],
			plantColour: 'red',
			aliases: ['TOMATO', 'Cherry Tomato'],
			description: null
		});

		expect(JSON.parse(row.aliases)).toEqual(['tomato', 'cherry tomato']);
	});
});

describe('updateIngredient', () => {
	it('should update an existing ingredient', async () => {
		const db = getDb();
		const created = await createIngredient(db, {
			name: 'Carrot',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'orange',
			aliases: [],
			description: null
		});

		const updated = await updateIngredient(db, created.id, {
			name: 'Carrot',
			foodGroup: 'vegetable',
			allergens: ['celery'],
			plantColour: 'orange',
			aliases: ['baby carrot'],
			description: 'Root vegetable'
		});

		expect(updated).not.toBeNull();
		expect(JSON.parse(updated!.allergens)).toEqual(['celery']);
		expect(JSON.parse(updated!.aliases)).toEqual(['baby carrot']);
		expect(updated!.description).toBe('Root vegetable');
	});

	it('should return null for non-existent id', async () => {
		const db = getDb();
		const result = await updateIngredient(db, 'nonexistent', {
			name: 'X',
			foodGroup: 'other',
			allergens: [],
			plantColour: null,
			aliases: [],
			description: null
		});

		expect(result).toBeNull();
	});
});

describe('getIngredientById', () => {
	it('should return ingredient by id', async () => {
		const db = getDb();
		const created = await createIngredient(db, {
			name: 'Garlic',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'white-brown',
			aliases: [],
			description: null
		});

		const found = await getIngredientById(db, created.id);
		expect(found).not.toBeNull();
		expect(found!.name).toBe('Garlic');
	});

	it('should return null for missing id', async () => {
		const db = getDb();
		const found = await getIngredientById(db, 'missing');
		expect(found).toBeNull();
	});
});

describe('deleteIngredient', () => {
	it('should delete an existing ingredient', async () => {
		const db = getDb();
		const created = await createIngredient(db, {
			name: 'Pepper',
			foodGroup: 'spice',
			allergens: [],
			plantColour: null,
			aliases: [],
			description: null
		});

		expect(await deleteIngredient(db, created.id)).toBe(true);
		expect(await getIngredientById(db, created.id)).toBeNull();
	});

	it('should return false for missing id', async () => {
		const db = getDb();
		expect(await deleteIngredient(db, 'missing')).toBe(false);
	});
});

// ── List & Search ───────────────────────────────────────

describe('listIngredients', () => {
	async function seedMany(db: DbLike) {
		await createIngredient(db, { name: 'Apple', foodGroup: 'fruit', allergens: [], plantColour: 'red', aliases: [], description: null });
		await createIngredient(db, { name: 'Banana', foodGroup: 'fruit', allergens: [], plantColour: 'yellow', aliases: [], description: null });
		await createIngredient(db, { name: 'Chicken', foodGroup: 'poultry', allergens: [], plantColour: null, aliases: [], description: null });
		await createIngredient(db, { name: 'Milk', foodGroup: 'dairy', allergens: ['dairy'], plantColour: null, aliases: ['whole milk'], description: null });
		await createIngredient(db, { name: 'Wheat Flour', foodGroup: 'grain', allergens: ['gluten'], plantColour: null, aliases: ['plain flour'], description: null });
	}

	it('should list all ingredients with pagination', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { page: 1, pageSize: 3 });
		expect(result.items).toHaveLength(3);
		expect(result.total).toBe(5);
	});

	it('should filter by search term in name', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { search: 'apple' });
		expect(result.items).toHaveLength(1);
		expect(result.items[0].name).toBe('Apple');
	});

	it('should filter by search term in aliases', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { search: 'plain flour' });
		expect(result.items).toHaveLength(1);
		expect(result.items[0].name).toBe('Wheat Flour');
	});

	it('should filter by food group', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { foodGroup: 'fruit' });
		expect(result.items).toHaveLength(2);
		expect(result.total).toBe(2);
	});

	it('should filter by allergen', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { allergen: 'dairy' });
		expect(result.items).toHaveLength(1);
		expect(result.items[0].name).toBe('Milk');
	});

	it('should filter by plant colour', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { plantColour: 'red' });
		expect(result.items).toHaveLength(1);
		expect(result.items[0].name).toBe('Apple');
	});

	it('should sort by name descending', async () => {
		const db = getDb();
		await seedMany(db);

		const result = await listIngredients(db, { sort: 'name-desc' });
		expect(result.items[0].name).toBe('Wheat Flour');
	});
});

// ── Unmapped ingredients ────────────────────────────────

describe('getUnmappedIngredients', () => {
	it('should find recipe ingredients not in canonical database', async () => {
		const db = getDb();

		// Seed a canonical ingredient
		await createIngredient(db, {
			name: 'Chicken',
			foodGroup: 'poultry',
			allergens: [],
			plantColour: null,
			aliases: [],
			description: null
		});

		// Seed recipes with some mapped and unmapped ingredients
		await seedRecipeWithIngredients(db, 'recipe-1', [
			{ ingredient: 'chicken' },
			{ ingredient: 'garlic' },
			{ ingredient: 'olive oil' }
		]);
		await seedRecipeWithIngredients(db, 'recipe-2', [
			{ ingredient: 'garlic' },
			{ ingredient: 'onion' }
		]);

		const unmapped = await getUnmappedIngredients(db);

		expect(unmapped).toHaveLength(3);
		const garlic = unmapped.find((u) => u.name === 'garlic');
		expect(garlic).toBeDefined();
		expect(garlic!.recipeCount).toBe(2);

		// Sorted by count descending
		expect(unmapped[0].name).toBe('garlic');
	});

	it('should match by alias too', async () => {
		const db = getDb();

		await createIngredient(db, {
			name: 'Aubergine',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'blue-purple',
			aliases: ['eggplant'],
			description: null
		});

		await seedRecipeWithIngredients(db, 'recipe-1', [
			{ ingredient: 'eggplant' }
		]);

		const unmapped = await getUnmappedIngredients(db);
		expect(unmapped).toHaveLength(0);
	});

	it('should return empty when all ingredients are mapped', async () => {
		const db = getDb();

		await createIngredient(db, {
			name: 'Salt',
			foodGroup: 'condiment',
			allergens: [],
			plantColour: null,
			aliases: [],
			description: null
		});

		await seedRecipeWithIngredients(db, 'recipe-1', [
			{ ingredient: 'salt' }
		]);

		const unmapped = await getUnmappedIngredients(db);
		expect(unmapped).toHaveLength(0);
	});

	it('should match plural recipe names to singular canonical names', async () => {
		const db = getDb();

		await createIngredient(db, {
			name: 'Egg',
			foodGroup: 'dairy',
			allergens: ['eggs'],
			plantColour: null,
			aliases: [],
			description: null
		});

		await createIngredient(db, {
			name: 'Tomato',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'red',
			aliases: [],
			description: null
		});

		await seedRecipeWithIngredients(db, 'recipe-1', [
			{ ingredient: 'eggs' },
			{ ingredient: 'tomatoes' }
		]);

		const unmapped = await getUnmappedIngredients(db);
		expect(unmapped).toHaveLength(0);
	});

	it('should match singular recipe names to plural canonical names', async () => {
		const db = getDb();

		await createIngredient(db, {
			name: 'Olives',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'green',
			aliases: [],
			description: null
		});

		await seedRecipeWithIngredients(db, 'recipe-1', [
			{ ingredient: 'olive' }
		]);

		const unmapped = await getUnmappedIngredients(db);
		expect(unmapped).toHaveLength(0);
	});
});

// ── Name uniqueness ─────────────────────────────────────

describe('ingredientNameExists', () => {
	it('should detect existing name case-insensitively', async () => {
		const db = getDb();
		await createIngredient(db, {
			name: 'Tomato',
			foodGroup: 'fruit',
			allergens: [],
			plantColour: 'red',
			aliases: [],
			description: null
		});

		expect(await ingredientNameExists(db, 'Tomato')).toBe(true);
		expect(await ingredientNameExists(db, 'tomato')).toBe(true);
		expect(await ingredientNameExists(db, 'TOMATO')).toBe(true);
		expect(await ingredientNameExists(db, 'Potato')).toBe(false);
	});

	it('should exclude a specific id', async () => {
		const db = getDb();
		const created = await createIngredient(db, {
			name: 'Tomato',
			foodGroup: 'fruit',
			allergens: [],
			plantColour: 'red',
			aliases: [],
			description: null
		});

		expect(await ingredientNameExists(db, 'Tomato', created.id)).toBe(false);
		expect(await ingredientNameExists(db, 'Tomato', 'other-id')).toBe(true);
	});
});

// ── Response formatting ─────────────────────────────────

describe('toIngredientResponse', () => {
	it('should format a row to response', async () => {
		const db = getDb();
		const row = await createIngredient(db, {
			name: 'Broccoli',
			foodGroup: 'vegetable',
			allergens: [],
			plantColour: 'green',
			aliases: ['calabrese'],
			description: 'Green vegetable'
		});

		const response = toIngredientResponse(row);
		expect(response.name).toBe('Broccoli');
		expect(response.foodGroup).toBe('vegetable');
		expect(response.plantColour).toBe('green');
		expect(response.aliases).toEqual(['calabrese']);
		expect(response.allergens).toEqual([]);
		expect(response.description).toBe('Green vegetable');
		expect(response.id).toBeTruthy();
		expect(response.createdAt).toBeTruthy();
	});
});
