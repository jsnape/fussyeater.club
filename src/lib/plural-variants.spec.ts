import { describe, it, expect } from 'vitest';
import { pluralVariants, stripAdjectives } from './plural-variants';

describe('stripAdjectives', () => {
	it('should strip a single leading adjective', () => {
		expect(stripAdjectives('large eggs')).toBe('eggs');
	});

	it('should strip multiple leading adjectives', () => {
		expect(stripAdjectives('fresh whole milk')).toBe('milk');
	});

	it('should not strip the only word', () => {
		expect(stripAdjectives('large')).toBe('large');
	});

	it('should return the name unchanged if no adjectives', () => {
		expect(stripAdjectives('chicken breast')).toBe('chicken breast');
	});

	it('should be case insensitive', () => {
		expect(stripAdjectives('Large Onion')).toBe('onion');
	});

	it('should handle cooking adjectives', () => {
		expect(stripAdjectives('chopped tomatoes')).toBe('tomatoes');
		expect(stripAdjectives('dried basil')).toBe('basil');
		expect(stripAdjectives('frozen peas')).toBe('peas');
		expect(stripAdjectives('ground cumin')).toBe('cumin');
	});

	it('should handle size adjectives', () => {
		expect(stripAdjectives('small onion')).toBe('onion');
		expect(stripAdjectives('medium potato')).toBe('potato');
		expect(stripAdjectives('thin slices')).toBe('slices');
	});
});

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

	it('should generate adjective-stripped variants', () => {
		const variants = pluralVariants('large eggs');
		expect(variants).toContain('large eggs');
		expect(variants).toContain('eggs');
		expect(variants).toContain('egg');
	});

	it('should match "chopped tomatoes" to "tomato"', () => {
		const recipe = pluralVariants('chopped tomatoes');
		const canonical = pluralVariants('tomato');
		const overlap = [...recipe].some((v) => canonical.has(v));
		expect(overlap).toBe(true);
	});

	it('should match "frozen peas" to "pea"', () => {
		const recipe = pluralVariants('frozen peas');
		const canonical = pluralVariants('pea');
		const overlap = [...recipe].some((v) => canonical.has(v));
		expect(overlap).toBe(true);
	});
});
