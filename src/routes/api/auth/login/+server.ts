import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb, verifyPassword } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
	let body: { email?: string; password?: string };
	try {
		body = (await request.json()) as { email?: string; password?: string };
	} catch {
		return json({ message: 'Invalid request body' }, { status: 400 });
	}

	const email = body.email?.trim().toLowerCase();
	const password = body.password ?? '';
	if (!email || !password) {
		return json({ message: 'Invalid credentials' }, { status: 401 });
	}

	try {
		const db = requireDb(platform);
		const user = await db
			.prepare('SELECT id, password_hash FROM users WHERE email = ?1')
			.bind(email)
			.first<{ id: string; password_hash: string | null }>();

		if (!user?.password_hash) {
			return json({ message: 'Invalid credentials' }, { status: 401 });
		}

		const valid = await verifyPassword(password, user.password_hash);
		if (!valid) {
			return json({ message: 'Invalid credentials' }, { status: 401 });
		}

		const sessionId = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString();
		await db
			.prepare('INSERT INTO user_sessions (id, user_id, expires_at) VALUES (?1, ?2, ?3)')
			.bind(sessionId, user.id, expiresAt)
			.run();

		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true
		});

		return json({ ok: true });
	} catch {
		return json({ message: 'Service temporarily unavailable' }, { status: 503 });
	}
};
