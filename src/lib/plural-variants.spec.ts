import { describe, it, expect } from 'vitest';
import { pluralVariants } from './plural-variants';

describe('pluralVariants', () => {
	it('should always include the original (lowercased)', () => {
		expect(pluralVariants('Egg')).toContain('egg');
	});

	it('should match egg ↔ eggs', () => {
		expect(pluralVariants('egg')).toContain('eggs');
		expect(pluralVariants('eggs')).toContain('egg');
	});

	it('should match onion ↔ onions', () => {
		expect(pluralVariants('onion')).toContain('onions');
		expect(pluralVariants('onions')).toContain('onion');
	});

	it('should match tomato ↔ tomatoes', () => {
		expect(pluralVariants('tomato')).toContain('tomatoes');
		expect(pluralVariants('tomatoes')).toContain('tomato');
	});

	it('should match berry ↔ berries', () => {
		expect(pluralVariants('berry')).toContain('berries');
		expect(pluralVariants('berries')).toContain('berry');
	});

	it('should match peach ↔ peaches', () => {
		expect(pluralVariants('peach')).toContain('peaches');
		expect(pluralVariants('peaches')).toContain('peach');
	});

	it('should match olive ↔ olives', () => {
		expect(pluralVariants('olive')).toContain('olives');
		expect(pluralVariants('olives')).toContain('olive');
	});

	it('should handle whitespace and casing', () => {
		const variants = pluralVariants('  Eggs  ');
		expect(variants).toContain('eggs');
		expect(variants).toContain('egg');
	});

	it('should have overlapping variants for common singular/plural pairs', () => {
		const pairs = [
			['egg', 'eggs'],
			['tomato', 'tomatoes'],
			['berry', 'berries'],
			['peach', 'peaches'],
			['carrot', 'carrots'],
			['anchovy', 'anchovies'],
			['potato', 'potatoes']
		];

		for (const [singular, plural] of pairs) {
			const sVars = pluralVariants(singular);
			const pVars = pluralVariants(plural);
			const overlap = [...sVars].some((v) => pVars.has(v));
			expect(overlap, `${singular} and ${plural} should have overlapping variants`).toBe(true);
		}
	});
});
