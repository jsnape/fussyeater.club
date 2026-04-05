import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { redeemInviteCode } from '$lib/server/invite';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const POST: RequestHandler = async ({ request, platform }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.info('[invites.redeem] start', { requestId, path: '/api/invites/redeem' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        console.warn('[invites.redeem] registration feature disabled', { requestId });
        return json({ message: 'Not found' }, { status: 404 });
    }

    try {
        requireCsrf(request);
    } catch {
        console.warn('[invites.redeem] csrf verification failed', { requestId });
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    let body: { code?: string };
    try {
        body = (await request.json()) as { code?: string };
    } catch {
        console.warn('[invites.redeem] invalid request body', { requestId });
        return json({ message: 'Invalid request body' }, { status: 400 });
    }

    const code = body.code?.trim();
    if (!code) {
        console.warn('[invites.redeem] missing invite code', { requestId });
        return json({ message: 'Invite code is required' }, { status: 400 });
    }

    try {
        const db = requireDb(platform);
        const auth = await getAuthContext(request, platform);
        const result = await redeemInviteCode(db, code, auth.userId);
        console.info('[invites.redeem] success', {
            requestId,
            userId: auth.userId,
            hasJoinIntentToken: Boolean(result.joinIntentToken)
        });
        return json(result);
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'INVITE_NOT_FOUND':
                    console.warn('[invites.redeem] invite not found', { requestId });
                    return json({ message: 'Invite not found' }, { status: 404 });
                case 'INVITE_NOT_JOINABLE':
                    console.warn('[invites.redeem] invite not joinable', { requestId });
                    return json(
                        { message: 'Invite is expired, revoked, or exhausted' },
                        { status: 410 }
                    );
                case 'ALREADY_IN_HOUSEHOLD':
                    console.warn('[invites.redeem] already in household', { requestId });
                    return json({ message: 'Already in a household' }, { status: 409 });
                default:
                    console.error('[invites.redeem] unexpected failure', {
                        requestId,
                        error: error.message
                    });
                    return json({ message: 'Service temporarily unavailable' }, { status: 503 });
            }
        }

        console.error('[invites.redeem] failed with non-Error value', { requestId, error });
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
