import type { DbLike } from './db';
import { nowIso } from './db';
import type { MemberProfile, AllergyEntry } from './profile';

// ── Types ────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type MealPlanRow = {
	id: string;
	household_id: string;
	week_start: string;
};

export type MealPlanEntryRow = {
	id: string;
	plan_id: string;
	entry_date: string;
	meal_type: MealType;
	recipe_id: string | null;
	custom_note: string | null;
	servings: number;
	notes: string | null;
};

export type EntryWithRecipe = MealPlanEntryRow & {
	recipe_title: string | null;
	recipe_image_url: string | null;
	recipe_prep_minutes: number | null;
	recipe_cook_minutes: number | null;
	recipe_tags: string | null;
	recipe_ingredients: string | null;
};

export type CompatibilityAlert = {
	memberName: string;
	ingredient: string;
	reason: 'allergy' | 'dislike';
	severity?: 'severe' | 'moderate' | 'mild';
};

export type CompatibilityResult = {
	safe: boolean;
	hasAllergyAlert: boolean;
	alerts: CompatibilityAlert[];
};

export type MealEntryResponse = {
	id: string;
	entryDate: string;
	mealType: MealType;
	recipe?: {
		id: string;
		title: string;
		imageUrl?: string;
		timings?: { prepMinutes?: number; cookMinutes?: number };
		tags: string[];
	};
	customNote?: string;
	servings: number;
	notes?: string;
	compatibility: CompatibilityResult;
};

export type UpsertEntryInput = {
	weekStart: string;
	entryDate: string;
	mealType: MealType;
	recipeId?: string;
	customNote?: string;
	servings?: number;
	notes?: string;
};

// ── Week utilities ───────────────────────────────────────

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
	if (!ISO_DATE_PATTERN.test(value)) return false;
	const d = new Date(value + 'T00:00:00Z');
	return !isNaN(d.getTime());
}

export function getWeekStartMonday(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00Z');
	const day = d.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	return d.toISOString().slice(0, 10);
}

export function getWeekDates(weekStart: string): string[] {
	const dates: string[] = [];
	const start = new Date(weekStart + 'T00:00:00Z');
	for (let i = 0; i < 7; i++) {
		const d = new Date(start);
		d.setUTCDate(start.getUTCDate() + i);
		dates.push(d.toISOString().slice(0, 10));
	}
	return dates;
}

export function getPreviousWeekStart(weekStart: string): string {
	const d = new Date(weekStart + 'T00:00:00Z');
	d.setUTCDate(d.getUTCDate() - 7);
	return d.toISOString().slice(0, 10);
}

// ── Compatibility checking ───────────────────────────────

function parseJsonSafe<T>(raw: string | null): T {
	if (!raw) return [] as unknown as T;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return [] as unknown as T;
	}
}

type IngredientEntry = { ingredient: string };

export function checkCompatibility(
	recipeIngredients: string | null,
	profiles: MemberProfile[]
): CompatibilityResult {
	const alerts: CompatibilityAlert[] = [];
	const ingredients = parseJsonSafe<IngredientEntry[]>(recipeIngredients);
	const ingredientNames = ingredients.map((i) => i.ingredient?.toLowerCase().trim()).filter(Boolean);

	for (const profile of profiles) {
		for (const allergy of profile.allergies) {
			const allergyLower = allergy.ingredient.toLowerCase().trim();
			for (const name of ingredientNames) {
				if (name.includes(allergyLower) || allergyLower.includes(name)) {
					alerts.push({
						memberName: profile.name,
						ingredient: name,
						reason: 'allergy',
						severity: allergy.severity
					});
				}
			}
		}

		for (const dislike of profile.dislikes) {
			const dislikeLower = dislike.toLowerCase().trim();
			for (const name of ingredientNames) {
				if (name.includes(dislikeLower) || dislikeLower.includes(name)) {
					alerts.push({
						memberName: profile.name,
						ingredient: name,
						reason: 'dislike'
					});
				}
			}
		}
	}

	return {
		safe: alerts.length === 0,
		hasAllergyAlert: alerts.some((a) => a.reason === 'allergy'),
		alerts
	};
}

// ── Database operations ──────────────────────────────────

export async function getOrCreateWeekPlan(
	db: DbLike,
	householdId: string,
	weekStart: string
): Promise<MealPlanRow> {
	const normalised = getWeekStartMonday(weekStart);

	const existing = await db
		.prepare('SELECT id, household_id, week_start FROM meal_plans WHERE household_id = ?1 AND week_start = ?2')
		.bind(householdId, normalised)
		.first<MealPlanRow>();

	if (existing) return existing;

	const id = crypto.randomUUID();
	const now = nowIso();

	await db
		.prepare('INSERT INTO meal_plans (id, household_id, week_start, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)')
		.bind(id, householdId, normalised, now)
		.run();

	return { id, household_id: householdId, week_start: normalised };
}

export async function getWeekPlanEntries(
	db: DbLike,
	planId: string
): Promise<EntryWithRecipe[]> {
	const result = await db
		.prepare(
			`SELECT
				e.id, e.plan_id, e.entry_date, e.meal_type, e.recipe_id,
				e.custom_note, e.servings, e.notes,
				r.title AS recipe_title,
				r.image_url AS recipe_image_url,
				r.prep_minutes AS recipe_prep_minutes,
				r.cook_minutes AS recipe_cook_minutes,
				r.tags AS recipe_tags,
				r.ingredients AS recipe_ingredients
			FROM meal_plan_entries e
			LEFT JOIN recipes r ON r.id = e.recipe_id
			WHERE e.plan_id = ?1
			ORDER BY e.entry_date ASC, CASE e.meal_type
				WHEN 'breakfast' THEN 0
				WHEN 'lunch' THEN 1
				WHEN 'dinner' THEN 2
			END ASC`
		)
		.bind(planId)
		.all<EntryWithRecipe>();

	return result.results ?? [];
}

export function toEntryResponse(
	entry: EntryWithRecipe,
	profiles: MemberProfile[]
): MealEntryResponse {
	const compatibility = entry.recipe_id
		? checkCompatibility(entry.recipe_ingredients, profiles)
		: { safe: true, hasAllergyAlert: false, alerts: [] };

	const response: MealEntryResponse = {
		id: entry.id,
		entryDate: entry.entry_date,
		mealType: entry.meal_type as MealType,
		servings: entry.servings,
		compatibility
	};

	if (entry.recipe_id && entry.recipe_title) {
		const timings: { prepMinutes?: number; cookMinutes?: number } = {};
		if (entry.recipe_prep_minutes != null) timings.prepMinutes = entry.recipe_prep_minutes;
		if (entry.recipe_cook_minutes != null) timings.cookMinutes = entry.recipe_cook_minutes;

		response.recipe = {
			id: entry.recipe_id,
			title: entry.recipe_title,
			imageUrl: entry.recipe_image_url ?? undefined,
			timings: Object.keys(timings).length > 0 ? timings : undefined,
			tags: parseJsonSafe<string[]>(entry.recipe_tags)
		};
	}

	if (entry.custom_note) response.customNote = entry.custom_note;
	if (entry.notes) response.notes = entry.notes;

	return response;
}

const VALID_MEAL_TYPES = new Set<string>(['breakfast', 'lunch', 'dinner']);

export function validateMealType(value: unknown): value is MealType {
	return typeof value === 'string' && VALID_MEAL_TYPES.has(value);
}

export async function upsertEntry(
	db: DbLike,
	planId: string,
	input: UpsertEntryInput
): Promise<MealPlanEntryRow> {
	const now = nowIso();
	const id = crypto.randomUUID();
	const servings = input.servings ?? 4;

	await db
		.prepare(
			`INSERT INTO meal_plan_entries (id, plan_id, entry_date, meal_type, recipe_id, custom_note, servings, notes, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)
			ON CONFLICT(plan_id, entry_date, meal_type) DO UPDATE SET
				recipe_id = excluded.recipe_id,
				custom_note = excluded.custom_note,
				servings = excluded.servings,
				notes = excluded.notes,
				updated_at = excluded.updated_at`
		)
		.bind(
			id,
			planId,
			input.entryDate,
			input.mealType,
			input.recipeId ?? null,
			input.customNote ?? null,
			servings,
			input.notes ?? null,
			now
		)
		.run();

	// Fetch the actual entry (may have existing id if upserted)
	const entry = await db
		.prepare(
			'SELECT id, plan_id, entry_date, meal_type, recipe_id, custom_note, servings, notes FROM meal_plan_entries WHERE plan_id = ?1 AND entry_date = ?2 AND meal_type = ?3'
		)
		.bind(planId, input.entryDate, input.mealType)
		.first<MealPlanEntryRow>();

	if (!entry) throw new Error('ENTRY_UPSERT_FAILED');
	return entry;
}

export async function removeEntry(
	db: DbLike,
	entryId: string,
	planId: string
): Promise<boolean> {
	const result = await db
		.prepare('DELETE FROM meal_plan_entries WHERE id = ?1 AND plan_id = ?2')
		.bind(entryId, planId)
		.run();
	return (result.meta?.changes ?? 0) > 0;
}

export async function copyPreviousWeek(
	db: DbLike,
	householdId: string,
	targetWeekStart: string
): Promise<number> {
	const normalised = getWeekStartMonday(targetWeekStart);
	const previousWeekStart = getPreviousWeekStart(normalised);

	const previousPlan = await db
		.prepare('SELECT id FROM meal_plans WHERE household_id = ?1 AND week_start = ?2')
		.bind(householdId, previousWeekStart)
		.first<{ id: string }>();

	if (!previousPlan) return 0;

	const previousEntries = await db
		.prepare(
			'SELECT entry_date, meal_type, recipe_id, custom_note, servings, notes FROM meal_plan_entries WHERE plan_id = ?1'
		)
		.bind(previousPlan.id)
		.all<{
			entry_date: string;
			meal_type: string;
			recipe_id: string | null;
			custom_note: string | null;
			servings: number;
			notes: string | null;
		}>();

	const entries = previousEntries.results ?? [];
	if (entries.length === 0) return 0;

	const targetPlan = await getOrCreateWeekPlan(db, householdId, normalised);
	const now = nowIso();
	let copied = 0;

	for (const entry of entries) {
		// Shift dates forward by 7 days
		const oldDate = new Date(entry.entry_date + 'T00:00:00Z');
		oldDate.setUTCDate(oldDate.getUTCDate() + 7);
		const newDate = oldDate.toISOString().slice(0, 10);
		const newId = crypto.randomUUID();

		await db
			.prepare(
				`INSERT INTO meal_plan_entries (id, plan_id, entry_date, meal_type, recipe_id, custom_note, servings, notes, created_at, updated_at)
				VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)
				ON CONFLICT(plan_id, entry_date, meal_type) DO UPDATE SET
					recipe_id = excluded.recipe_id,
					custom_note = excluded.custom_note,
					servings = excluded.servings,
					notes = excluded.notes,
					updated_at = excluded.updated_at`
			)
			.bind(
				newId,
				targetPlan.id,
				newDate,
				entry.meal_type,
				entry.recipe_id,
				entry.custom_note,
				entry.servings,
				entry.notes,
				now
			)
			.run();

		copied++;
	}

	return copied;
}

export async function getPlanForHousehold(
	db: DbLike,
	householdId: string,
	weekStart: string
): Promise<MealPlanRow | null> {
	const normalised = getWeekStartMonday(weekStart);
	return db
		.prepare('SELECT id, household_id, week_start FROM meal_plans WHERE household_id = ?1 AND week_start = ?2')
		.bind(householdId, normalised)
		.first<MealPlanRow>();
}

export async function getEntryById(
	db: DbLike,
	entryId: string
): Promise<(MealPlanEntryRow & { plan_household_id: string }) | null> {
	return db
		.prepare(
			`SELECT e.id, e.plan_id, e.entry_date, e.meal_type, e.recipe_id,
				e.custom_note, e.servings, e.notes,
				p.household_id AS plan_household_id
			FROM meal_plan_entries e
			JOIN meal_plans p ON p.id = e.plan_id
			WHERE e.id = ?1`
		)
		.bind(entryId)
		.first<MealPlanEntryRow & { plan_household_id: string }>();
}
