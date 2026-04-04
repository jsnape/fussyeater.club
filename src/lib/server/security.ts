import { error } from '@sveltejs/kit';

export type AuthContext = {
	userId: string | null;
	email: string | null;
	name: string | null;
	socialProvider: 'microsoft' | null;
};

export function getAuthContext(request: Request): AuthContext {
	const userId = request.headers.get('x-user-id');
	const email = request.headers.get('x-user-email');
	const name = request.headers.get('x-user-name');
	const social = request.headers.get('x-social-provider');

	return {
		userId: userId?.trim() || null,
		email: email?.trim() || null,
		name: name?.trim() || null,
		socialProvider: social === 'microsoft' ? 'microsoft' : null
	};
}

export function requireCsrf(request: Request): void {
	if (!hasValidCsrf(request)) {
		throw error(403, { message: 'CSRF verification failed' });
	}
}

export function hasValidCsrf(request: Request): boolean {
	const csrfHeader = request.headers.get('x-csrf-token');
	const cookie = request.headers.get('cookie') ?? '';
	const cookieToken = cookie
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith('csrf-token='))
		?.slice('csrf-token='.length);

	if (!csrfHeader || !cookieToken) {
		return false;
	}

	const a = new TextEncoder().encode(csrfHeader);
	const b = new TextEncoder().encode(cookieToken);
	if (a.length !== b.length) {
		return false;
	}

	let mismatch = 0;
	for (let index = 0; index < a.length; index += 1) {
		mismatch |= a[index] ^ b[index];
	}

	return mismatch === 0;
}
