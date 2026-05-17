import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { isValidIsoDate, getWeekStartMonday } from '$lib/server/meal-plan';
import { generateShoppingList } from '$lib/server/shopping-list';
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

	logInfo('shopping.get.start', requestId, { week: weekParam });

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('shopping.get.unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);

		if (!membership) {
			logWarn('shopping.get.no_household', requestId, { userId: auth.userId });
			return jsonWithRequestId(
				{ message: 'You must belong to a household to view the shopping list' },
				requestId,
				{ status: 403 }
			);
		}

		const weekDate = weekParam ?? new Date().toISOString().slice(0, 10);
		if (!isValidIsoDate(weekDate)) {
			logWarn('shopping.get.invalid_week', requestId, { week: weekParam });
			return jsonWithRequestId(
				{ message: 'Invalid week parameter. Use YYYY-MM-DD format.' },
				requestId,
				{ status: 400 }
			);
		}

		const weekStart = getWeekStartMonday(weekDate);
		const list = await generateShoppingList(db, membership.householdId, weekStart);

		logInfo('shopping.get.success', requestId, {
			weekStart,
			totalItems: list.totalItems,
			categories: list.categories.length
		});

		return jsonWithRequestId(list, requestId);
	} catch (error) {
		logError('shopping.get.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
