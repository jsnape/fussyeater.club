import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { createHouseholdInvite, listHouseholdInvites } from '$lib/server/invite';
import {
    finalizeIdempotentResponse,
    getIdempotentResponse,
    hasPendingIdempotencyKey,
    releasePendingIdempotencyKey,
    reserveIdempotencyKey
} from '$lib/server/idempotency';
import { requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext, requireCsrf } from '$lib/server/security';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

export const GET: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('households.invites.get.start', requestId, { path: '/api/households/invites' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        logWarn('households.invites.get.feature_disabled', requestId);
        return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        logWarn('households.invites.get.forbidden_unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
    }

    try {
        const db = requireDb(platform);
        const householdId = await requireOwnerHouseholdId(db, auth.userId);
        const invites = await listHouseholdInvites(db, householdId);
        logInfo('households.invites.get.success', requestId, {
            requestId,
            userId: auth.userId,
            inviteCount: invites.length
        });
        return jsonWithRequestId({ invites }, requestId);
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
            logWarn('households.invites.get.forbidden_non_owner', requestId, {
                userId: auth.userId
            });
            return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
        }
        logError('households.invites.get.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};

export const POST: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('households.invites.post.start', requestId, { path: '/api/households/invites' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        logWarn('households.invites.post.feature_disabled', requestId);
        return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
    }

    const auth = await getAuthContext(request, platform);
    if (!auth.userId) {
        logWarn('households.invites.post.forbidden_unauthenticated', requestId);
        return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
    }

    try {
        requireCsrf(request);
    } catch {
        logWarn('households.invites.post.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
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
        logWarn('households.invites.post.invalid_body', requestId);
        return jsonWithRequestId({ message: 'Invalid request body' }, requestId, { status: 400 });
    }

    if (!body.idempotencyKey?.trim()) {
        logWarn('households.invites.post.missing_idempotency_key', requestId);
        return jsonWithRequestId({ message: 'idempotencyKey is required' }, requestId, {
            status: 400
        });
    }

    if (!Number.isInteger(body.maxUses) || (body.maxUses ?? 0) < 1) {
        logWarn('households.invites.post.invalid_max_uses', requestId, {
            requestId,
            maxUses: body.maxUses ?? null
        });
        return jsonWithRequestId({ message: 'maxUses must be a positive integer' }, requestId, {
            status: 400
        });
    }

    const expiresInDays = body.expiresInDays ?? 7;
    if (!Number.isInteger(expiresInDays) || expiresInDays < 1) {
        logWarn('households.invites.post.invalid_expires_in_days', requestId, {
            requestId,
            expiresInDays
        });
        return jsonWithRequestId(
            { message: 'expiresInDays must be a positive integer' },
            requestId,
            { status: 400 }
        );
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
            logInfo('households.invites.post.idempotent_replay', requestId, {
                userId: auth.userId
            });
            return jsonWithRequestId(await existing.json(), requestId, { status: existing.status });
        }

        const reserved = await reserveIdempotencyKey(
            db,
            '/api/households/invites',
            body.idempotencyKey,
            auth.userId
        );
        if (!reserved) {
            const replay = await getIdempotentResponse(
                db,
                '/api/households/invites',
                body.idempotencyKey,
                auth.userId
            );
            if (replay) {
                logInfo(
                    'households.invites.post.idempotent_replay_after_duplicate_reservation',
                    requestId,
                    {
                        userId: auth.userId
                    }
                );
                return jsonWithRequestId(await replay.json(), requestId, {
                    status: replay.status
                });
            }

            if (
                await hasPendingIdempotencyKey(
                    db,
                    '/api/households/invites',
                    body.idempotencyKey,
                    auth.userId
                )
            ) {
                return jsonWithRequestId({ message: 'Duplicate request in progress' }, requestId, {
                    status: 409
                });
            }
        }

        try {
            const created = await createHouseholdInvite(
                db,
                householdId,
                auth.userId,
                body.maxUses as number,
                expiresInDays
            );

            const responseBody = {
                code: created.code,
                maxUses: created.maxUses,
                remainingUses: created.remainingUses,
                expiresAt: created.expiresAt
            };

            const wrote = await finalizeIdempotentResponse(
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
                    logInfo(
                        'households.invites.post.idempotent_replay_after_concurrent_write',
                        requestId,
                        {
                            userId: auth.userId
                        }
                    );
                    return jsonWithRequestId(await replay.json(), requestId, {
                        status: replay.status
                    });
                }
                if (reserved) {
                    await releasePendingIdempotencyKey(
                        db,
                        '/api/households/invites',
                        body.idempotencyKey,
                        auth.userId
                    );
                }
                logError('households.invites.post.idempotency_finalize_failed', requestId, {
                    userId: auth.userId,
                    idempotencyKey: body.idempotencyKey
                });
                return jsonWithRequestId(
                    { message: 'Service temporarily unavailable' },
                    requestId,
                    {
                        status: 503
                    }
                );
            }

            logInfo('households.invites.post.success', requestId, {
                requestId,
                userId: auth.userId,
                maxUses: created.maxUses,
                regenerate: Boolean(body.regenerate)
            });
            return jsonWithRequestId(responseBody, requestId, { status: 201 });
        } catch (error) {
            if (reserved) {
                await releasePendingIdempotencyKey(
                    db,
                    '/api/households/invites',
                    body.idempotencyKey,
                    auth.userId
                );
            }
            throw error;
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'FORBIDDEN_NOT_OWNER') {
                logWarn('households.invites.post.forbidden_non_owner', requestId, {
                    userId: auth.userId
                });
                return jsonWithRequestId({ message: 'Forbidden' }, requestId, { status: 403 });
            }
            if (error.message === 'INVALID_INVITE_INPUT') {
                logWarn('households.invites.post.invalid_invite_input', requestId);
                return jsonWithRequestId({ message: 'Invalid invite configuration' }, requestId, {
                    status: 400
                });
            }
            if (error.message === 'INVITE_CODE_GENERATION_FAILED') {
                logError('households.invites.post.code_generation_failed', requestId);
                return jsonWithRequestId(
                    { message: 'Unable to generate a unique invite code' },
                    requestId,
                    { status: 503 }
                );
            }
            if (error.message === 'ACTIVE_INVITE_CONFLICT') {
                logWarn('households.invites.post.active_invite_conflict', requestId, {
                    userId: auth.userId
                });
                return jsonWithRequestId(
                    { message: 'Another invite was just created. Refresh and try again.' },
                    requestId,
                    { status: 409 }
                );
            }
        }

        logError('households.invites.post.unexpected_failure', requestId, {
            error: error instanceof Error ? error.message : String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
