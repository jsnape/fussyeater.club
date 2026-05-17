import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { getProfilesForHousehold } from '$lib/server/profile';
import {
	getOrCreateWeekPlan,
	getWeekPlanEntries,
	toEntryResponse,
	isValidIsoDate,
	getWeekStartMonday
} from '$lib/server/meal-plan';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

export const GET: RequestHandler = async (event) => {
	const { request, platform, url } = event;
	const requestId = resolveEventRequestId(event);
	const weekParam = url.searchParams.get('week');

	logInfo('planner.get.start', requestId, { week: weekParam });

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('planner.get.unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);

		if (!membership) {
			logWarn('planner.get.no_household', requestId, { userId: auth.userId });
			return jsonWithRequestId(
				{ message: 'You must belong to a household to use the meal planner' },
				requestId,
				{ status: 403 }
			);
		}

		const weekDate = weekParam ?? new Date().toISOString().slice(0, 10);
		if (!isValidIsoDate(weekDate)) {
			logWarn('planner.get.invalid_week', requestId, { week: weekParam });
			return jsonWithRequestId(
				{ message: 'Invalid week parameter. Use YYYY-MM-DD format.' },
				requestId,
				{ status: 400 }
			);
		}

		const weekStart = getWeekStartMonday(weekDate);
		const plan = await getOrCreateWeekPlan(db, membership.householdId, weekStart);
		const rawEntries = await getWeekPlanEntries(db, plan.id);
		const profiles = await getProfilesForHousehold(db, membership.householdId);

		const entries = rawEntries.map((e) => toEntryResponse(e, profiles));
		const withAlerts = entries.filter((e) => !e.compatibility.safe).length;

		logInfo('planner.get.success', requestId, {
			weekStart,
			entryCount: entries.length,
			withAlerts
		});

		return jsonWithRequestId(
			{
				weekStart,
				entries,
				stats: {
					planned: entries.length,
					total: 21,
					withAlerts
				}
			},
			requestId
		);
	} catch (error) {
		logError('planner.get.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
