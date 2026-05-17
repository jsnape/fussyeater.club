import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext, hasValidCsrf } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import { createRecipe } from '$lib/server/recipe';
import { toRecipeDetailResponse, parseJsonField } from '$lib/server/recipe-response';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export const GET: RequestHandler = async (event) => {
    const { request, platform, url } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('recipes.list.get.start', requestId, { path: '/api/recipes' });

    const qRaw = url.searchParams.get('q')?.trim() ?? '';
    const pageRaw = url.searchParams.get('page');
    const pageSizeRaw = url.searchParams.get('pageSize');
    const sort = url.searchParams.get('sort') ?? 'latest';

    const page = pageRaw ? Number.parseInt(pageRaw, 10) : DEFAULT_PAGE;
    const pageSize = pageSizeRaw ? Number.parseInt(pageSizeRaw, 10) : DEFAULT_PAGE_SIZE;

    if (
        Number.isNaN(page) ||
        page < 1 ||
        Number.isNaN(pageSize) ||
        pageSize < 1 ||
        pageSize > MAX_PAGE_SIZE
    ) {
        logWarn('recipes.list.get.invalid_params', requestId, {
            page: pageRaw,
            pageSize: pageSizeRaw
        });
        return jsonWithRequestId({ message: 'Invalid page or pageSize parameter' }, requestId, {
            status: 400
        });
    }

    try {
        const db = requireDb(platform);
        const auth = await getAuthContext(request, platform);
        const membership = auth.userId ? await getMembership(db, auth.userId) : null;
        const userHouseholdId = membership?.householdId ?? null;

        const binds: unknown[] = [];
        let bindIndex = 1;

        // Build WHERE clause
        const conditions: string[] = [];

        // Visibility: public + user's private household recipes
        if (userHouseholdId) {
            conditions.push(
                `(visibility = 'public' OR (visibility = 'private' AND household_id = ?${bindIndex}))`
            );
            binds.push(userHouseholdId);
            bindIndex++;
        } else {
            conditions.push("visibility = 'public'");
        }

        // Keyword search
        if (qRaw) {
            conditions.push(`(title LIKE ?${bindIndex} OR description LIKE ?${bindIndex})`);
            binds.push(`%${qRaw}%`);
            bindIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Sort
        let orderClause: string;
        switch (sort) {
            case 'quickest':
                orderClause =
                    'ORDER BY (COALESCE(prep_minutes, 0) + COALESCE(cook_minutes, 0)) ASC, title ASC';
                break;
            case 'alphabetical':
                orderClause = 'ORDER BY title ASC';
                break;
            case 'latest':
            default:
                orderClause = 'ORDER BY created_at DESC, title ASC';
                break;
        }

        // Count query
        const countSql = `SELECT COUNT(*) as total FROM recipes ${whereClause}`;
        const countResult = await db
            .prepare(countSql)
            .bind(...binds)
            .first<{ total: number }>();
        const total = countResult?.total ?? 0;

        // List query
        const offset = (page - 1) * pageSize;
        const listSql = `SELECT id, title, description, image_url, type, visibility,
			servings, yield, prep_minutes, cook_minutes, source_reference, tags
			FROM recipes ${whereClause} ${orderClause} LIMIT ?${bindIndex} OFFSET ?${bindIndex + 1}`;

        const listBinds = [...binds, pageSize, offset];
        const listResult = await db
            .prepare(listSql)
            .bind(...listBinds)
            .all<{
                id: string;
                title: string;
                description: string | null;
                image_url: string | null;
                type: string;
                visibility: string;
                servings: number | null;
                yield: string | null;
                prep_minutes: number | null;
                cook_minutes: number | null;
                source_reference: string | null;
                tags: string;
            }>();

        const items = (listResult.results ?? []).map((row) => {
            const timings =
                row.prep_minutes != null || row.cook_minutes != null
                    ? {
                          prepMinutes: row.prep_minutes ?? undefined,
                          cookMinutes: row.cook_minutes ?? undefined
                      }
                    : undefined;

            return {
                id: row.id,
                title: row.title,
                description: row.description ?? undefined,
                imageUrl: row.image_url ?? undefined,
                type: row.type,
                visibility: row.visibility,
                timings,
                servings: row.servings ?? undefined,
                yield: row.yield ?? undefined,
                tags: parseJsonField<string[]>(row.tags, []),
                sourceReference:
                    row.type === 'reference'
                        ? parseJsonField(row.source_reference, undefined)
                        : undefined
            };
        });

        logInfo('recipes.list.get.success', requestId, {
            queryPresent: Boolean(qRaw),
            resultCount: items.length,
            total,
            page
        });

        return jsonWithRequestId({ items, page, pageSize, total }, requestId);
    } catch (error) {
        logError('recipes.list.get.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};

type CreateRecipeBody = {
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

function validateCreateRecipeBody(body: CreateRecipeBody): ValidationError[] {
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

export const POST: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('recipes.create.start', requestId, { path: '/api/recipes' });

    if (!hasValidCsrf(request)) {
        logWarn('recipes.create.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    const auth = await getAuthContext(request, platform);

    if (!auth.userId) {
        logWarn('recipes.create.unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Authentication required' }, requestId, {
            status: 401
        });
    }

    let body: CreateRecipeBody;
    try {
        body = (await request.json()) as CreateRecipeBody;
    } catch {
        logWarn('recipes.create.invalid_json', requestId);
        return jsonWithRequestId({ message: 'Invalid JSON body' }, requestId, { status: 400 });
    }

    const errors = validateCreateRecipeBody(body);
    if (errors.length > 0) {
        logWarn('recipes.create.validation_error', requestId, {
            fields: errors.map((e) => e.field)
        });
        return jsonWithRequestId({ message: 'Validation failed', errors }, requestId, {
            status: 400
        });
    }

    try {
        const db = requireDb(platform);
        const membership = await getMembership(db, auth.userId);
        const userHouseholdId = membership?.householdId ?? null;

        const visibility = (body.visibility as 'public' | 'private') ?? 'private';

        if (visibility === 'private' && !userHouseholdId) {
            logWarn('recipes.create.no_household_for_private', requestId, { userId: auth.userId });
            return jsonWithRequestId(
                { message: 'You must belong to a household to create private recipes' },
                requestId,
                { status: 403 }
            );
        }

        const recipe = await createRecipe(db, {
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
            householdId: visibility === 'private' ? userHouseholdId : null,
            createdBy: auth.userId
        });

        logInfo('recipes.create.success', requestId, {
            recipeId: recipe.id,
            recipeType: recipe.type,
            visibility: recipe.visibility,
            slugCollision:
                recipe.id !== (body.title as string).trim().toLowerCase().replace(/\s+/g, '-')
        });

        return jsonWithRequestId(toRecipeDetailResponse(recipe, auth, userHouseholdId), requestId, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'SLUG_COLLISION_EXHAUSTED') {
            logWarn('recipes.create.slug_collision_exhausted', requestId);
            return jsonWithRequestId(
                {
                    message:
                        'Could not generate a unique URL for this recipe title. Please try a different title.'
                },
                requestId,
                { status: 409 }
            );
        }

        logError('recipes.create.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
