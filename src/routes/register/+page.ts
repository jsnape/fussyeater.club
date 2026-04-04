import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const inviteCode = url.searchParams.get('invite')?.toUpperCase() ?? '';

	let socialContinuation = false;
	let socialEmail = '';
	try {
		const response = await fetch('/api/auth/session');
		if (response.ok) {
			const session = (await response.json()) as {
				user?: { email?: string; authProvider?: string };
			};
			if (session.user?.authProvider === 'microsoft') {
				socialContinuation = true;
				socialEmail = session.user.email ?? '';
			}
		}
	} catch {
		// ignore session probe failure, fallback to email/password flow
	}

	return {
		inviteCode,
		socialContinuation,
		socialEmail
	};
};
