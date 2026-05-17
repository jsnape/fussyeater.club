import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { isAdmin } from '$lib/server/admin';
import {
	listIngredients,
	createIngredient,
	ingredientNameExists,
	toIngredientResponse,
	isValidFoodGroup,
	isPlantFoodGroup,
	isValidPlantColour,
	validateAllergens,
	type IngredientInput,
	type PlantColour
} from '$lib/server/ingredient';
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

	logInfo('admin.ingredients.list.start', requestId);

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	const db = requireDb(platform);
	if (!(await isAdmin(db, auth.userId, request))) {
		logWarn('admin.ingredients.list.forbidden', requestId, { userId: auth.userId });
		return jsonWithRequestId({ message: 'Admin access required' }, requestId, { status: 403 });
	}

	try {
		const options = {
			search: url.searchParams.get('search') ?? undefined,
			foodGroup: url.searchParams.get('foodGroup') ?? undefined,
			allergen: url.searchParams.get('allergen') ?? undefined,
			plantColour: url.searchParams.get('plantColour') ?? undefined,
			sort: (url.searchParams.get('sort') as 'name' | 'name-desc' | 'updated' | 'food-group') ?? undefined,
			page: Number(url.searchParams.get('page')) || 1,
			pageSize: Number(url.searchParams.get('pageSize')) || 50
		};

		const { items, total } = await listIngredients(db, options);

		logInfo('admin.ingredients.list.success', requestId, { total, page: options.page });

		return jsonWithRequestId(
			{
				items: items.map(toIngredientResponse),
				page: options.page,
				pageSize: options.pageSize,
				total
			},
			requestId
		);
	} catch (error) {
		logError('admin.ingredients.list.failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, { status: 503 });
	}
};

export const POST: RequestHandler = async (event) => {
	const { request, platform } = event;
	const requestId = resolveEventRequestId(event);

	logInfo('admin.ingredients.create.start', requestId);

	if (!hasValidCsrf(request)) {
		logWarn('admin.ingredients.create.csrf_failed', requestId);
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, { status: 403 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	const db = requireDb(platform);
	if (!(await isAdmin(db, auth.userId, request))) {
		logWarn('admin.ingredients.create.forbidden', requestId, { userId: auth.userId });
		return jsonWithRequestId({ message: 'Admin access required' }, requestId, { status: 403 });
	}

	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return jsonWithRequestId({ message: 'Invalid JSON body' }, requestId, { status: 400 });
	}

	// Validate required fields
	if (typeof body.name !== 'string' || body.name.trim().length === 0) {
		return jsonWithRequestId({ message: 'name is required' }, requestId, { status: 400 });
	}

	if (!isValidFoodGroup(body.foodGroup)) {
		return jsonWithRequestId({ message: 'Invalid food group' }, requestId, { status: 400 });
	}

	const allergens = Array.isArray(body.allergens) ? body.allergens : [];
	if (!validateAllergens(allergens)) {
		return jsonWithRequestId({ message: 'Invalid allergen value' }, requestId, { status: 400 });
	}

	const isPlant = isPlantFoodGroup(body.foodGroup);
	const plantColour = body.plantColour ?? null;

	if (isPlant && !isValidPlantColour(plantColour)) {
		return jsonWithRequestId({ message: 'Plant colour is required for plant food groups' }, requestId, { status: 400 });
	}

	if (!isPlant && plantColour !== null) {
		return jsonWithRequestId({ message: 'Plant colour must be null for non-plant food groups' }, requestId, { status: 400 });
	}

	const aliases = Array.isArray(body.aliases) ? body.aliases.filter((a: unknown) => typeof a === 'string') as string[] : [];

	try {
		if (await ingredientNameExists(db, body.name)) {
			return jsonWithRequestId({ message: 'An ingredient with this name already exists' }, requestId, { status: 409 });
		}

		const input: IngredientInput = {
			name: body.name,
			foodGroup: body.foodGroup,
			allergens: allergens as string[],
			plantColour: isPlant ? (plantColour as PlantColour) : null,
			aliases,
			description: typeof body.description === 'string' ? body.description : null
		};

		const row = await createIngredient(db, input);

		logInfo('admin.ingredients.create.success', requestId, { id: row.id, name: row.name });

		return jsonWithRequestId(toIngredientResponse(row), requestId, { status: 201 });
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		if (msg.includes('UNIQUE constraint failed')) {
			return jsonWithRequestId({ message: 'An ingredient with this name already exists' }, requestId, { status: 409 });
		}
		logError('admin.ingredients.create.failure', requestId, { error: msg });
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, { status: 503 });
	}
};
