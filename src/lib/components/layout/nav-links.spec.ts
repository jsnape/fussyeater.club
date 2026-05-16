import { describe, expect, it } from 'vitest';
import { getSiteNavLinks } from './nav-links';

describe('siteNavLinks', () => {
    describe('signed-out', () => {
        it('shows Home and Recipes only', () => {
            expect(
                getSiteNavLinks({ isAuthenticated: false, canManageHousehold: false })
            ).toEqual([
                { label: 'Home', href: '/' },
                { label: 'Recipes', href: '/recipes' }
            ]);
        });

        it('ignores canManageHousehold when signed out', () => {
            expect(
                getSiteNavLinks({ isAuthenticated: false, canManageHousehold: true })
            ).toEqual([
                { label: 'Home', href: '/' },
                { label: 'Recipes', href: '/recipes' }
            ]);
        });
    });

    describe('signed-in', () => {
        it('shows core links without household when not owner', () => {
            expect(
                getSiteNavLinks({ isAuthenticated: true, canManageHousehold: false })
            ).toEqual([
                { label: 'Recipes', href: '/recipes' },
                { label: 'Planner', href: '/planner' },
                { label: 'Shopping', href: '/shopping' }
            ]);
        });

        it('includes household route for owners', () => {
            expect(
                getSiteNavLinks({ isAuthenticated: true, canManageHousehold: true })
            ).toEqual([
                { label: 'Recipes', href: '/recipes' },
                { label: 'Planner', href: '/planner' },
                { label: 'Shopping', href: '/shopping' },
                { label: 'Household', href: '/household' }
            ]);
        });
    });

    it('has unique href values', () => {
        const hrefs = getSiteNavLinks({
            isAuthenticated: true,
            canManageHousehold: true
        }).map((link) => link.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
    });
});
