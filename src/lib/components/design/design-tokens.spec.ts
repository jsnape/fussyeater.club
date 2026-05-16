import { describe, expect, it } from 'vitest';
import { colorTokens, elevationTokens, spacingTokens } from './design-tokens';

describe('design tokens', () => {
    it('defines nine semantic color tokens', () => {
        expect(colorTokens).toHaveLength(9);
    });

    it('uses unique CSS variable names for colors', () => {
        const colorVars = colorTokens.map((token) => token.token);
        expect(new Set(colorVars).size).toBe(colorVars.length);
    });

    it('defines spacing and elevation scales', () => {
        expect(spacingTokens.length).toBeGreaterThan(0);
        expect(elevationTokens.length).toBeGreaterThan(0);
    });

    it('keeps scale token keys unique', () => {
        const allScaleKeys = [
            ...spacingTokens.map((token) => token.token),
            ...elevationTokens.map((token) => token.token)
        ];

        expect(new Set(allScaleKeys).size).toBe(allScaleKeys.length);
    });
});
