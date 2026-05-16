import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getMembership } from '$lib/server/household';
import { getProfilesForHousehold, getHouseholdSettings } from '$lib/server/profile';
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
	logInfo('households.profiles.list.start', requestId, { path: '/api/households/profiles' });

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.profiles.list.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.profiles.list.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.profiles.list.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		const [profiles, settings] = await Promise.all([
			getProfilesForHousehold(db, membership.householdId),
			getHouseholdSettings(db, membership.householdId)
		]);

		logInfo('households.profiles.list.success', requestId, {
			userId: auth.userId,
			householdId: membership.householdId,
			profileCount: profiles.length
		});

		return jsonWithRequestId(
			{ profiles, syncEnabled: settings.syncProfilesEnabled },
			requestId
		);
	} catch (error) {
		logError('households.profiles.list.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
