import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getMembership } from '$lib/server/household';
import { createDependent, validateDependentInput } from '$lib/server/profile';
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
	logInfo('households.dependents.create.start', requestId, {
		path: '/api/households/dependents'
	});

	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		logWarn('households.dependents.create.feature_disabled', requestId);
		return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('households.dependents.create.forbidden_unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
	}

	try {
		requireCsrf(request);
	} catch {
		logWarn('households.dependents.create.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);
		if (!membership) {
			logWarn('households.dependents.create.forbidden_no_membership', requestId, {
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		const body = await request.json();
		const validation = validateDependentInput(body);
		if (!validation.valid) {
			logWarn('households.dependents.create.validation_failed', requestId, {
				error: validation.error
			});
			return jsonWithRequestId({ message: validation.error }, requestId, { status: 400 });
		}

		const id = await createDependent(db, membership.householdId, validation.data);

		logInfo('households.dependents.create.success', requestId, {
			userId: auth.userId,
			householdId: membership.householdId,
			dependentId: id
		});

		return jsonWithRequestId({ ok: true, id }, requestId, { status: 201 });
	} catch (error) {
		logError('households.dependents.create.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
