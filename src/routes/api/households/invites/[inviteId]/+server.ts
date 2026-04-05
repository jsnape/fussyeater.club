import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { revokeHouseholdInvite } from '$lib/server/invite';
import { requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext, requireCsrf } from '$lib/server/security';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId,
    responseWithRequestId
} from '$lib/server/observability';

export const DELETE: RequestHandler = async (event) => {
    const { request, params, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('households.invites.delete.start', requestId, {
        path: '/api/households/invites/[inviteId]'
    });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        logWarn('households.invites.delete.feature_disabled', requestId);
        return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        logWarn('households.invites.delete.forbidden_unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
    }

    try {
        requireCsrf(request);
    } catch {
        logWarn('households.invites.delete.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const inviteId = params.inviteId;
        if (!inviteId) {
            logWarn('households.invites.delete.missing_invite_id', requestId);
            return jsonWithRequestId({ message: 'Invite not found' }, requestId, { status: 404 });
        }
        const revoked = await revokeHouseholdInvite(db, householdId, inviteId);
        if (!revoked) {
            logWarn('households.invites.delete.invite_not_found', requestId, { inviteId });
            return jsonWithRequestId({ message: 'Invite not found' }, requestId, { status: 404 });
        }
        logInfo('households.invites.delete.success', requestId, {
            requestId,
            userId: auth.userId,
            inviteId
        });
        return responseWithRequestId(null, requestId, { status: 204 });
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
            logWarn('households.invites.delete.forbidden_non_owner', requestId, {
                userId: auth.userId
            });
            return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
        }
        logError('households.invites.delete.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
