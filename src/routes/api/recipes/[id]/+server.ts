import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import {
    getRecipeBySlug,
    canViewRecipe,
    canEditRecipe,
    updateRecipe,
    deleteRecipe
} from '$lib/server/recipe';
import { isValidSlug } from '$lib/server/slug';
import { toRecipeDetailResponse } from '$lib/server/recipe-response';
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
        return jsonWithRequestId(toRecipeDetailResponse(recipe, auth, userHouseholdId), requestId);
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

type UpdateRecipeBody = {
    title?: unknown;
    description?: unknown;
    imageUrl?: unknown;
    type?: unknown;
    visibility?: unknown;
    servings?: unknown;
    yield?: unknown;
    prepMinutes?: unknown;
    cookMinutes?: unknown;
    ingredients?: unknown;
    method?: unknown;
    sourceReference?: unknown;
    tags?: unknown;
    notes?: unknown;
};

type ValidationError = { field: string; message: string };

function validateUpdateRecipeBody(body: UpdateRecipeBody): ValidationError[] {
    const errors: ValidationError[] = [];

    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        errors.push({ field: 'title', message: 'Title is required' });
    } else if (body.title.trim().length > 200) {
        errors.push({ field: 'title', message: 'Title must be at most 200 characters' });
    }

    if (body.type !== 'full' && body.type !== 'reference') {
        errors.push({ field: 'type', message: 'Type must be "full" or "reference"' });
    }

    if (
        body.visibility !== undefined &&
        body.visibility !== 'public' &&
        body.visibility !== 'private'
    ) {
        errors.push({ field: 'visibility', message: 'Visibility must be "public" or "private"' });
    }

    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== 'string') {
            errors.push({ field: 'description', message: 'Description must be a string' });
        } else if (body.description.length > 2000) {
            errors.push({
                field: 'description',
                message: 'Description must be at most 2000 characters'
            });
        }
    }

    if (body.imageUrl !== undefined && body.imageUrl !== null && body.imageUrl !== '') {
        if (typeof body.imageUrl !== 'string') {
            errors.push({ field: 'imageUrl', message: 'Image URL must be a string' });
        } else {
            try {
                new URL(body.imageUrl);
            } catch {
                errors.push({ field: 'imageUrl', message: 'Image URL must be a valid URL' });
            }
        }
    }

    if (body.servings !== undefined && body.servings !== null) {
        if (
            typeof body.servings !== 'number' ||
            !Number.isInteger(body.servings) ||
            body.servings < 1
        ) {
            errors.push({ field: 'servings', message: 'Servings must be a positive integer' });
        }
    }

    if (body.yield !== undefined && body.yield !== null) {
        if (typeof body.yield !== 'string') {
            errors.push({ field: 'yield', message: 'Yield must be a string' });
        } else if (body.yield.length > 100) {
            errors.push({ field: 'yield', message: 'Yield must be at most 100 characters' });
        }
    }

    if (body.prepMinutes !== undefined && body.prepMinutes !== null) {
        if (
            typeof body.prepMinutes !== 'number' ||
            !Number.isInteger(body.prepMinutes) ||
            body.prepMinutes < 0
        ) {
            errors.push({
                field: 'prepMinutes',
                message: 'Prep minutes must be a non-negative integer'
            });
        }
    }

    if (body.cookMinutes !== undefined && body.cookMinutes !== null) {
        if (
            typeof body.cookMinutes !== 'number' ||
            !Number.isInteger(body.cookMinutes) ||
            body.cookMinutes < 0
        ) {
            errors.push({
                field: 'cookMinutes',
                message: 'Cook minutes must be a non-negative integer'
            });
        }
    }

    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
        errors.push({ field: 'ingredients', message: 'At least one ingredient is required' });
    } else {
        for (let i = 0; i < body.ingredients.length; i++) {
            const ing = body.ingredients[i] as Record<string, unknown> | undefined;
            if (!ing || typeof ing.ingredient !== 'string' || ing.ingredient.trim().length === 0) {
                errors.push({
                    field: `ingredients[${i}].ingredient`,
                    message: 'Ingredient name is required'
                });
            }
        }
    }

    if (body.type === 'full') {
        if (!Array.isArray(body.method) || body.method.length === 0) {
            errors.push({
                field: 'method',
                message: 'At least one method step is required for full recipes'
            });
        } else {
            for (let i = 0; i < body.method.length; i++) {
                if (
                    typeof body.method[i] !== 'string' ||
                    (body.method[i] as string).trim().length === 0
                ) {
                    errors.push({
                        field: `method[${i}]`,
                        message: 'Method step must be a non-empty string'
                    });
                }
            }
        }
    }

    if (body.type === 'reference') {
        if (Array.isArray(body.method) && body.method.length > 0) {
            errors.push({
                field: 'method',
                message: 'Reference recipes must not include method steps'
            });
        }
        const src = body.sourceReference as Record<string, unknown> | undefined;
        if (!src || (src.kind !== 'url' && src.kind !== 'book')) {
            errors.push({
                field: 'sourceReference',
                message:
                    'Source reference with kind "url" or "book" is required for reference recipes'
            });
        } else {
            if (typeof src.label !== 'string' || src.label.trim().length === 0) {
                errors.push({
                    field: 'sourceReference.label',
                    message: 'Source reference label is required'
                });
            }
            if (
                src.kind === 'url' &&
                (typeof src.url !== 'string' || src.url.trim().length === 0)
            ) {
                errors.push({
                    field: 'sourceReference.url',
                    message: 'URL is required for URL source references'
                });
            }
        }
    }

    if (body.tags !== undefined && body.tags !== null) {
        if (!Array.isArray(body.tags)) {
            errors.push({ field: 'tags', message: 'Tags must be an array' });
        }
    }

    if (body.notes !== undefined && body.notes !== null) {
        if (typeof body.notes !== 'string') {
            errors.push({ field: 'notes', message: 'Notes must be a string' });
        } else if (body.notes.length > 2000) {
            errors.push({ field: 'notes', message: 'Notes must be at most 2000 characters' });
        }
    }

    return errors;
}

export const PUT: RequestHandler = async (event) => {
    const { request, platform, params } = event;
    const requestId = resolveEventRequestId(event);
    const slug = params.id ?? '';

    logInfo('recipes.update.start', requestId, { slug });

    if (!hasValidCsrf(request)) {
        logWarn('recipes.update.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        logWarn('recipes.update.unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Authentication required' }, requestId, {
            status: 401
        });
    }

    if (!isValidSlug(slug)) {
        logWarn('recipes.update.invalid_slug', requestId, { slug });
        return jsonWithRequestId({ message: 'Invalid recipe id format' }, requestId, {
            status: 400
        });
    }

    let body: UpdateRecipeBody;
    try {
        body = (await request.json()) as UpdateRecipeBody;
    } catch {
        logWarn('recipes.update.invalid_json', requestId);
        return jsonWithRequestId({ message: 'Invalid JSON body' }, requestId, { status: 400 });
    }

    const errors = validateUpdateRecipeBody(body);
    if (errors.length > 0) {
        logWarn('recipes.update.validation_error', requestId, {
            fields: errors.map((e) => e.field)
        });
        return jsonWithRequestId({ message: 'Validation failed', errors }, requestId, {
            status: 400
        });
    }

    try {
        const db = requireDb(platform);
        const existing = await getRecipeBySlug(db, slug);

        if (!existing) {
            logInfo('recipes.update.not_found', requestId, { slug });
            return jsonWithRequestId({ message: 'Recipe not found' }, requestId, { status: 404 });
        }

        const membership = await getMembership(db, auth.userId);
        const userHouseholdId = membership?.householdId ?? null;

        if (!canEditRecipe(existing, auth, userHouseholdId)) {
            logWarn('recipes.update.forbidden', requestId, { slug, userId: auth.userId });
            return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
        }

        const visibility = (body.visibility as 'public' | 'private') ?? existing.visibility;

        if (visibility === 'private' && !userHouseholdId) {
            logWarn('recipes.update.no_household_for_private', requestId, {
                userId: auth.userId
            });
            return jsonWithRequestId(
                { message: 'You must belong to a household to create private recipes' },
                requestId,
                { status: 403 }
            );
        }

        const updated = await updateRecipe(db, slug, {
            title: (body.title as string).trim(),
            description: body.description ? (body.description as string) : undefined,
            imageUrl: body.imageUrl ? (body.imageUrl as string) : undefined,
            type: body.type as 'full' | 'reference',
            visibility,
            servings: body.servings as number | undefined,
            yield: body.yield as string | undefined,
            prepMinutes: body.prepMinutes as number | undefined,
            cookMinutes: body.cookMinutes as number | undefined,
            ingredients: body.ingredients as unknown[],
            method: body.type === 'full' ? (body.method as string[]) : undefined,
            sourceReference: body.sourceReference as Record<string, unknown> | undefined,
            tags: body.tags as string[] | undefined,
            notes: body.notes ? (body.notes as string) : undefined,
            householdId: visibility === 'private' ? userHouseholdId : null
        });

        if (!updated) {
            logError('recipes.update.failed', requestId, { slug });
            return jsonWithRequestId({ message: 'Failed to update recipe' }, requestId, {
                status: 503
            });
        }

        logInfo('recipes.update.success', requestId, {
            slug,
            type: updated.type,
            visibility: updated.visibility
        });

        return jsonWithRequestId(toRecipeDetailResponse(updated, auth, userHouseholdId), requestId);
    } catch (error) {
        logError('recipes.update.unexpected_failure', requestId, {
            slug,
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
    const slug = params.id ?? '';

    logInfo('recipes.delete.start', requestId, { slug });

    if (!hasValidCsrf(request)) {
        logWarn('recipes.delete.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        logWarn('recipes.delete.unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Authentication required' }, requestId, {
            status: 401
        });
    }

    if (!isValidSlug(slug)) {
        logWarn('recipes.delete.invalid_slug', requestId, { slug });
        return jsonWithRequestId({ message: 'Invalid recipe id format' }, requestId, {
            status: 400
        });
    }

    try {
        const db = requireDb(platform);
        const existing = await getRecipeBySlug(db, slug);

        if (!existing) {
            logInfo('recipes.delete.not_found', requestId, { slug });
            return jsonWithRequestId({ message: 'Recipe not found' }, requestId, { status: 404 });
        }

        const membership = await getMembership(db, auth.userId);
        const userHouseholdId = membership?.householdId ?? null;

        if (!canEditRecipe(existing, auth, userHouseholdId)) {
            logWarn('recipes.delete.forbidden', requestId, { slug, userId: auth.userId });
            return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
        }

        await deleteRecipe(db, slug);

        logInfo('recipes.delete.success', requestId, { slug });
        return new Response(null, { status: 204 });
    } catch (error) {
        logError('recipes.delete.unexpected_failure', requestId, {
            slug,
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
