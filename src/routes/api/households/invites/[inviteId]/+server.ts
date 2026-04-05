import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { revokeHouseholdInvite } from '$lib/server/invite';
import { requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const DELETE: RequestHandler = async ({ request, params, platform }) => {
    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        return json({ message: 'Not found' }, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        requireCsrf(request);
    } catch {
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const inviteId = params.inviteId;
        if (!inviteId) {
            return json({ message: 'Invite not found' }, { status: 404 });
        }
        const revoked = await revokeHouseholdInvite(db, householdId, inviteId);
        if (!revoked) {
            return json({ message: 'Invite not found' }, { status: 404 });
        }
        return new Response(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
            return json({ message: 'Forbidden' }, { status: 403 });
        }
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
