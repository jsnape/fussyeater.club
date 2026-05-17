import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { isAdmin } from '$lib/server/admin';
import {
	getIngredientById,
	updateIngredient,
	deleteIngredient,
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
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const id = params.id!;

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	const db = requireDb(platform);
	if (!(await isAdmin(db, auth.userId, request))) {
		return jsonWithRequestId({ message: 'Admin access required' }, requestId, { status: 403 });
	}

	const row = await getIngredientById(db, id);
	if (!row) {
		return jsonWithRequestId({ message: 'Ingredient not found' }, requestId, { status: 404 });
	}

	return jsonWithRequestId(toIngredientResponse(row), requestId);
};

export const PUT: RequestHandler = async (event) => {
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const id = params.id!;

	logInfo('admin.ingredients.update.start', requestId, { id });

	if (!hasValidCsrf(request)) {
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, { status: 403 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	const db = requireDb(platform);
	if (!(await isAdmin(db, auth.userId, request))) {
		logWarn('admin.ingredients.update.forbidden', requestId, { userId: auth.userId });
		return jsonWithRequestId({ message: 'Admin access required' }, requestId, { status: 403 });
	}

	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return jsonWithRequestId({ message: 'Invalid JSON body' }, requestId, { status: 400 });
	}

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
		if (await ingredientNameExists(db, body.name, id)) {
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

		const row = await updateIngredient(db, id, input);
		if (!row) {
			return jsonWithRequestId({ message: 'Ingredient not found' }, requestId, { status: 404 });
		}

		logInfo('admin.ingredients.update.success', requestId, { id, name: row.name });

		return jsonWithRequestId(toIngredientResponse(row), requestId);
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		if (msg.includes('UNIQUE constraint failed')) {
			return jsonWithRequestId({ message: 'An ingredient with this name already exists' }, requestId, { status: 409 });
		}
		logError('admin.ingredients.update.failure', requestId, { error: msg });
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, { status: 503 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { request, platform, params } = event;
	const requestId = resolveEventRequestId(event);
	const id = params.id!;

	logInfo('admin.ingredients.delete.start', requestId, { id });

	if (!hasValidCsrf(request)) {
		return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, { status: 403 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	const db = requireDb(platform);
	if (!(await isAdmin(db, auth.userId, request))) {
		logWarn('admin.ingredients.delete.forbidden', requestId, { userId: auth.userId });
		return jsonWithRequestId({ message: 'Admin access required' }, requestId, { status: 403 });
	}

	try {
		const deleted = await deleteIngredient(db, id);
		if (!deleted) {
			return jsonWithRequestId({ message: 'Ingredient not found' }, requestId, { status: 404 });
		}

		logInfo('admin.ingredients.delete.success', requestId, { id });

		return new Response(null, { status: 204 });
	} catch (error) {
		logError('admin.ingredients.delete.failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, { status: 503 });
	}
};
