import { describe, it, expect, afterEach } from 'vitest';
import { createTestDbPair, type TestDbPair } from './test-db';
import { generateShoppingList } from './shopping-list';

let pair: TestDbPair | undefined;

function setup(): TestDbPair {
	pair = createTestDbPair();
	return pair;
}

async function seedHousehold(db: TestDbPair['first'], householdId = 'h1'): Promise<void> {
	await db
		.prepare("INSERT OR IGNORE INTO users (id, name, auth_provider) VALUES ('owner-1', 'Owner', 'password')")
		.bind()
		.run();
	await db
		.prepare("INSERT INTO households (id, owner_user_id, name) VALUES (?1, 'owner-1', 'Test Family')")
		.bind(householdId)
		.run();
}

async function seedRecipe(
	db: TestDbPair['first'],
	id: string,
	title: string,
	servings: number | null,
	ingredients: unknown[]
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO recipes (id, title, type, visibility, servings, ingredients, tags, created_at, updated_at)
			VALUES (?1, ?2, 'full', 'public', ?3, ?4, '[]', ?5, ?5)`
		)
		.bind(id, title, servings, JSON.stringify(ingredients), new Date().toISOString())
		.run();
}

async function seedPlanEntry(
	db: TestDbPair['first'],
	planId: string,
	entryDate: string,
	mealType: string,
	recipeId: string,
	servings: number
): Promise<void> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	await db
		.prepare(
			`INSERT INTO meal_plan_entries (id, plan_id, entry_date, meal_type, recipe_id, servings, absent_member_ids, guest_covers, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, '[]', 0, ?7, ?7)`
		)
		.bind(id, planId, entryDate, mealType, recipeId, servings, now)
		.run();
}

async function seedPlan(db: TestDbPair['first'], householdId: string, weekStart: string): Promise<string> {
	const planId = crypto.randomUUID();
	const now = new Date().toISOString();
	await db
		.prepare(
			`INSERT INTO meal_plans (id, household_id, week_start, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?4)`
		)
		.bind(planId, householdId, weekStart, now)
		.run();
	return planId;
}

afterEach(() => {
	if (pair) {
		pair.cleanup();
		pair = undefined;
	}
});

describe('shopping list ingredient scaling', () => {
	it('should scale ingredient amounts when diners exceed recipe servings', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		await seedRecipe(db, 'r1', 'Pasta Bake', 2, [
			{ amount: 200, unit: 'g', ingredient: 'pasta' },
			{ amount: 100, unit: 'g', ingredient: 'cheese' }
		]);

		const planId = await seedPlan(db, 'h1', '2025-06-02');
		await seedPlanEntry(db, planId, '2025-06-02', 'dinner', 'r1', 4);

		const result = await generateShoppingList(db, 'h1', '2025-06-02');

		const allItems = result.categories.flatMap((c) => c.items);
		const pasta = allItems.find((i) => i.ingredient === 'pasta');
		const cheese = allItems.find((i) => i.ingredient === 'cheese');

		expect(pasta?.totalAmount).toBe(400);
		expect(cheese?.totalAmount).toBe(200);
	});

	it('should scale down when fewer diners than recipe servings', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		await seedRecipe(db, 'r1', 'Big Batch Soup', 8, [
			{ amount: 800, unit: 'ml', ingredient: 'stock' }
		]);

		const planId = await seedPlan(db, 'h1', '2025-06-02');
		await seedPlanEntry(db, planId, '2025-06-02', 'lunch', 'r1', 4);

		const result = await generateShoppingList(db, 'h1', '2025-06-02');

		const allItems = result.categories.flatMap((c) => c.items);
		const stock = allItems.find((i) => i.ingredient === 'stock');

		expect(stock?.totalAmount).toBe(400);
	});

	it('should not scale when recipe has no servings value', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		await seedRecipe(db, 'r1', 'Quick Salad', null, [
			{ amount: 2, unit: 'tbsp', ingredient: 'olive oil' }
		]);

		const planId = await seedPlan(db, 'h1', '2025-06-02');
		await seedPlanEntry(db, planId, '2025-06-02', 'lunch', 'r1', 4);

		const result = await generateShoppingList(db, 'h1', '2025-06-02');

		const allItems = result.categories.flatMap((c) => c.items);
		const oil = allItems.find((i) => i.ingredient === 'olive oil');

		expect(oil?.totalAmount).toBe(2);
	});

	it('should aggregate scaled amounts across multiple entries with different scale factors', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		await seedRecipe(db, 'r1', 'Pasta Bake', 2, [
			{ amount: 200, unit: 'g', ingredient: 'cheese' }
		]);
		await seedRecipe(db, 'r2', 'Cheese Toastie', 4, [
			{ amount: 100, unit: 'g', ingredient: 'cheese' }
		]);

		const planId = await seedPlan(db, 'h1', '2025-06-02');
		// Pasta Bake: serves 2, 4 diners → 2× → 400g cheese
		await seedPlanEntry(db, planId, '2025-06-02', 'dinner', 'r1', 4);
		// Cheese Toastie: serves 4, 2 diners → 0.5× → 50g cheese
		await seedPlanEntry(db, planId, '2025-06-03', 'lunch', 'r2', 2);

		const result = await generateShoppingList(db, 'h1', '2025-06-02');

		const allItems = result.categories.flatMap((c) => c.items);
		const cheese = allItems.find((i) => i.ingredient === 'cheese');

		// 400 + 50 = 450
		expect(cheese?.totalAmount).toBe(450);
	});

	it('should not scale ingredients with no amount', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		await seedRecipe(db, 'r1', 'Simple Dish', 2, [
			{ ingredient: 'salt' },
			{ amount: 100, unit: 'g', ingredient: 'butter' }
		]);

		const planId = await seedPlan(db, 'h1', '2025-06-02');
		await seedPlanEntry(db, planId, '2025-06-02', 'dinner', 'r1', 4);

		const result = await generateShoppingList(db, 'h1', '2025-06-02');

		const allItems = result.categories.flatMap((c) => c.items);
		const salt = allItems.find((i) => i.ingredient === 'salt');
		const butter = allItems.find((i) => i.ingredient === 'butter');

		expect(salt?.totalAmount).toBeUndefined();
		expect(butter?.totalAmount).toBe(200);
	});
});
