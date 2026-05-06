import { describe, expect, it } from 'vitest';
import { generateSlug, isValidSlug } from './slug';

describe('generateSlug', () => {
    it('should convert title to lowercase hyphenated slug', () => {
        expect(generateSlug('Spaghetti Carbonara')).toBe('spaghetti-carbonara');
    });

    it('should trim leading and trailing whitespace', () => {
        expect(generateSlug('  Pasta Bake  ')).toBe('pasta-bake');
    });

    it('should replace multiple whitespace runs with a single hyphen', () => {
        expect(generateSlug('Mac   And   Cheese')).toBe('mac-and-cheese');
    });

    it('should remove punctuation and symbols', () => {
        expect(generateSlug("Shepherd's Pie!")).toBe('shepherds-pie');
    });

    it('should handle apostrophes and curly quotes', () => {
        expect(generateSlug("Fish 'n' Chips")).toBe('fish-n-chips');
        expect(generateSlug('Fish \u2018n\u2019 Chips')).toBe('fish-n-chips');
    });

    it('should keep numbers', () => {
        expect(generateSlug('5 Minute Salad')).toBe('5-minute-salad');
    });

    it('should collapse consecutive hyphens', () => {
        expect(generateSlug('Beef -- Stew')).toBe('beef-stew');
    });

    it('should not start or end with a hyphen', () => {
        expect(generateSlug('---Hello World---')).toBe('hello-world');
    });

    it('should return empty string for empty input', () => {
        expect(generateSlug('')).toBe('');
    });
});

describe('isValidSlug', () => {
    it('should accept a valid slug', () => {
        expect(isValidSlug('spaghetti-carbonara')).toBe(true);
    });

    it('should accept a slug with numbers', () => {
        expect(isValidSlug('spaghetti-carbonara-2')).toBe(true);
    });

    it('should accept a single word slug', () => {
        expect(isValidSlug('pasta')).toBe(true);
    });

    it('should reject an empty string', () => {
        expect(isValidSlug('')).toBe(false);
    });

    it('should reject slugs with uppercase letters', () => {
        expect(isValidSlug('Spaghetti')).toBe(false);
    });

    it('should reject slugs with spaces', () => {
        expect(isValidSlug('spaghetti carbonara')).toBe(false);
    });

    it('should reject slugs with consecutive hyphens', () => {
        expect(isValidSlug('spaghetti--carbonara')).toBe(false);
    });

    it('should reject slugs starting with a hyphen', () => {
        expect(isValidSlug('-spaghetti')).toBe(false);
    });

    it('should reject slugs ending with a hyphen', () => {
        expect(isValidSlug('spaghetti-')).toBe(false);
    });

    it('should reject slugs longer than 200 characters', () => {
        expect(isValidSlug('a'.repeat(201))).toBe(false);
    });

    it('should reject slugs with special characters', () => {
        expect(isValidSlug('spaghetti_carbonara')).toBe(false);
    });
});
