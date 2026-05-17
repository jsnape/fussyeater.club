import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { getEntryById, removeEntry } from '$lib/server/meal-plan';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

export const DELETE: RequestHandler = async (event) => {
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const entryId = params.id ?? '';

	logInfo('planner.entries.delete.start', requestId, { entryId });

	if (!hasValidCsrf(request)) {
		logWarn('planner.entries.delete.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('planner.entries.delete.unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, {
			status: 401
		});
	}

	if (!entryId) {
		return jsonWithRequestId({ message: 'Entry ID is required' }, requestId, { status: 400 });
	}

	try {
		const db = requireDb(platform);
		const entry = await getEntryById(db, entryId);

		if (!entry) {
			logInfo('planner.entries.delete.not_found', requestId, { entryId });
			return jsonWithRequestId({ message: 'Entry not found' }, requestId, { status: 404 });
		}

		const membership = await getMembership(db, auth.userId);

		if (!membership || membership.householdId !== entry.plan_household_id) {
			logWarn('planner.entries.delete.forbidden', requestId, {
				entryId,
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		await removeEntry(db, entryId, entry.plan_id);

		logInfo('planner.entries.delete.success', requestId, { entryId });
		return new Response(null, { status: 204 });
	} catch (error) {
		logError('planner.entries.delete.unexpected_failure', requestId, {
			entryId,
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
