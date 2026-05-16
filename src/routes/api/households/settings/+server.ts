import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getMembership } from '$lib/server/household';
import { getHouseholdSettings, updateHouseholdSettings } from '$lib/server/profile';
import { getAuthContext, requireCsrf } from '$lib/server/security';
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
	logInfo('households.settings.get.start', requestId, { path: '/api/households/settings' });

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.settings.get.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.settings.get.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.settings.get.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		const settings = await getHouseholdSettings(db, membership.householdId);

		logInfo('households.settings.get.success', requestId, {
			userId: auth.userId,
			householdId: membership.householdId
		});

		return jsonWithRequestId(settings, requestId);
	} catch (error) {
		logError('households.settings.get.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};

export const PUT: RequestHandler = async (event) => {
	const { request, platform } = event;
	const requestId = resolveEventRequestId(event);
	logInfo('households.settings.update.start', requestId, { path: '/api/households/settings' });

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.settings.update.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.settings.update.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		requireCsrf(request);
	} catch {
		logWarn('households.settings.update.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.settings.update.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		const body = (await request.json()) as Record<string, unknown>;
		if (typeof body.syncProfilesEnabled !== 'boolean') {
			logWarn('households.settings.update.validation_failed', requestId);
			return jsonWithRequestId(
				{ message: 'syncProfilesEnabled must be a boolean' },
				requestId,
				{ status: 400 }
			);
		}

		await updateHouseholdSettings(db, membership.householdId, body.syncProfilesEnabled);

		logInfo('households.settings.update.success', requestId, {
			userId: auth.userId,
			householdId: membership.householdId,
			syncProfilesEnabled: body.syncProfilesEnabled
		});

		return jsonWithRequestId({ syncProfilesEnabled: body.syncProfilesEnabled }, requestId);
	} catch (error) {
		logError('households.settings.update.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
