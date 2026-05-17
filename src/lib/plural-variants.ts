import pluralize from 'pluralize';

/** Common size / descriptor adjectives that appear in recipe ingredient
 *  names but should be ignored when matching against canonical names. */
const IGNORED_ADJECTIVES = new Set([
	'large',
	'medium',
	'small',
	'big',
	'tiny',
	'thin',
	'thick',
	'whole',
	'fresh',
	'dried',
	'frozen',
	'chopped',
	'diced',
	'sliced',
	'minced',
	'crushed',
	'ground',
	'grated',
	'peeled',
	'cooked',
	'raw',
	'ripe',
	'warm',
	'cold',
	'hot',
	'flat',
	'fine',
	'coarse'
]);

/**
 * Strips leading ignored adjectives from an ingredient name.
 * e.g. "large eggs" → "eggs", "fresh whole milk" → "milk"
 */
export function stripAdjectives(name: string): string {
	const words = name.trim().toLowerCase().split(/\s+/);
	let start = 0;
	while (start < words.length - 1 && IGNORED_ADJECTIVES.has(words[start])) {
		start++;
	}
	return words.slice(start).join(' ');
}

/**
 * Generates plural and singular variants of an ingredient name so that
 * "eggs" matches "egg", "tomatoes" matches "tomato", etc.
 *
 * Also generates variants with leading adjectives stripped, so
 * "large eggs" matches canonical "egg".
 *
 * Uses the `pluralize` library for accurate English inflection.
 * Returns a set of lowercase candidate forms (always includes the original).
 */
export function pluralVariants(name: string): ReadonlySet<string> {
	const lower = name.trim().toLowerCase();
	if (!lower) return new Set([lower]);

	const stripped = stripAdjectives(lower);
	const bases = stripped !== lower ? [lower, stripped] : [lower];
	const variants = new Set<string>();
	for (const base of bases) {
		variants.add(base);
		variants.add(pluralize.singular(base));
		variants.add(pluralize.plural(base));
	}
	return variants;
}
