export type SiteNavLink = {
    label: string;
    href: string;
};

export function getSiteNavLinks(args: { canManageHousehold: boolean }): SiteNavLink[] {
    const links: SiteNavLink[] = [
        { label: 'Home', href: '/' },
        { label: 'Design', href: '/design' }
    ];

    if (args.canManageHousehold) {
        links.push({ label: 'Household', href: '/household' });
    }

    return links;
}
