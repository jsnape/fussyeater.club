import type { RequestHandler } from '@sveltejs/kit';
import { requireDb, verifyPassword } from '$lib/server/db';
import { hasValidCsrf } from '$lib/server/security';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

export const POST: RequestHandler = async (event) => {
    const { request, cookies, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('auth.login.start', requestId, { path: '/api/auth/login' });

    if (!hasValidCsrf(request)) {
        logWarn('auth.login.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    let body: { email?: string; password?: string };
    try {
        body = (await request.json()) as { email?: string; password?: string };
    } catch {
        logWarn('auth.login.invalid_body', requestId);
        return jsonWithRequestId({ message: 'Invalid request body' }, requestId, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';
    if (!email || !password) {
        logWarn('auth.login.missing_credentials', requestId, { hasEmail: Boolean(email) });
        return jsonWithRequestId({ message: 'Invalid credentials' }, requestId, { status: 401 });
    }

    try {
        const db = requireDb(platform);
        const user = await db
            .prepare('SELECT id, password_hash FROM users WHERE email = ?1')
            .bind(email)
            .first<{ id: string; password_hash: string | null }>();

        if (!user?.password_hash) {
            logWarn('auth.login.user_not_found_or_password_auth_unavailable', requestId);
            return jsonWithRequestId({ message: 'Invalid credentials' }, requestId, {
                status: 401
            });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            logWarn('auth.login.invalid_password', requestId, { userId: user.id });
            return jsonWithRequestId({ message: 'Invalid credentials' }, requestId, {
                status: 401
            });
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

        logInfo('auth.login.success', requestId, { userId: user.id });
        return jsonWithRequestId({ ok: true }, requestId);
    } catch (error) {
        logError('auth.login.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
