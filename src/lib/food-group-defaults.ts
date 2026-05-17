const FOOD_GROUP_ALLERGENS: Readonly<Record<string, readonly string[]>> = {
	dairy: ['dairy'],
	fish: ['fish'],
	shellfish: ['crustaceans'],
	nut: ['tree-nuts']
};

/** Returns default allergens for a food group, or an empty array if none. */
export function defaultAllergensForFoodGroup(foodGroup: string): readonly string[] {
	return FOOD_GROUP_ALLERGENS[foodGroup] ?? [];
}

/**
 * Merges default allergens for `foodGroup` into `current`, returning a new
 * array with duplicates removed.  Never removes existing selections.
 */
export function mergeDefaultAllergens(foodGroup: string, current: readonly string[]): string[] {
	const defaults = defaultAllergensForFoodGroup(foodGroup);
	if (defaults.length === 0) return [...current];
	return [...new Set([...current, ...defaults])];
}
