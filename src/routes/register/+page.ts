import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const inviteCode = url.searchParams.get('invite')?.toUpperCase() ?? '';
	const socialContinuation = url.searchParams.get('social') === 'microsoft';
	const socialEmail = url.searchParams.get('email') ?? '';

	return {
		inviteCode,
		socialContinuation,
		socialEmail
	};
};
