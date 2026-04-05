import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { redeemInviteCode } from '$lib/server/invite';
import { getAuthContext, requireCsrf } from '$lib/server/security';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

export const POST: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('invites.redeem.start', requestId, { path: '/api/invites/redeem' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        logWarn('invites.redeem.feature_disabled', requestId);
        return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
    }

    try {
        requireCsrf(request);
    } catch {
        logWarn('invites.redeem.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    let body: { code?: string };
    try {
        body = (await request.json()) as { code?: string };
    } catch {
        logWarn('invites.redeem.invalid_body', requestId);
        return jsonWithRequestId({ message: 'Invalid request body' }, requestId, { status: 400 });
    }

    const code = body.code?.trim();
    if (!code) {
        logWarn('invites.redeem.missing_invite_code', requestId);
        return jsonWithRequestId({ message: 'Invite code is required' }, requestId, {
            status: 400
        });
    }

    try {
        const db = requireDb(platform);
        const auth = await getAuthContext(request, platform);
        const result = await redeemInviteCode(db, code, auth.userId);
        logInfo('invites.redeem.success', requestId, {
            requestId,
            userId: auth.userId,
            hasJoinIntentToken: Boolean(result.joinIntentToken)
        });
        return jsonWithRequestId(result, requestId);
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'INVITE_NOT_FOUND':
                    logWarn('invites.redeem.invite_not_found', requestId);
                    return jsonWithRequestId({ message: 'Invite not found' }, requestId, {
                        status: 404
                    });
                case 'INVITE_NOT_JOINABLE':
                    logWarn('invites.redeem.invite_not_joinable', requestId);
                    return jsonWithRequestId(
                        { message: 'Invite is expired, revoked, or exhausted' },
                        requestId,
                        { status: 410 }
                    );
                case 'ALREADY_IN_HOUSEHOLD':
                    logWarn('invites.redeem.already_in_household', requestId);
                    return jsonWithRequestId({ message: 'Already in a household' }, requestId, {
                        status: 409
                    });
                default:
                    logError('invites.redeem.unexpected_failure', requestId, {
                        error: error.message
                    });
                    return jsonWithRequestId(
                        { message: 'Service temporarily unavailable' },
                        requestId,
                        { status: 503 }
                    );
            }
        }

        logError('invites.redeem.unexpected_non_error_failure', requestId, {
            error: String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
