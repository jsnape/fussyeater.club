import type { RequestHandler } from '@sveltejs/kit';
import { nowIso, requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    resolveEventRequestId
} from '$lib/server/observability';
import { requireOwnerHouseholdId } from '$lib/server/household';

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

export const GET: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    const microsoftOAuthEnabled = isFeatureEnabled(platform, FEATURE_FLAGS.microsoftOAuthEnabled);

    const sessionId = getSessionCookie(request);
    if (!sessionId) {
        logInfo('auth.session.anonymous', requestId);
        return jsonWithRequestId(
            { user: null, featureFlags: { microsoftOAuthEnabled }, canManageHousehold: false },
            requestId
        );
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
            logInfo('auth.session.not_found', requestId);
            return jsonWithRequestId(
                { user: null, featureFlags: { microsoftOAuthEnabled }, canManageHousehold: false },
                requestId
            );
        }

        logInfo('auth.session.success', requestId, {
            userId: session.id,
            authProvider: session.authProvider
        });

        let canManageHousehold = false;
        try {
            await requireOwnerHouseholdId(db, session.id);
            canManageHousehold = true;
        } catch (ownershipError) {
            if (
                !(
                    ownershipError instanceof Error &&
                    ownershipError.message === 'FORBIDDEN_NOT_OWNER'
                )
            ) {
                throw ownershipError;
            }
        }

        return jsonWithRequestId(
            {
                user: {
                    id: session.id,
                    email: session.email,
                    name: session.name,
                    authProvider: session.authProvider
                },
                featureFlags: { microsoftOAuthEnabled },
                canManageHousehold
            },
            requestId
        );
    } catch (error) {
        logError('auth.session.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId(
            { user: null, featureFlags: { microsoftOAuthEnabled }, canManageHousehold: false },
            requestId
        );
    }
};
