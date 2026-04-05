import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { createHouseholdInvite, listHouseholdInvites } from '$lib/server/invite';
import { getIdempotentResponse, saveIdempotentResponse } from '$lib/server/idempotency';
import { requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const GET: RequestHandler = async ({ request, platform }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.info('[households.invites.get] start', { requestId, path: '/api/households/invites' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        console.warn('[households.invites.get] registration feature disabled', { requestId });
        return json({ message: 'Not found' }, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        console.warn('[households.invites.get] forbidden unauthenticated', { requestId });
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const invites = await listHouseholdInvites(db, householdId);
        console.info('[households.invites.get] success', {
            requestId,
            userId: auth.userId,
            inviteCount: invites.length
        });
        return json({ invites });
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
            console.warn('[households.invites.get] forbidden non-owner', {
                requestId,
                userId: auth.userId
            });
            return json({ message: 'Forbidden' }, { status: 403 });
        }
        console.error('[households.invites.get] unexpected failure', {
            requestId,
            error: error instanceof Error ? error.message : error
        });
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};

export const POST: RequestHandler = async ({ request, platform }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.info('[households.invites.post] start', { requestId, path: '/api/households/invites' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        console.warn('[households.invites.post] registration feature disabled', { requestId });
        return json({ message: 'Not found' }, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        console.warn('[households.invites.post] forbidden unauthenticated', { requestId });
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        requireCsrf(request);
    } catch {
        console.warn('[households.invites.post] csrf verification failed', { requestId });
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    let body: {
        maxUses?: number;
        expiresInDays?: number;
        regenerate?: boolean;
        idempotencyKey?: string;
    };
    try {
        body = (await request.json()) as typeof body;
    } catch {
        console.warn('[households.invites.post] invalid request body', { requestId });
        return json({ message: 'Invalid request body' }, { status: 400 });
    }

    if (!body.idempotencyKey?.trim()) {
        console.warn('[households.invites.post] missing idempotencyKey', { requestId });
        return json({ message: 'idempotencyKey is required' }, { status: 400 });
    }

    if (!Number.isInteger(body.maxUses) || (body.maxUses ?? 0) < 1) {
        console.warn('[households.invites.post] invalid maxUses', {
            requestId,
            maxUses: body.maxUses ?? null
        });
        return json({ message: 'maxUses must be a positive integer' }, { status: 400 });
    }

    const expiresInDays = body.expiresInDays ?? 7;
    if (!Number.isInteger(expiresInDays) || expiresInDays < 1) {
        console.warn('[households.invites.post] invalid expiresInDays', {
            requestId,
            expiresInDays
        });
        return json({ message: 'expiresInDays must be a positive integer' }, { status: 400 });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const existing = await getIdempotentResponse(
            db,
            '/api/households/invites',
            body.idempotencyKey,
            auth.userId
        );
        if (existing) {
            console.info('[households.invites.post] idempotent replay', {
                requestId,
                userId: auth.userId
            });
            return existing;
        }

        const created = await createHouseholdInvite(
            db,
            householdId,
            auth.userId,
            body.maxUses as number,
            expiresInDays,
            Boolean(body.regenerate)
        );

        const responseBody = {
            code: created.code,
            maxUses: created.maxUses,
            remainingUses: created.remainingUses,
            expiresAt: created.expiresAt
        };

        const wrote = await saveIdempotentResponse(
            db,
            '/api/households/invites',
            body.idempotencyKey,
            auth.userId,
            201,
            responseBody
        );
        if (!wrote) {
            const replay = await getIdempotentResponse(
                db,
                '/api/households/invites',
                body.idempotencyKey,
                auth.userId
            );
            if (replay) {
                console.info('[households.invites.post] idempotent replay after concurrent write', {
                    requestId,
                    userId: auth.userId
                });
                return replay;
            }
        }

        console.info('[households.invites.post] success', {
            requestId,
            userId: auth.userId,
            maxUses: created.maxUses,
            regenerate: Boolean(body.regenerate)
        });
        return json(responseBody, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'FORBIDDEN_NOT_OWNER') {
                console.warn('[households.invites.post] forbidden non-owner', {
                    requestId,
                    userId: auth.userId
                });
                return json({ message: 'Forbidden' }, { status: 403 });
            }
            if (error.message === 'INVALID_INVITE_INPUT') {
                console.warn('[households.invites.post] invalid invite input', { requestId });
                return json({ message: 'Invalid invite configuration' }, { status: 400 });
            }
            if (error.message === 'INVITE_CODE_GENERATION_FAILED') {
                console.error('[households.invites.post] invite code generation failed', {
                    requestId
                });
                return json(
                    { message: 'Unable to generate a unique invite code' },
                    { status: 503 }
                );
            }
        }

        console.error('[households.invites.post] unexpected failure', {
            requestId,
            error: error instanceof Error ? error.message : error
        });
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
