export type SiteNavLink = {
    label: string;
    href: string;
};

export function getSiteNavLinks(args: {
    isAuthenticated: boolean;
    canManageHousehold: boolean;
}): SiteNavLink[] {
    if (!args.isAuthenticated) {
        return [
            { label: 'Home', href: '/' },
            { label: 'Recipes', href: '/recipes' }
        ];
    }

    const links: SiteNavLink[] = [
        { label: 'Recipes', href: '/recipes' },
        { label: 'Planner', href: '/planner' },
        { label: 'Shopping', href: '/shopping' }
    ];

    if (args.canManageHousehold) {
        links.push({ label: 'Household', href: '/household' });
    }

    return links;
}
