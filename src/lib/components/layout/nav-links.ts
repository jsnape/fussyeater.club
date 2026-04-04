export type SiteNavLink = {
	label: string;
	href: string;
};

export const siteNavLinks: SiteNavLink[] = [
	{ label: 'Home', href: '/' },
	{ label: 'Design', href: '/design' },
	{ label: 'Register', href: '/register' },
	{ label: 'Login', href: '/login' }
];
