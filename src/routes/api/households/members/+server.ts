import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { listHouseholdMembers, requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext } from '$lib/server/security';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

export const GET: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('households.members.get.start', requestId, { path: '/api/households/members' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        logWarn('households.members.get.feature_disabled', requestId);
        return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        logWarn('households.members.get.forbidden_unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const members = await listHouseholdMembers(db, householdId);
        logInfo('households.members.get.success', requestId, {
            userId: auth.userId,
            householdId,
            memberCount: members.length
        });
        return jsonWithRequestId({ members }, requestId);
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
            logWarn('households.members.get.forbidden_non_owner', requestId, {
                userId: auth.userId
            });
            return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
        }

        logError('households.members.get.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
