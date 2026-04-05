import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { revokeHouseholdInvite } from '$lib/server/invite';
import { requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const DELETE: RequestHandler = async ({ request, params, platform }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.info('[households.invites.delete] start', {
        requestId,
        path: '/api/households/invites/[inviteId]'
    });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        console.warn('[households.invites.delete] registration feature disabled', { requestId });
        return json({ message: 'Not found' }, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        console.warn('[households.invites.delete] forbidden unauthenticated', { requestId });
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        requireCsrf(request);
    } catch {
        console.warn('[households.invites.delete] csrf verification failed', { requestId });
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const inviteId = params.inviteId;
        if (!inviteId) {
            console.warn('[households.invites.delete] missing inviteId', { requestId });
            return json({ message: 'Invite not found' }, { status: 404 });
        }
        const revoked = await revokeHouseholdInvite(db, householdId, inviteId);
        if (!revoked) {
            console.warn('[households.invites.delete] invite not found', { requestId, inviteId });
            return json({ message: 'Invite not found' }, { status: 404 });
        }
        console.info('[households.invites.delete] success', {
            requestId,
            userId: auth.userId,
            inviteId
        });
        return new Response(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
            console.warn('[households.invites.delete] forbidden non-owner', {
                requestId,
                userId: auth.userId
            });
            return json({ message: 'Forbidden' }, { status: 403 });
        }
        console.error('[households.invites.delete] unexpected failure', {
            requestId,
            error: error instanceof Error ? error.message : error
        });
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
