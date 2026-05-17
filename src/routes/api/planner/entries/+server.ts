import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { getProfilesForHousehold } from '$lib/server/profile';
import {
	getOrCreateWeekPlan,
	getWeekPlanEntries,
	getWeekDates,
	upsertEntry,
	toEntryResponse,
	isValidIsoDate,
	validateMealType,
	getWeekStartMonday
} from '$lib/server/meal-plan';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

type CreateEntryBody = {
	weekStart?: unknown;
	entryDate?: unknown;
	mealType?: unknown;
	recipeId?: unknown;
	customNote?: unknown;
	servings?: unknown;
	notes?: unknown;
};

export const POST: RequestHandler = async (event) => {
	const { request, platform } = event;
	const requestId = resolveEventRequestId(event);

	logInfo('planner.entries.create.start', requestId);

	if (!hasValidCsrf(request)) {
		logWarn('planner.entries.create.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
			status: 403
		});
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		logWarn('planner.entries.create.unauthenticated', requestId);
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, {
			status: 401
		});
	}

	let body: CreateEntryBody;
	try {
		body = (await request.json()) as CreateEntryBody;
	} catch {
		logWarn('planner.entries.create.invalid_json', requestId);
		return jsonWithRequestId({ message: 'Invalid JSON body' }, requestId, { status: 400 });
	}

	// Validate required fields
	if (typeof body.weekStart !== 'string' || !isValidIsoDate(body.weekStart)) {
		return jsonWithRequestId(
			{ message: 'weekStart is required in YYYY-MM-DD format' },
			requestId,
			{ status: 400 }
		);
	}

	if (typeof body.entryDate !== 'string' || !isValidIsoDate(body.entryDate)) {
		return jsonWithRequestId(
			{ message: 'entryDate is required in YYYY-MM-DD format' },
			requestId,
			{ status: 400 }
		);
	}

	if (!validateMealType(body.mealType)) {
		return jsonWithRequestId(
			{ message: 'mealType must be "breakfast", "lunch", or "dinner"' },
			requestId,
			{ status: 400 }
		);
	}

	if (!body.recipeId && !body.customNote) {
		return jsonWithRequestId(
			{ message: 'Either recipeId or customNote is required' },
			requestId,
			{ status: 400 }
		);
	}

	if (body.recipeId !== undefined && typeof body.recipeId !== 'string') {
		return jsonWithRequestId({ message: 'recipeId must be a string' }, requestId, { status: 400 });
	}

	if (body.customNote !== undefined && typeof body.customNote !== 'string') {
		return jsonWithRequestId({ message: 'customNote must be a string' }, requestId, {
			status: 400
		});
	}

	if (body.notes !== undefined && typeof body.notes !== 'string') {
		return jsonWithRequestId({ message: 'notes must be a string' }, requestId, { status: 400 });
	}

	if (body.servings !== undefined && body.servings !== null) {
		if (typeof body.servings !== 'number' || !Number.isInteger(body.servings) || body.servings < 1) {
			return jsonWithRequestId(
				{ message: 'servings must be a positive integer' },
				requestId,
				{ status: 400 }
			);
		}
	}

	try {
		const db = requireDb(platform);
		const membership = await getMembership(db, auth.userId);

		if (!membership) {
			logWarn('planner.entries.create.no_household', requestId, { userId: auth.userId });
			return jsonWithRequestId(
				{ message: 'You must belong to a household to use the meal planner' },
				requestId,
				{ status: 403 }
			);
		}

		const weekStart = getWeekStartMonday(body.weekStart);

		// Validate entryDate falls within the week
		const weekDates = getWeekDates(weekStart);
		if (!weekDates.includes(body.entryDate)) {
			return jsonWithRequestId(
				{ message: 'entryDate must fall within the weekStart week' },
				requestId,
				{ status: 400 }
			);
		}

		// Validate recipeId exists if provided
		if (body.recipeId) {
			const recipe = await db
				.prepare('SELECT id FROM recipes WHERE id = ?')
				.bind(body.recipeId)
				.first();
			if (!recipe) {
				return jsonWithRequestId({ message: 'Recipe not found' }, requestId, { status: 400 });
			}
		}

		const plan = await getOrCreateWeekPlan(db, membership.householdId, weekStart);

		await upsertEntry(db, plan.id, {
			weekStart,
			entryDate: body.entryDate,
			mealType: body.mealType,
			recipeId: body.recipeId as string | undefined,
			customNote: body.customNote as string | undefined,
			servings: body.servings as number | undefined,
			notes: body.notes as string | undefined
		});

		// Re-fetch with recipe join for response
		const entries = await getWeekPlanEntries(db, plan.id);
		const profiles = await getProfilesForHousehold(db, membership.householdId);
		const entry = entries.find(
			(e) => e.entry_date === body.entryDate && e.meal_type === body.mealType
		);

		if (!entry) {
			logError('planner.entries.create.entry_not_found_after_upsert', requestId);
			return jsonWithRequestId({ message: 'Failed to create entry' }, requestId, {
				status: 503
			});
		}

		const response = toEntryResponse(entry, profiles);

		logInfo('planner.entries.create.success', requestId, {
			entryDate: body.entryDate,
			mealType: body.mealType,
			hasRecipe: !!body.recipeId
		});

		return jsonWithRequestId(response, requestId);
	} catch (error) {
		logError('planner.entries.create.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
