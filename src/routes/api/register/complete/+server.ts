import type { RequestHandler } from '@sveltejs/kit';
import { completeRegistration } from '$lib/server/registration';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import {
    finalizeIdempotentResponse,
    getIdempotentResponse,
    hasPendingIdempotencyKey,
    releasePendingIdempotencyKey,
    reserveIdempotencyKey
} from '$lib/server/idempotency';
import { getAuthContext, requireCsrf } from '$lib/server/security';
import {
    jsonWithRequestId,
    logError,
    logInfo,
    logWarn,
    resolveEventRequestId
} from '$lib/server/observability';

export const POST: RequestHandler = async (event) => {
    const { request, platform } = event;
    const requestId = resolveEventRequestId(event);
    logInfo('register.complete.start', requestId, { path: '/api/register/complete' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        logWarn('register.complete.feature_disabled', requestId);
        return jsonWithRequestId({ message: 'Not found' }, requestId, { status: 404 });
    }

    try {
        requireCsrf(request);
    } catch {
        logWarn('register.complete.csrf_failed', requestId);
        return jsonWithRequestId({ message: 'CSRF verification failed' }, requestId, {
            status: 403
        });
    }

    let body: {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        householdAction?: 'create' | 'join';
        householdName?: string;
        joinIntentToken?: string;
        idempotencyKey?: string;
    };
    try {
        body = (await request.json()) as typeof body;
    } catch {
        logWarn('register.complete.invalid_body', requestId);
        return jsonWithRequestId({ message: 'Invalid request body' }, requestId, { status: 400 });
    }

    if (!body.idempotencyKey?.trim()) {
        logWarn('register.complete.missing_idempotency_key', requestId);
        return jsonWithRequestId({ message: 'idempotencyKey is required' }, requestId, {
            status: 400
        });
    }

    if (body.householdAction !== 'create' && body.householdAction !== 'join') {
        logWarn('register.complete.invalid_household_action', requestId, {
            requestId,
            householdAction: body.householdAction ?? null
        });
        return jsonWithRequestId({ message: 'householdAction must be create or join' }, requestId, {
            status: 400
        });
    }

    const isSocialContinuationPayload = !body.password && !body.confirmPassword;
    if (!isSocialContinuationPayload && body.password !== body.confirmPassword) {
        logWarn('register.complete.password_confirmation_mismatch', requestId);
        return jsonWithRequestId({ message: 'Validation failed' }, requestId, { status: 400 });
    }

    try {
        const db = requireDb(platform);
        const auth = await getAuthContext(request, platform);
        if (isSocialContinuationPayload && !auth.userId) {
            logWarn('register.complete.unauthenticated_social_continuation', requestId);
            return jsonWithRequestId(
                { message: 'Authentication required for social continuation' },
                requestId,
                { status: 401 }
            );
        }
        if (isSocialContinuationPayload && auth.socialProvider !== 'microsoft') {
            logWarn('register.complete.invalid_social_continuation_provider', requestId, {
                provider: auth.socialProvider
            });
            return jsonWithRequestId(
                { message: 'Authentication required for social continuation' },
                requestId,
                { status: 401 }
            );
        }
        let userScope = auth.userId;
        if (!userScope) {
            const normalizedEmail = (body.email ?? '').trim().toLowerCase();
            if (!normalizedEmail) {
                logWarn('register.complete.missing_email_for_anonymous_registration', requestId);
                return jsonWithRequestId({ message: 'Email is required' }, requestId, {
                    status: 400
                });
            }
            userScope = `anonymous:${normalizedEmail}`;
        }
        const existing = await getIdempotentResponse(
            db,
            '/api/register/complete',
            body.idempotencyKey,
            userScope
        );
        if (existing) {
            logInfo('register.complete.idempotent_replay', requestId);
            return jsonWithRequestId(await existing.json(), requestId, { status: existing.status });
        }
        const reserved = await reserveIdempotencyKey(
            db,
            '/api/register/complete',
            body.idempotencyKey,
            userScope
        );
        if (!reserved) {
            const replay = await getIdempotentResponse(
                db,
                '/api/register/complete',
                body.idempotencyKey,
                userScope
            );
            if (replay) {
                logInfo(
                    'register.complete.idempotent_replay_after_duplicate_reservation',
                    requestId
                );
                return jsonWithRequestId(await replay.json(), requestId, { status: replay.status });
            }

            if (
                await hasPendingIdempotencyKey(
                    db,
                    '/api/register/complete',
                    body.idempotencyKey,
                    userScope
                )
            ) {
                return jsonWithRequestId({ message: 'Duplicate request in progress' }, requestId, {
                    status: 409
                });
            }
        }

        try {
            const result = await completeRegistration(db, {
                name: body.name ?? '',
                email: body.email,
                password: body.password,
                confirmPassword: body.confirmPassword,
                householdAction: body.householdAction,
                householdName: body.householdName,
                joinIntentToken: body.joinIntentToken,
                authUserId: auth.userId,
                authEmail: auth.email,
                socialProvider: auth.socialProvider
            });

            const wrote = await finalizeIdempotentResponse(
                db,
                '/api/register/complete',
                body.idempotencyKey,
                userScope,
                201,
                result
            );
            if (!wrote) {
                const replay = await getIdempotentResponse(
                    db,
                    '/api/register/complete',
                    body.idempotencyKey,
                    userScope
                );
                if (replay) {
                    logInfo(
                        'register.complete.idempotent_replay_after_concurrent_write',
                        requestId
                    );
                    return jsonWithRequestId(await replay.json(), requestId, {
                        status: replay.status
                    });
                }
                if (reserved) {
                    await releasePendingIdempotencyKey(
                        db,
                        '/api/register/complete',
                        body.idempotencyKey,
                        userScope
                    );
                }
                logError('register.complete.idempotency_finalize_failed', requestId, {
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
            logInfo('register.complete.success', requestId, {
                requestId,
                actionApplied: result.actionApplied,
                householdAction: body.householdAction
            });
            return jsonWithRequestId(result, requestId, { status: 201 });
        } catch (error) {
            if (reserved) {
                await releasePendingIdempotencyKey(
                    db,
                    '/api/register/complete',
                    body.idempotencyKey,
                    userScope
                );
            }
            throw error;
        }
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Database binding is not configured':
                    logError('register.complete.database_binding_missing', requestId, {
                        error: error.message
                    });
                    return jsonWithRequestId(
                        {
                            message:
                                'Database is not configured for this Worker. Add a D1 binding named DB in wrangler.jsonc.'
                        },
                        requestId,
                        { status: 503 }
                    );
                case 'INVALID_REGISTRATION_INPUT':
                    return jsonWithRequestId({ message: 'Validation failed' }, requestId, {
                        status: 400
                    });
                case 'UNAUTHENTICATED_SOCIAL_CONTINUATION':
                    return jsonWithRequestId(
                        { message: 'Authentication required for social continuation' },
                        requestId,
                        { status: 401 }
                    );
                case 'GENERIC_AUTH_FAILURE':
                    return jsonWithRequestId(
                        { message: 'Invalid registration credentials' },
                        requestId,
                        { status: 401 }
                    );
                case 'ALREADY_IN_HOUSEHOLD':
                    return jsonWithRequestId({ message: 'Already in a household' }, requestId, {
                        status: 409
                    });
                case 'JOIN_INTENT_INVALID':
                case 'JOIN_INTENT_EXPIRED':
                case 'INVITE_EXHAUSTED':
                    return jsonWithRequestId(
                        { message: 'Join invitation is no longer valid' },
                        requestId,
                        { status: 410 }
                    );
                default:
                    logError('register.complete.unexpected_failure', requestId, {
                        error: error.message
                    });
                    return jsonWithRequestId(
                        { message: 'Service temporarily unavailable' },
                        requestId,
                        { status: 503 }
                    );
            }
        }

        logError('register.complete.unexpected_non_error_failure', requestId, {
            error: String(error)
        });
        return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, {
            status: 503
        });
    }
};
