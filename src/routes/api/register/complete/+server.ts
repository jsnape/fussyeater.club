import { json, type RequestHandler } from '@sveltejs/kit';
import { completeRegistration } from '$lib/server/registration';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getIdempotentResponse, saveIdempotentResponse } from '$lib/server/idempotency';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const POST: RequestHandler = async ({ request, platform }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.info('[register.complete] start', { requestId, path: '/api/register/complete' });

    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        console.warn('[register.complete] registration feature disabled', { requestId });
        return json({ message: 'Not found' }, { status: 404 });
    }

    try {
        requireCsrf(request);
    } catch {
        console.warn('[register.complete] csrf verification failed', { requestId });
        return json({ message: 'CSRF verification failed' }, { status: 403 });
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
        console.warn('[register.complete] invalid request body', { requestId });
        return json({ message: 'Invalid request body' }, { status: 400 });
    }

    if (!body.idempotencyKey?.trim()) {
        console.warn('[register.complete] missing idempotencyKey', { requestId });
        return json({ message: 'idempotencyKey is required' }, { status: 400 });
    }

    if (body.householdAction !== 'create' && body.householdAction !== 'join') {
        console.warn('[register.complete] invalid householdAction', {
            requestId,
            householdAction: body.householdAction ?? null
        });
        return json({ message: 'householdAction must be create or join' }, { status: 400 });
    }

    const isSocialContinuationPayload = !body.password && !body.confirmPassword;
    if (!isSocialContinuationPayload && body.password !== body.confirmPassword) {
        console.warn('[register.complete] password confirmation mismatch', { requestId });
        return json({ message: 'Validation failed' }, { status: 400 });
    }

    try {
        const db = requireDb(platform);
        const auth = await getAuthContext(request, platform);
        let userScope = auth.userId;
        if (!userScope) {
            const normalizedEmail = (body.email ?? '').trim().toLowerCase();
            if (!normalizedEmail) {
                console.warn('[register.complete] missing email for anonymous registration', {
                    requestId
                });
                return json({ message: 'Email is required' }, { status: 400 });
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
            console.info('[register.complete] idempotent replay', { requestId, userScope });
            return existing;
        }

        if (auth.socialProvider === 'microsoft' && !auth.userId) {
            console.warn('[register.complete] unauthenticated social continuation', { requestId });
            return json(
                { message: 'Authentication required for social continuation' },
                { status: 401 }
            );
        }

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

        const wrote = await saveIdempotentResponse(
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
                console.info('[register.complete] idempotent replay after concurrent write', {
                    requestId,
                    userScope
                });
                return replay;
            }
        }
        console.info('[register.complete] success', {
            requestId,
            actionApplied: result.actionApplied,
            householdAction: body.householdAction
        });
        return json(result, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Database binding is not configured':
                    console.error('[register.complete] database binding missing', {
                        requestId,
                        error: error.message
                    });
                    return json(
                        {
                            message:
                                'Database is not configured for this Worker. Add a D1 binding named DB in wrangler.jsonc.'
                        },
                        { status: 503 }
                    );
                case 'INVALID_REGISTRATION_INPUT':
                    return json({ message: 'Validation failed' }, { status: 400 });
                case 'UNAUTHENTICATED_SOCIAL_CONTINUATION':
                    return json(
                        { message: 'Authentication required for social continuation' },
                        { status: 401 }
                    );
                case 'GENERIC_AUTH_FAILURE':
                    return json({ message: 'Invalid registration credentials' }, { status: 401 });
                case 'ALREADY_IN_HOUSEHOLD':
                    return json({ message: 'Already in a household' }, { status: 409 });
                case 'JOIN_INTENT_INVALID':
                case 'JOIN_INTENT_EXPIRED':
                case 'INVITE_EXHAUSTED':
                    return json({ message: 'Join invitation is no longer valid' }, { status: 410 });
                default:
                    console.error('[register.complete] unexpected failure', {
                        requestId,
                        error: error.message
                    });
                    return json({ message: 'Service temporarily unavailable' }, { status: 503 });
            }
        }

        console.error('[register.complete] failed with non-Error value', { requestId, error });
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
