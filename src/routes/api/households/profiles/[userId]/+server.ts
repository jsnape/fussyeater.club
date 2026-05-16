import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getMembership } from '$lib/server/household';
import { saveProfile, validateProfileInput } from '$lib/server/profile';
import { getAuthContext, requireCsrf } from '$lib/server/security';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

export const PUT: RequestHandler = async (event) => {
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const targetUserId = params.userId;
	logInfo('households.profiles.save.start', requestId, {
		path: `/api/households/profiles/${targetUserId}`
	});

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.profiles.save.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.profiles.save.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		requireCsrf(request);
	} catch {
		logWarn('households.profiles.save.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.profiles.save.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		// Verify target user is in the same household
		if (targetUserId) {
			const targetMembership = await getMembership(db, targetUserId);
			if (!targetMembership || targetMembership.householdId !== membership.householdId) {
				logWarn('households.profiles.save.target_not_in_household', requestId, {
					userId: auth.userId,
					targetUserId
				});
				return jsonWithRequestId({ message: 'Member not found' }, requestId, { status: 404 });
			}
		}

		const body = await request.json();
		const validation = validateProfileInput(body);
		if (!validation.valid) {
			logWarn('households.profiles.save.validation_failed', requestId, {
				error: validation.error
			});
			return jsonWithRequestId({ message: validation.error }, requestId, { status: 400 });
		}

		await saveProfile(db, targetUserId!, membership.householdId, validation.data);

		logInfo('households.profiles.save.success', requestId, {
			userId: auth.userId,
			targetUserId,
			householdId: membership.householdId
		});

		return jsonWithRequestId({ ok: true }, requestId);
	} catch (error) {
		logError('households.profiles.save.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
