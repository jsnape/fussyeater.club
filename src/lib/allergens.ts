/** Standard allergens — shared between server validation and UI components. */
export const STANDARD_ALLERGENS = [
	'celery', 'gluten', 'crustaceans', 'eggs', 'fish', 'lupin',
	'dairy', 'molluscs', 'mustard', 'tree-nuts', 'peanuts',
	'sesame', 'soya', 'sulphites', 'buckwheat'
] as const;

export type StandardAllergen = (typeof STANDARD_ALLERGENS)[number];

/** Label-value pairs for UI checkboxes. */
export const STANDARD_ALLERGEN_OPTIONS: ReadonlyArray<{ value: StandardAllergen; label: string }> = [
	{ value: 'celery', label: 'Celery' },
	{ value: 'gluten', label: 'Gluten' },
	{ value: 'crustaceans', label: 'Crustaceans' },
	{ value: 'eggs', label: 'Eggs' },
	{ value: 'fish', label: 'Fish' },
	{ value: 'lupin', label: 'Lupin' },
	{ value: 'dairy', label: 'Dairy' },
	{ value: 'molluscs', label: 'Molluscs' },
	{ value: 'mustard', label: 'Mustard' },
	{ value: 'tree-nuts', label: 'Tree nuts' },
	{ value: 'peanuts', label: 'Peanuts' },
	{ value: 'sesame', label: 'Sesame' },
	{ value: 'soya', label: 'Soya' },
	{ value: 'sulphites', label: 'Sulphites' },
	{ value: 'buckwheat', label: 'Buckwheat' }
];
