import pluralize from 'pluralize';

/**
 * Generates plural and singular variants of an ingredient name so that
 * "eggs" matches "egg", "tomatoes" matches "tomato", etc.
 *
 * Uses the `pluralize` library for accurate English inflection.
 * Returns a set of lowercase candidate forms (always includes the original).
 */
export function pluralVariants(name: string): ReadonlySet<string> {
	const lower = name.trim().toLowerCase();
	if (!lower) return new Set([lower]);

	return new Set([lower, pluralize.singular(lower), pluralize.plural(lower)]);
}
