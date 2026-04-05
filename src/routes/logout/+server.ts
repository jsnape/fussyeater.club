import { json, type RequestHandler } from '@sveltejs/kit';
import { hasValidCsrf } from '$lib/server/security';
import { requireDb } from '$lib/server/db';

export const POST: RequestHandler = async ({ cookies, request, platform }) => {
    if (!hasValidCsrf(request)) {
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    const db = (() => {
        try {
            return requireDb(platform);
        } catch {
            return null;
        }
    })();
    if (!db) {
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }

    const sessionId = cookies.get('session');
    try {
        if (sessionId) {
            await db
                .prepare('UPDATE user_sessions SET revoked_at = ?1 WHERE id = ?2')
                .bind(new Date().toISOString(), sessionId)
                .run();
        }
    } catch {
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }

    cookies.delete('session', { path: '/' });
    return json({ ok: true });
};
