import { json, type RequestHandler } from '@sveltejs/kit';
import { nowIso, requireDb } from '$lib/server/db';

function getSessionCookie(request: Request): string | null {
	const cookie = request.headers.get('cookie') ?? '';
	return (
		cookie
			.split(';')
			.map((part) => part.trim())
			.find((part) => part.startsWith('session='))
			?.slice('session='.length) ?? null
	);
}

export const GET: RequestHandler = async ({ request, platform }) => {
	const sessionId = getSessionCookie(request);
	if (!sessionId) {
		return json({ user: null });
	}

	try {
		const db = requireDb(platform);
		const session = await db
			.prepare(
				`SELECT u.id, u.email, u.name, u.auth_provider as authProvider
 FROM user_sessions s
 JOIN users u ON u.id = s.user_id
 WHERE s.id = ?1
   AND s.revoked_at IS NULL
   AND s.expires_at > ?2
 LIMIT 1`
			)
			.bind(sessionId, nowIso())
			.first<{
				id: string;
				email: string | null;
				name: string | null;
				authProvider: string;
			}>();

		if (!session) {
			return json({ user: null });
		}

		return json({
			user: {
				id: session.id,
				email: session.email,
				name: session.name,
				authProvider: session.authProvider
			}
		});
	} catch {
		return json({ user: null });
	}
};
