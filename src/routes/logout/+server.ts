import { json, type RequestHandler } from '@sveltejs/kit';
import { hasValidCsrf } from '$lib/server/security';

export const POST: RequestHandler = async ({ cookies, request, platform }) => {
    if (!hasValidCsrf(request)) {
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    const sessionId = cookies.get('session');
    if (sessionId) {
        const db = platform?.env?.DB;
        await db
            ?.prepare('UPDATE user_sessions SET revoked_at = ?1 WHERE id = ?2')
            .bind(new Date().toISOString(), sessionId)
            .run();
    }

    cookies.delete('session', { path: '/' });
    return json({ ok: true });
};
