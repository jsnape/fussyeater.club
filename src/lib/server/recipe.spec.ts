import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from './test-db';
import { getRecipeBySlug, canViewRecipe } from './recipe';
import type { RecipeRow } from './recipe';
import type { AuthContext } from './security';

describe('getRecipeBySlug', () => {
	const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

	afterEach(() => {
		for (const pair of pairs.splice(0)) {
			pair.cleanup();
		}
	});

	async function seedRecipe(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
		await pair.first
			.prepare(
				`INSERT INTO recipes (id, title, type, visibility, ingredients, tags)
				 VALUES ('test-recipe', 'Test Recipe', 'full', 'public', '[]', '[]')`
			)
			.run();
	}

	it('should return a recipe for an existing slug', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedRecipe(pair);

		const recipe = await getRecipeBySlug(pair.first, 'test-recipe');
		expect(recipe).not.toBeNull();
		expect(recipe!.id).toBe('test-recipe');
		expect(recipe!.title).toBe('Test Recipe');
		expect(recipe!.type).toBe('full');
	});

	it('should return null for a non-existent slug', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);

		const recipe = await getRecipeBySlug(pair.first, 'does-not-exist');
		expect(recipe).toBeNull();
	});

	it('should return all recipe fields', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);

		await pair.first
			.prepare(
				`INSERT INTO recipes (id, title, description, image_url, type, visibility,
				 servings, yield, prep_minutes, cook_minutes, ingredients, method, notes, tags)
				 VALUES ('full-recipe', 'Full Recipe', 'A description', 'https://example.com/img.jpg',
				 'full', 'public', 4, '1 bowl', 10, 15,
				 '[{"amount":1,"ingredient":"flour"}]',
				 '["Step 1","Step 2"]',
				 'Some notes',
				 '["tag1","tag2"]')`
			)
			.run();

		const recipe = await getRecipeBySlug(pair.first, 'full-recipe');
		expect(recipe).not.toBeNull();
		expect(recipe!.description).toBe('A description');
		expect(recipe!.image_url).toBe('https://example.com/img.jpg');
		expect(recipe!.servings).toBe(4);
		expect(recipe!.yield).toBe('1 bowl');
		expect(recipe!.prep_minutes).toBe(10);
		expect(recipe!.cook_minutes).toBe(15);
		expect(recipe!.notes).toBe('Some notes');
	});
});

describe('canViewRecipe', () => {
	const publicRecipe: RecipeRow = {
		id: 'public-recipe',
		title: 'Public',
		description: null,
		image_url: null,
		type: 'full',
		visibility: 'public',
		household_id: null,
		servings: null,
		yield: null,
		prep_minutes: null,
		cook_minutes: null,
		ingredients: '[]',
		method: null,
		source_reference: null,
		notes: null,
		tags: '[]'
	};

	const privateRecipe: RecipeRow = {
		...publicRecipe,
		id: 'private-recipe',
		visibility: 'private',
		household_id: 'house-1'
	};

	const authenticatedAuth: AuthContext = {
		userId: 'user-1',
		email: 'user@example.com',
		name: 'User',
		socialProvider: null
	};

	const anonymousAuth: AuthContext = {
		userId: null,
		email: null,
		name: null,
		socialProvider: null
	};

	it('should allow anyone to view a public recipe', () => {
		expect(canViewRecipe(publicRecipe, anonymousAuth, null)).toBe(true);
	});

	it('should allow authenticated user to view a public recipe', () => {
		expect(canViewRecipe(publicRecipe, authenticatedAuth, null)).toBe(true);
	});

	it('should deny anonymous user access to a private recipe', () => {
		expect(canViewRecipe(privateRecipe, anonymousAuth, null)).toBe(false);
	});

	it('should allow household member to view their private recipe', () => {
		expect(canViewRecipe(privateRecipe, authenticatedAuth, 'house-1')).toBe(true);
	});

	it('should deny non-member access to a private recipe', () => {
		expect(canViewRecipe(privateRecipe, authenticatedAuth, 'other-house')).toBe(false);
	});

	it('should deny authenticated user without household access to a private recipe', () => {
		expect(canViewRecipe(privateRecipe, authenticatedAuth, null)).toBe(false);
	});
});
