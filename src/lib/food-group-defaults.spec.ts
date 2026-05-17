import { describe, it, expect } from 'vitest';
import { defaultAllergensForFoodGroup, mergeDefaultAllergens } from './food-group-defaults';

describe('defaultAllergensForFoodGroup', () => {
	it('should return dairy for dairy food group', () => {
		expect(defaultAllergensForFoodGroup('dairy')).toEqual(['dairy']);
	});

	it('should return fish for fish food group', () => {
		expect(defaultAllergensForFoodGroup('fish')).toEqual(['fish']);
	});

	it('should return crustaceans for shellfish food group', () => {
		expect(defaultAllergensForFoodGroup('shellfish')).toEqual(['crustaceans']);
	});

	it('should return tree-nuts for nut food group', () => {
		expect(defaultAllergensForFoodGroup('nut')).toEqual(['tree-nuts']);
	});

	it('should return empty array for food groups without defaults', () => {
		expect(defaultAllergensForFoodGroup('grain')).toEqual([]);
		expect(defaultAllergensForFoodGroup('vegetable')).toEqual([]);
		expect(defaultAllergensForFoodGroup('other')).toEqual([]);
	});

	it('should return empty array for unknown food group', () => {
		expect(defaultAllergensForFoodGroup('unknown')).toEqual([]);
	});

	it('should return empty array for empty string', () => {
		expect(defaultAllergensForFoodGroup('')).toEqual([]);
	});
});

describe('mergeDefaultAllergens', () => {
	it('should add default allergens to empty array', () => {
		expect(mergeDefaultAllergens('dairy', [])).toEqual(['dairy']);
	});

	it('should not duplicate existing allergens', () => {
		expect(mergeDefaultAllergens('dairy', ['dairy', 'gluten'])).toEqual(['dairy', 'gluten']);
	});

	it('should preserve existing allergens when adding defaults', () => {
		expect(mergeDefaultAllergens('fish', ['gluten', 'eggs'])).toEqual([
			'gluten',
			'eggs',
			'fish'
		]);
	});

	it('should return copy of current when food group has no defaults', () => {
		const current = ['gluten'];
		const result = mergeDefaultAllergens('vegetable', current);
		expect(result).toEqual(['gluten']);
		expect(result).not.toBe(current);
	});

	it('should return empty array when no defaults and no current', () => {
		expect(mergeDefaultAllergens('grain', [])).toEqual([]);
	});
});
