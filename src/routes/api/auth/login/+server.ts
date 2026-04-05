import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb, verifyPassword } from '$lib/server/db';
import { hasValidCsrf } from '$lib/server/security';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.info('[auth.login] start', { requestId, path: '/api/auth/login' });

    if (!hasValidCsrf(request)) {
        console.warn('[auth.login] csrf verification failed', { requestId });
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    let body: { email?: string; password?: string };
    try {
        body = (await request.json()) as { email?: string; password?: string };
    } catch {
        console.warn('[auth.login] invalid request body', { requestId });
        return json({ message: 'Invalid request body' }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';
    if (!email || !password) {
        console.warn('[auth.login] missing credentials', { requestId, hasEmail: Boolean(email) });
        return json({ message: 'Invalid credentials' }, { status: 401 });
    }

    try {
        const db = requireDb(platform);
        const user = await db
            .prepare('SELECT id, password_hash FROM users WHERE email = ?1')
            .bind(email)
            .first<{ id: string; password_hash: string | null }>();

        if (!user?.password_hash) {
            console.warn('[auth.login] user not found or password auth unavailable', { requestId });
            return json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            console.warn('[auth.login] invalid password', { requestId, userId: user.id });
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
            secure: new URL(request.url).protocol === 'https:',
            expires: new Date(expiresAt)
        });

        console.info('[auth.login] success', { requestId, userId: user.id });
        return json({ ok: true });
    } catch (error) {
        console.error('[auth.login] unexpected failure', {
            requestId,
            error: error instanceof Error ? error.message : error
        });
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
