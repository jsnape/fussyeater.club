import type { DbLike } from './db';
import {
	getOrCreateWeekPlan,
	getWeekPlanEntries,
	type EntryWithRecipe
} from './meal-plan';
import { getProfilesForHousehold, type MemberProfile } from './profile';

// ── Types ────────────────────────────────────────────────

type RecipeIngredient = {
	amount?: number;
	unit?: string;
	ingredient: string;
	ingredientGroup?: string;
};

type ShoppingAllergenAlert = {
	memberName: string;
	reason: 'allergy' | 'dislike';
	severity?: 'severe' | 'moderate' | 'mild';
};

type ShoppingListItem = {
	ingredient: string;
	totalAmount?: number;
	unit?: string;
	recipeSources: string[];
	allergenAlerts: ShoppingAllergenAlert[];
	foodGroup?: string;
};

type ShoppingListCategory = {
	category: string;
	emoji: string;
	items: ShoppingListItem[];
};

type ShoppingListResponse = {
	weekStart: string;
	categories: ShoppingListCategory[];
	totalItems: number;
};

// ── Category display config ──────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; order: number }> = {
	fruit: { label: 'Fruit', emoji: '🍎', order: 0 },
	vegetable: { label: 'Vegetables', emoji: '🥦', order: 1 },
	herb: { label: 'Herbs', emoji: '🌿', order: 2 },
	dairy: { label: 'Dairy', emoji: '🧀', order: 3 },
	meat: { label: 'Meat', emoji: '🥩', order: 4 },
	poultry: { label: 'Poultry', emoji: '🍗', order: 5 },
	fish: { label: 'Fish', emoji: '🐟', order: 6 },
	shellfish: { label: 'Shellfish', emoji: '🦐', order: 7 },
	grain: { label: 'Grains & bread', emoji: '🌾', order: 8 },
	legume: { label: 'Legumes', emoji: '🫘', order: 9 },
	nut: { label: 'Nuts', emoji: '🥜', order: 10 },
	seed: { label: 'Seeds', emoji: '🌻', order: 11 },
	oil: { label: 'Oils', emoji: '🫒', order: 12 },
	condiment: { label: 'Condiments & sauces', emoji: '🧂', order: 13 },
	spice: { label: 'Spices', emoji: '🌶️', order: 14 },
	sweetener: { label: 'Sweeteners', emoji: '🍯', order: 15 },
	other: { label: 'Other', emoji: '🛒', order: 16 }
};

// ── Helpers ──────────────────────────────────────────────

function parseJsonSafe<T>(raw: string | null): T {
	if (!raw) return [] as unknown as T;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return [] as unknown as T;
	}
}

/** Normalise an ingredient name for aggregation. */
function normalise(name: string): string {
	return name.trim().toLowerCase();
}

/** Aggregation key: ingredient name + unit (or 'no-unit'). */
function aggKey(name: string, unit?: string): string {
	return `${normalise(name)}::${(unit ?? '').trim().toLowerCase() || '_'}`;
}

/** Check if two terms share a whole-word match (avoids "nut" matching "coconut"). */
function hasWordMatch(ingredientName: string, term: string): boolean {
	if (ingredientName === term) return true;
	const termWords = term.split(/\s+/);
	const ingredientWords = new Set(ingredientName.split(/\s+/));
	// Any word in the term appears as a whole word in the ingredient, or vice versa
	return (
		termWords.some((w) => ingredientWords.has(w)) ||
		[...ingredientWords].some((w) => new Set(termWords).has(w))
	);
}

// ── Core logic ───────────────────────────────────────────

type AggregatedItem = {
	ingredient: string;
	displayName: string;
	totalAmount: number;
	unit: string;
	recipeSources: Set<string>;
};

function aggregateIngredients(entries: EntryWithRecipe[]): AggregatedItem[] {
	const map = new Map<string, AggregatedItem>();

	for (const entry of entries) {
		if (!entry.recipe_ingredients) continue;
		const recipeTitle = entry.recipe_title ?? 'Unknown recipe';
		const ingredients = parseJsonSafe<RecipeIngredient[]>(entry.recipe_ingredients);

		const recipeServings = entry.recipe_servings ?? entry.servings;
		const scaleFactor = recipeServings > 0 ? entry.servings / recipeServings : 1;

		for (const ing of ingredients) {
			if (!ing.ingredient) continue;
			const key = aggKey(ing.ingredient, ing.unit);
			const existing = map.get(key);

			if (existing) {
				if (ing.amount) existing.totalAmount += ing.amount * scaleFactor;
				existing.recipeSources.add(recipeTitle);
			} else {
				map.set(key, {
					ingredient: normalise(ing.ingredient),
					displayName: ing.ingredient.trim(),
					totalAmount: ing.amount ? ing.amount * scaleFactor : 0,
					unit: (ing.unit ?? '').trim(),
					recipeSources: new Set([recipeTitle])
				});
			}
		}
	}

	return [...map.values()];
}

async function lookupFoodGroups(
	db: DbLike,
	ingredientNames: string[]
): Promise<Map<string, string>> {
	const foodGroupMap = new Map<string, string>();
	if (ingredientNames.length === 0) return foodGroupMap;

	// Batch lookup by name
	const placeholders = ingredientNames.map((_, i) => `?${i + 1}`).join(', ');
	const result = await db
		.prepare(
			`SELECT LOWER(name) AS name, food_group FROM ingredients WHERE LOWER(name) IN (${placeholders})`
		)
		.bind(...ingredientNames)
		.all<{ name: string; food_group: string }>();

	for (const row of result.results ?? []) {
		foodGroupMap.set(row.name, row.food_group);
	}

	// Alias fallback for unmatched names — filter to rows with aliases, use LIKE to narrow
	const unmatched = ingredientNames.filter((n) => !foodGroupMap.has(n));
	if (unmatched.length > 0) {
		const likeConditions = unmatched.map(() => `LOWER(aliases) LIKE ?`).join(' OR ');
		const likeParams = unmatched.map((n) => `%"${n}"%`);
		const aliasResult = await db
			.prepare(
				`SELECT LOWER(name) AS name, aliases, food_group FROM ingredients WHERE aliases IS NOT NULL AND aliases != '[]' AND (${likeConditions})`
			)
			.bind(...likeParams)
			.all<{ name: string; aliases: string; food_group: string }>();

		const unmatchedSet = new Set(unmatched);
		for (const row of aliasResult.results ?? []) {
			const aliases = parseJsonSafe<string[]>(row.aliases).map((a) => a.toLowerCase().trim());
			for (const alias of aliases) {
				if (unmatchedSet.has(alias)) {
					foodGroupMap.set(alias, row.food_group);
				}
			}
		}
	}

	return foodGroupMap;
}

function buildAllergenAlerts(
	ingredientName: string,
	profiles: MemberProfile[]
): ShoppingAllergenAlert[] {
	const alerts: ShoppingAllergenAlert[] = [];
	const nameLower = ingredientName.toLowerCase();

	for (const profile of profiles) {
		for (const allergy of profile.allergies) {
			const allergyLower = allergy.ingredient.toLowerCase().trim();
			if (hasWordMatch(nameLower, allergyLower)) {
				alerts.push({
					memberName: profile.name,
					reason: 'allergy',
					severity: allergy.severity
				});
			}
		}

		for (const dislike of profile.dislikes) {
			const dislikeLower = dislike.toLowerCase().trim();
			if (hasWordMatch(nameLower, dislikeLower)) {
				alerts.push({
					memberName: profile.name,
					reason: 'dislike'
				});
			}
		}
	}

	// Deduplicate: keep one alert per member per reason
	const seen = new Set<string>();
	return alerts.filter((alert) => {
		const key = `${alert.memberName}::${alert.reason}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function groupIntoCategories(
	items: ShoppingListItem[]
): ShoppingListCategory[] {
	const groups = new Map<string, ShoppingListItem[]>();

	for (const item of items) {
		const group = item.foodGroup && CATEGORY_CONFIG[item.foodGroup] ? item.foodGroup : 'other';
		const existing = groups.get(group);
		if (existing) {
			existing.push(item);
		} else {
			groups.set(group, [item]);
		}
	}

	const categories: ShoppingListCategory[] = [];
	for (const [group, groupItems] of groups) {
		const config = CATEGORY_CONFIG[group] ?? CATEGORY_CONFIG.other;
		groupItems.sort((a, b) => a.ingredient.localeCompare(b.ingredient));
		categories.push({
			category: config.label,
			emoji: config.emoji,
			items: groupItems
		});
	}

	categories.sort((a, b) => {
		const orderA = Object.values(CATEGORY_CONFIG).find((c) => c.label === a.category)?.order ?? 99;
		const orderB = Object.values(CATEGORY_CONFIG).find((c) => c.label === b.category)?.order ?? 99;
		return orderA - orderB;
	});

	return categories;
}

// ── Public API ───────────────────────────────────────────

export async function generateShoppingList(
	db: DbLike,
	householdId: string,
	weekStart: string
): Promise<ShoppingListResponse> {
	// Get the week's meal plan entries
	const plan = await getOrCreateWeekPlan(db, householdId, weekStart);
	const entries = await getWeekPlanEntries(db, plan.id);

	if (entries.length === 0) {
		return { weekStart, categories: [], totalItems: 0 };
	}

	// Aggregate ingredients across all recipes
	const aggregated = aggregateIngredients(entries);

	// Look up food groups from canonical ingredients DB
	const ingredientNames = [...new Set(aggregated.map((a) => a.ingredient))];
	const foodGroupMap = await lookupFoodGroups(db, ingredientNames);

	// Get household profiles for allergen checking
	const profiles = await getProfilesForHousehold(db, householdId);

	// Build shopping list items
	const items: ShoppingListItem[] = aggregated.map((agg) => ({
		ingredient: agg.displayName,
		totalAmount: agg.totalAmount || undefined,
		unit: agg.unit || undefined,
		recipeSources: [...agg.recipeSources].sort(),
		allergenAlerts: buildAllergenAlerts(agg.ingredient, profiles),
		foodGroup: foodGroupMap.get(agg.ingredient)
	}));

	// Group into categories
	const categories = groupIntoCategories(items);
	const totalItems = items.length;

	return { weekStart, categories, totalItems };
}
