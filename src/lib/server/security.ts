import { error } from '@sveltejs/kit';
import { nowIso, requireDb } from './db';

export type AuthContext = {
	userId: string | null;
	email: string | null;
	name: string | null;
	socialProvider: 'microsoft' | null;
};

function getCookieValue(request: Request, name: string): string | null {
	const cookie = request.headers.get('cookie') ?? '';
	return (
		cookie
			.split(';')
			.map((part) => part.trim())
			.find((part) => part.startsWith(`${name}=`))
			?.slice(name.length + 1) ?? null
	);
}

export async function getAuthContext(
	request: Request,
	platform: App.Platform | undefined
): Promise<AuthContext> {
	const sessionId = getCookieValue(request, 'session');
	if (!sessionId) {
		return { userId: null, email: null, name: null, socialProvider: null };
	}

	const db = platform?.env?.DB;
	if (!db) {
		return { userId: null, email: null, name: null, socialProvider: null };
	}

	const session = await requireDb(platform)
		.prepare(
			`SELECT s.user_id as userId, u.email, u.name, u.auth_provider as authProvider
			 FROM user_sessions s
			 JOIN users u ON u.id = s.user_id
			 WHERE s.id = ?1
			   AND s.revoked_at IS NULL
			   AND s.expires_at > ?2
			 LIMIT 1`
		)
		.bind(sessionId, nowIso())
		.first<{
			userId: string;
			email: string | null;
			name: string | null;
			authProvider: string;
		}>();

	if (!session) {
		return { userId: null, email: null, name: null, socialProvider: null };
	}

	return {
		userId: session.userId,
		email: session.email,
		name: session.name,
		socialProvider: session.authProvider === 'microsoft' ? 'microsoft' : null
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
