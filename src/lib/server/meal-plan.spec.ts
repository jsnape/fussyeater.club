import { describe, it, expect, afterEach } from 'vitest';
import { createTestDbPair, type TestDbPair } from './test-db';
import {
	getOrCreateWeekPlan,
	getWeekPlanEntries,
	upsertEntry,
	removeEntry,
	copyPreviousWeek,
	toEntryResponse,
	checkCompatibility,
	getWeekStartMonday,
	getWeekDates,
	getPreviousWeekStart,
	isValidIsoDate,
	validateMealType,
	getEntryById
} from './meal-plan';
import type { MemberProfile } from './profile';

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
	ingredients: unknown[] = [{ ingredient: 'chicken' }]
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO recipes (id, title, type, visibility, ingredients, tags, created_at, updated_at)
			VALUES (?1, ?2, 'full', 'public', ?3, '[]', ?4, ?4)`
		)
		.bind(id, title, JSON.stringify(ingredients), new Date().toISOString())
		.run();
}

afterEach(() => {
	if (pair) {
		pair.cleanup();
		pair = undefined;
	}
});

// ── Week utilities ───────────────────────────────────────

describe('week utilities', () => {
	it('should validate ISO dates', () => {
		expect(isValidIsoDate('2026-05-18')).toBe(true);
		expect(isValidIsoDate('not-a-date')).toBe(false);
		expect(isValidIsoDate('2026-13-01')).toBe(false);
		expect(isValidIsoDate('')).toBe(false);
	});

	it('should calculate Monday week start from any day', () => {
		expect(getWeekStartMonday('2026-05-18')).toBe('2026-05-18'); // Monday
		expect(getWeekStartMonday('2026-05-20')).toBe('2026-05-18'); // Wednesday
		expect(getWeekStartMonday('2026-05-24')).toBe('2026-05-18'); // Sunday
		expect(getWeekStartMonday('2026-05-17')).toBe('2026-05-11'); // Saturday
	});

	it('should generate 7 consecutive dates', () => {
		const dates = getWeekDates('2026-05-18');
		expect(dates).toHaveLength(7);
		expect(dates[0]).toBe('2026-05-18');
		expect(dates[6]).toBe('2026-05-24');
	});

	it('should calculate previous week start', () => {
		expect(getPreviousWeekStart('2026-05-18')).toBe('2026-05-11');
	});

	it('should validate meal types', () => {
		expect(validateMealType('breakfast')).toBe(true);
		expect(validateMealType('lunch')).toBe(true);
		expect(validateMealType('dinner')).toBe(true);
		expect(validateMealType('brunch')).toBe(false);
		expect(validateMealType('')).toBe(false);
		expect(validateMealType(42)).toBe(false);
	});
});

// ── Plan CRUD ────────────────────────────────────────────

describe('getOrCreateWeekPlan', () => {
	it('should create a new plan when none exists', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');
		expect(plan.household_id).toBe('h1');
		expect(plan.week_start).toBe('2026-05-18');
		expect(plan.id).toBeTruthy();
	});

	it('should return existing plan for same week', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		const plan1 = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');
		const plan2 = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');
		expect(plan2.id).toBe(plan1.id);
	});

	it('should normalise mid-week dates to Monday', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-20'); // Wednesday
		expect(plan.week_start).toBe('2026-05-18');
	});

	it('should create separate plans for different weeks', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		const plan1 = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');
		const plan2 = await getOrCreateWeekPlan(db, 'h1', '2026-05-25');
		expect(plan2.id).not.toBe(plan1.id);
	});
});

// ── Entry CRUD ───────────────────────────────────────────

describe('upsertEntry', () => {
	it('should create a new entry with a recipe', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		await seedRecipe(db, 'chicken-soup', 'Chicken Soup');
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-19',
			mealType: 'dinner',
			recipeId: 'chicken-soup',
			servings: 4
		});

		expect(entry.recipe_id).toBe('chicken-soup');
		expect(entry.meal_type).toBe('dinner');
		expect(entry.entry_date).toBe('2026-05-19');
		expect(entry.servings).toBe(4);
	});

	it('should create a custom note entry without recipe', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'lunch',
			customNote: 'Eat out'
		});

		expect(entry.recipe_id).toBeNull();
		expect(entry.custom_note).toBe('Eat out');
	});

	it('should replace existing entry for same cell', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		await seedRecipe(db, 'soup', 'Soup');
		await seedRecipe(db, 'pasta', 'Pasta');
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			recipeId: 'soup'
		});

		const replaced = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			recipeId: 'pasta'
		});

		expect(replaced.recipe_id).toBe('pasta');

		const entries = await getWeekPlanEntries(db, plan.id);
		const dinnerEntries = entries.filter(
			(e) => e.entry_date === '2026-05-18' && e.meal_type === 'dinner'
		);
		expect(dinnerEntries).toHaveLength(1);
	});

	it('should default servings to 4', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'breakfast',
			customNote: 'Cereal'
		});

		expect(entry.servings).toBe(4);
	});

	it('should persist absent member IDs', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			customNote: 'Pizza',
			absentMemberIds: ['u2', 'dep-1']
		});

		expect(JSON.parse(entry.absent_member_ids)).toEqual(['u2', 'dep-1']);
	});

	it('should persist guest covers', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			customNote: 'BBQ',
			guestCovers: 3
		});

		expect(entry.guest_covers).toBe(3);
	});

	it('should default attendance to all attending with 0 guests', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'lunch',
			customNote: 'Sandwiches'
		});

		expect(JSON.parse(entry.absent_member_ids)).toEqual([]);
		expect(entry.guest_covers).toBe(0);
	});

	it('should update attendance on upsert of same cell', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			customNote: 'Pizza'
		});

		const updated = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			customNote: 'Pizza',
			absentMemberIds: ['u1'],
			guestCovers: 2
		});

		expect(JSON.parse(updated.absent_member_ids)).toEqual(['u1']);
		expect(updated.guest_covers).toBe(2);
	});
});

describe('removeEntry', () => {
	it('should remove an existing entry', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'lunch',
			customNote: 'Eat out'
		});

		const removed = await removeEntry(db, entry.id, plan.id);
		expect(removed).toBe(true);

		const entries = await getWeekPlanEntries(db, plan.id);
		expect(entries).toHaveLength(0);
	});

	it('should return false for non-existent entry', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const removed = await removeEntry(db, 'nonexistent', plan.id);
		expect(removed).toBe(false);
	});
});

// ── Week plan entries with recipes ───────────────────────

describe('getWeekPlanEntries', () => {
	it('should return entries with recipe details', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		await seedRecipe(db, 'pasta-bake', 'Pasta Bake', [
			{ ingredient: 'pasta' },
			{ ingredient: 'cheese' }
		]);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			recipeId: 'pasta-bake',
			servings: 6,
			notes: 'Extra cheese'
		});

		const entries = await getWeekPlanEntries(db, plan.id);
		expect(entries).toHaveLength(1);
		expect(entries[0].recipe_title).toBe('Pasta Bake');
		expect(entries[0].recipe_id).toBe('pasta-bake');
		expect(entries[0].notes).toBe('Extra cheese');
	});

	it('should return entries ordered by date and meal type', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-19',
			mealType: 'dinner',
			customNote: 'Pizza'
		});
		await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'breakfast',
			customNote: 'Toast'
		});
		await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'dinner',
			customNote: 'Pasta'
		});

		const entries = await getWeekPlanEntries(db, plan.id);
		expect(entries).toHaveLength(3);
		expect(entries[0].entry_date).toBe('2026-05-18');
		expect(entries[0].meal_type).toBe('breakfast');
		expect(entries[1].entry_date).toBe('2026-05-18');
		expect(entries[1].meal_type).toBe('dinner');
		expect(entries[2].entry_date).toBe('2026-05-19');
	});

	it('should return empty array for empty plan', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entries = await getWeekPlanEntries(db, plan.id);
		expect(entries).toHaveLength(0);
	});
});

// ── Copy previous week ──────────────────────────────────

describe('copyPreviousWeek', () => {
	it('should copy entries from previous week with shifted dates', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		await seedRecipe(db, 'soup', 'Soup');
		const prevPlan = await getOrCreateWeekPlan(db, 'h1', '2026-05-11');

		await upsertEntry(db, prevPlan.id, {
			weekStart: '2026-05-11',
			entryDate: '2026-05-11',
			mealType: 'dinner',
			recipeId: 'soup',
			servings: 4
		});
		await upsertEntry(db, prevPlan.id, {
			weekStart: '2026-05-11',
			entryDate: '2026-05-13',
			mealType: 'lunch',
			customNote: 'Leftovers'
		});

		const copied = await copyPreviousWeek(db, 'h1', '2026-05-18');
		expect(copied).toBe(2);

		const targetPlan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');
		const entries = await getWeekPlanEntries(db, targetPlan.id);
		expect(entries).toHaveLength(2);
		expect(entries[0].entry_date).toBe('2026-05-18'); // shifted from 11th
		expect(entries[0].recipe_id).toBe('soup');
		expect(entries[1].entry_date).toBe('2026-05-20'); // shifted from 13th
		expect(entries[1].custom_note).toBe('Leftovers');
	});

	it('should return 0 when no previous week exists', async () => {
		const { first: db } = setup();
		await seedHousehold(db);

		const copied = await copyPreviousWeek(db, 'h1', '2026-05-18');
		expect(copied).toBe(0);
	});

	it('should return 0 when previous week has no entries', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		await getOrCreateWeekPlan(db, 'h1', '2026-05-11');

		const copied = await copyPreviousWeek(db, 'h1', '2026-05-18');
		expect(copied).toBe(0);
	});

	it('should copy attendance data from previous week', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const prevPlan = await getOrCreateWeekPlan(db, 'h1', '2026-05-11');

		await upsertEntry(db, prevPlan.id, {
			weekStart: '2026-05-11',
			entryDate: '2026-05-11',
			mealType: 'dinner',
			customNote: 'Pizza',
			absentMemberIds: ['u2'],
			guestCovers: 2
		});

		await copyPreviousWeek(db, 'h1', '2026-05-18');

		const targetPlan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');
		const entries = await getWeekPlanEntries(db, targetPlan.id);
		expect(entries).toHaveLength(1);
		expect(JSON.parse(entries[0].absent_member_ids)).toEqual(['u2']);
		expect(entries[0].guest_covers).toBe(2);
	});
});

// ── Compatibility checking ──────────────────────────────

describe('checkCompatibility', () => {
	const profiles: MemberProfile[] = [
		{
			userId: 'u1',
			name: 'Alex',
			role: 'member',
			allergies: [{ ingredient: 'dairy', severity: 'severe' }],
			textures: [],
			safeFoods: [],
			dislikes: ['mushroom']
		},
		{
			userId: 'u2',
			name: 'Sam',
			role: 'member',
			allergies: [],
			textures: [],
			safeFoods: [],
			dislikes: []
		}
	];

	it('should flag allergy matches', () => {
		const result = checkCompatibility(
			JSON.stringify([{ ingredient: 'milk' }, { ingredient: 'dairy cheese' }]),
			profiles
		);
		expect(result.safe).toBe(false);
		expect(result.hasAllergyAlert).toBe(true);
		expect(result.alerts).toHaveLength(1);
		expect(result.alerts[0].memberName).toBe('Alex');
		expect(result.alerts[0].reason).toBe('allergy');
		expect(result.alerts[0].severity).toBe('severe');
		expect(result.alerts[0].ingredient).toBe('dairy cheese');
	});

	it('should flag dislike matches', () => {
		const result = checkCompatibility(
			JSON.stringify([{ ingredient: 'mushroom risotto' }]),
			profiles
		);
		// "mushroom risotto" contains "mushroom" — should flag
		expect(result.safe).toBe(false);
		expect(result.hasAllergyAlert).toBe(false);
		expect(result.alerts.some((a) => a.reason === 'dislike' && a.memberName === 'Alex')).toBe(true);
	});

	it('should return safe for no conflicts', () => {
		const result = checkCompatibility(
			JSON.stringify([{ ingredient: 'chicken' }, { ingredient: 'rice' }]),
			profiles
		);
		expect(result.safe).toBe(true);
		expect(result.hasAllergyAlert).toBe(false);
		expect(result.alerts).toHaveLength(0);
	});

	it('should handle null ingredients', () => {
		const result = checkCompatibility(null, profiles);
		expect(result.safe).toBe(true);
		expect(result.hasAllergyAlert).toBe(false);
	});

	it('should handle empty profiles', () => {
		const result = checkCompatibility(
			JSON.stringify([{ ingredient: 'dairy' }]),
			[]
		);
		expect(result.safe).toBe(true);
		expect(result.hasAllergyAlert).toBe(false);
	});
});

// ── Entry response formatting ────────────────────────────

describe('toEntryResponse', () => {
	it('should format recipe entry with compatibility', () => {
		const profiles: MemberProfile[] = [
			{
				userId: 'u1',
				name: 'Alex',
				role: 'member',
				allergies: [{ ingredient: 'nuts', severity: 'severe' }],
				textures: [],
				safeFoods: [],
				dislikes: []
			}
		];

		const response = toEntryResponse(
			{
				id: 'e1',
				plan_id: 'p1',
				entry_date: '2026-05-18',
				meal_type: 'dinner',
				recipe_id: 'pad-thai',
				custom_note: null,
				servings: 4,
				notes: 'Extra spicy',
				absent_member_ids: '[]',
				guest_covers: 0,
				recipe_title: 'Pad Thai',
				recipe_image_url: '/images/pad-thai.jpg',
				recipe_prep_minutes: 15,
				recipe_cook_minutes: 20,
				recipe_tags: '["thai","quick"]',
				recipe_ingredients: JSON.stringify([
					{ ingredient: 'peanuts' },
					{ ingredient: 'noodles' }
				]),
				recipe_servings: null
			},
			profiles
		);

		expect(response.recipe?.title).toBe('Pad Thai');
		expect(response.recipe?.timings?.prepMinutes).toBe(15);
		expect(response.recipe?.tags).toEqual(['thai', 'quick']);
		expect(response.compatibility.safe).toBe(false);
		expect(response.compatibility.alerts).toHaveLength(1);
		expect(response.notes).toBe('Extra spicy');
	});

	it('should format custom note entry as safe', () => {
		const response = toEntryResponse(
			{
				id: 'e2',
				plan_id: 'p1',
				entry_date: '2026-05-18',
				meal_type: 'lunch',
				recipe_id: null,
				custom_note: 'Eat out',
				servings: 4,
				notes: null,
				absent_member_ids: '[]',
				guest_covers: 0,
				recipe_title: null,
				recipe_image_url: null,
				recipe_prep_minutes: null,
				recipe_cook_minutes: null,
				recipe_tags: null,
				recipe_ingredients: null,
				recipe_servings: null
			},
			[]
		);

		expect(response.recipe).toBeUndefined();
		expect(response.customNote).toBe('Eat out');
		expect(response.compatibility.safe).toBe(true);
	});

	it('should mark absent members from absent_member_ids', () => {
		const profiles: MemberProfile[] = [
			{ userId: 'u1', name: 'Alex', role: 'member', allergies: [], textures: [], safeFoods: [], dislikes: [] },
			{ userId: 'u2', name: 'Sam', role: 'member', allergies: [], textures: [], safeFoods: [], dislikes: [] }
		];

		const response = toEntryResponse(
			{
				id: 'e3',
				plan_id: 'p1',
				entry_date: '2026-05-18',
				meal_type: 'dinner',
				recipe_id: null,
				custom_note: 'Pizza',
				servings: 1,
				notes: null,
				absent_member_ids: '["u2"]',
				guest_covers: 0,
				recipe_title: null,
				recipe_image_url: null,
				recipe_prep_minutes: null,
				recipe_cook_minutes: null,
				recipe_tags: null,
				recipe_ingredients: null,
				recipe_servings: null
			},
			profiles
		);

		expect(response.attendees).toHaveLength(2);
		expect(response.attendees.find((a) => a.memberId === 'u1')?.isAttending).toBe(true);
		expect(response.attendees.find((a) => a.memberId === 'u2')?.isAttending).toBe(false);
		expect(response.guestCovers).toBe(0);
	});

	it('should return guest covers from entry', () => {
		const response = toEntryResponse(
			{
				id: 'e4',
				plan_id: 'p1',
				entry_date: '2026-05-18',
				meal_type: 'dinner',
				recipe_id: null,
				custom_note: 'BBQ',
				servings: 6,
				notes: null,
				absent_member_ids: '[]',
				guest_covers: 3,
				recipe_title: null,
				recipe_image_url: null,
				recipe_prep_minutes: null,
				recipe_cook_minutes: null,
				recipe_tags: null,
				recipe_ingredients: null,
				recipe_servings: null
			},
			[]
		);

		expect(response.guestCovers).toBe(3);
	});

	it('should only check compatibility for attending members', () => {
		const profiles: MemberProfile[] = [
			{
				userId: 'u1',
				name: 'Alex',
				role: 'member',
				allergies: [{ ingredient: 'nuts', severity: 'severe' }],
				textures: [],
				safeFoods: [],
				dislikes: []
			},
			{
				userId: 'u2',
				name: 'Sam',
				role: 'member',
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			}
		];

		// Alex (allergic to nuts) is absent — should be safe
		const response = toEntryResponse(
			{
				id: 'e5',
				plan_id: 'p1',
				entry_date: '2026-05-18',
				meal_type: 'dinner',
				recipe_id: 'pad-thai',
				custom_note: null,
				servings: 1,
				notes: null,
				absent_member_ids: '["u1"]',
				guest_covers: 0,
				recipe_title: 'Pad Thai',
				recipe_image_url: null,
				recipe_prep_minutes: null,
				recipe_cook_minutes: null,
				recipe_tags: null,
				recipe_ingredients: JSON.stringify([{ ingredient: 'peanuts' }]),
				recipe_servings: null
			},
			profiles
		);

		expect(response.compatibility.safe).toBe(true);
		expect(response.compatibility.alerts).toHaveLength(0);
	});
});

// ── getEntryById ────────────────────────────────────────

describe('getEntryById', () => {
	it('should return entry with household id', async () => {
		const { first: db } = setup();
		await seedHousehold(db);
		const plan = await getOrCreateWeekPlan(db, 'h1', '2026-05-18');

		const entry = await upsertEntry(db, plan.id, {
			weekStart: '2026-05-18',
			entryDate: '2026-05-18',
			mealType: 'breakfast',
			customNote: 'Toast'
		});

		const found = await getEntryById(db, entry.id);
		expect(found).not.toBeNull();
		expect(found?.plan_household_id).toBe('h1');
	});

	it('should return null for non-existent entry', async () => {
		const { first: db } = setup();
		const found = await getEntryById(db, 'nonexistent');
		expect(found).toBeNull();
	});
});
