import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { copyPreviousWeek, isValidIsoDate, getWeekStartMonday } from '$lib/server/meal-plan';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

type RepeatBody = {
	targetWeekStart?: unknown;
};

export const POST: RequestHandler = async (event) => {
	const { request, platform } = event;
	const requestId = resolveEventRequestId(event);

	logInfo('planner.repeat.start', requestId);

	if (!hasValidCsrf(request)) {
		logWarn('planner.repeat.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('planner.repeat.unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, {
			status: 401
		});
	}

	let body: RepeatBody;
	try {
		body = (await request.json()) as RepeatBody;
	} catch {
		logWarn('planner.repeat.invalid_json', requestId);
		return jsonWithRequestId({ message: 'Invalid JSON body' }, requestId, { status: 400 });
	}

	if (typeof body.targetWeekStart !== 'string' || !isValidIsoDate(body.targetWeekStart)) {
		return jsonWithRequestId(
			{ message: 'targetWeekStart is required in YYYY-MM-DD format' },
			requestId,
			{ status: 400 }
		);
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);

		if (!membership) {
			logWarn('planner.repeat.no_household', requestId, { userId: auth.userId });
			return jsonWithRequestId(
				{ message: 'You must belong to a household to use the meal planner' },
				requestId,
				{ status: 403 }
			);
		}

		const weekStart = getWeekStartMonday(body.targetWeekStart);
		const copied = await copyPreviousWeek(db, membership.householdId, weekStart);

		logInfo('planner.repeat.success', requestId, { weekStart, copied });

		return jsonWithRequestId({ copied, weekStart }, requestId);
	} catch (error) {
		logError('planner.repeat.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
