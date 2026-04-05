import type { RequestHandler } from '@sveltejs/kit';
import { hasValidCsrf } from '$lib/server/security';
import { requireDb } from '$lib/server/db';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

export const POST: RequestHandler = async (event) => {
    const { cookies, request, platform } = event;
    const requestId = resolveEventRequestId(event);

    if (!hasValidCsrf(request)) {
        logWarn('auth.logout.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    const db = (() => {
        try {
            return requireDb(platform);
        } catch {
            return null;
        }
    })();
    if (!db) {
        logError('auth.logout.db_unavailable', requestId);
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }

    const sessionId = cookies.get('session');
    try {
        if (sessionId) {
            await db
                .prepare('UPDATE user_sessions SET revoked_at = ?1 WHERE id = ?2')
                .bind(new Date().toISOString(), sessionId)
                .run();
        }
    } catch (error) {
        logError('auth.logout.revoke_failed', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }

    cookies.delete('session', { path: '/' });
    logInfo('auth.logout.success', requestId, { hadSession: Boolean(sessionId) });
    return jsonWithRequestId({ ok: true }, requestId);
};
