import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { getRecipeBySlug, canViewRecipe } from '$lib/server/recipe';
import type { RecipeRow } from '$lib/server/recipe';
import { isValidSlug } from '$lib/server/slug';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

function parseJsonField<T>(raw: string | null, fallback: T): T {
	if (!raw) {
		return fallback;
	}

	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function toRecipeDetailResponse(recipe: RecipeRow): Record<string, unknown> {
	const timings =
		recipe.prep_minutes != null || recipe.cook_minutes != null
			? {
					prepMinutes: recipe.prep_minutes ?? undefined,
					cookMinutes: recipe.cook_minutes ?? undefined
				}
			: undefined;

	const base = {
		id: recipe.id,
		title: recipe.title,
		description: recipe.description ?? undefined,
		imageUrl: recipe.image_url ?? undefined,
		type: recipe.type,
		visibility: recipe.visibility,
		timings,
		servings: recipe.servings ?? undefined,
		yield: recipe.yield ?? undefined,
		tags: parseJsonField<string[]>(recipe.tags, []),
		ingredients: parseJsonField<unknown[]>(recipe.ingredients, []),
		notes: recipe.notes ?? undefined
	};

	if (recipe.type === 'full') {
		return {
			...base,
			method: parseJsonField<string[]>(recipe.method, [])
		};
	}

	return {
		...base,
		sourceReference: parseJsonField<Record<string, unknown> | undefined>(
			recipe.source_reference,
			undefined
		)
	};
}

export const GET: RequestHandler = async (event) => {
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const slug = params.id ?? '';

	logInfo('recipes.detail.get.start', requestId, { path: `/api/recipes/${slug}` });

	if (!isValidSlug(slug)) {
		logWarn('recipes.detail.get.invalid_slug', requestId, { slug });
		return jsonWithRequestId({ message: 'Invalid recipe id format' }, requestId, {
			status: 400
		});
	}

	try {
		const db = requireDb(platform);
		const recipe = await getRecipeBySlug(db, slug);

		if (!recipe) {
			logInfo('recipes.detail.get.not_found', requestId, { slug });
			return jsonWithRequestId({ message: 'Recipe not found' }, requestId, { status: 404 });
		}

		const auth = await getAuthContext(request, platform);
		const membership = auth.userId ? await getMembership(db, auth.userId) : null;
		const userHouseholdId = membership?.householdId ?? null;

		if (!canViewRecipe(recipe, auth, userHouseholdId)) {
			logWarn('recipes.detail.get.forbidden', requestId, {
				slug,
				visibility: recipe.visibility,
				userId: auth.userId
			});
			return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
		}

		logInfo('recipes.detail.get.success', requestId, {
			slug,
			type: recipe.type,
			visibility: recipe.visibility
		});
		return jsonWithRequestId(toRecipeDetailResponse(recipe), requestId);
	} catch (error) {
		logError('recipes.detail.get.unexpected_failure', requestId, {
			slug,
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
			status: 503
		});
	}
};
