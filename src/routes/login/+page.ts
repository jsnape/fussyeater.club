import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const inviteCode = url.searchParams.get('invite')?.toUpperCase() ?? '';
	return { inviteCode };
};
