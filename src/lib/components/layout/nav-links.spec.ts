import { describe, expect, it } from 'vitest';
import { getSiteNavLinks } from './nav-links';

describe('siteNavLinks', () => {
    it('includes household route for owners', () => {
        expect(getSiteNavLinks({ canManageHousehold: true })).toEqual([
            { label: 'Home', href: '/' },
            { label: 'Recipes', href: '/recipes' },
            { label: 'Design', href: '/design' },
            { label: 'Household', href: '/household' }
        ]);
    });

    it('excludes household route for non-owners', () => {
        expect(getSiteNavLinks({ canManageHousehold: false })).toEqual([
            { label: 'Home', href: '/' },
            { label: 'Recipes', href: '/recipes' },
            { label: 'Design', href: '/design' }
        ]);
    });

    it('has unique href values', () => {
        const hrefs = getSiteNavLinks({ canManageHousehold: true }).map((link) => link.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
    });
});
