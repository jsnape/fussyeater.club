import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getMembership } from '$lib/server/household';
import { updateDependent, deleteDependent, validateDependentInput } from '$lib/server/profile';
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
	const dependentId = params.id;
	logInfo('households.dependents.update.start', requestId, {
		path: `/api/households/dependents/${dependentId}`
	});

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.dependents.update.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.dependents.update.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		requireCsrf(request);
	} catch {
		logWarn('households.dependents.update.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.dependents.update.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		const body = await request.json();
		const validation = validateDependentInput(body);
		if (!validation.valid) {
			logWarn('households.dependents.update.validation_failed', requestId, {
				error: validation.error
			});
			return jsonWithRequestId({ message: validation.error }, requestId, { status: 400 });
		}

		const updated = await updateDependent(db, dependentId!, membership.householdId, validation.data);
		if (!updated) {
			logWarn('households.dependents.update.not_found', requestId, {
				dependentId,
				householdId: membership.householdId
			});
			return jsonWithRequestId({ message: 'Dependent not found' }, requestId, { status: 404 });
		}

		logInfo('households.dependents.update.success', requestId, {
			userId: auth.userId,
			householdId: membership.householdId,
			dependentId
		});

		return jsonWithRequestId({ ok: true }, requestId);
	} catch (error) {
		logError('households.dependents.update.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const dependentId = params.id;
	logInfo('households.dependents.delete.start', requestId, {
		path: `/api/households/dependents/${dependentId}`
	});

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.dependents.delete.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.dependents.delete.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		requireCsrf(request);
	} catch {
		logWarn('households.dependents.delete.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.dependents.delete.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		const deleted = await deleteDependent(db, dependentId!, membership.householdId);
		if (!deleted) {
			logWarn('households.dependents.delete.not_found', requestId, {
				dependentId,
				householdId: membership.householdId
			});
			return jsonWithRequestId({ message: 'Dependent not found' }, requestId, { status: 404 });
		}

		logInfo('households.dependents.delete.success', requestId, {
			userId: auth.userId,
			householdId: membership.householdId,
			dependentId
		});

		return new Response(null, { status: 204 });
	} catch (error) {
		logError('households.dependents.delete.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
