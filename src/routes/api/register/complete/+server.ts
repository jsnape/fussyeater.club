import { json, type RequestHandler } from '@sveltejs/kit';
import { completeRegistration } from '$lib/server/registration';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { getIdempotentResponse, saveIdempotentResponse } from '$lib/server/idempotency';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const POST: RequestHandler = async ({ request, platform }) => {
    if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
        return json({ message: 'Not found' }, { status: 404 });
    }

    try {
        requireCsrf(request);
    } catch {
        return json({ message: 'CSRF verification failed' }, { status: 403 });
    }

    let body: {
        name?: string;
        email?: string;
        password?: string;
        householdAction?: 'create' | 'join';
        householdName?: string;
        joinIntentToken?: string;
        idempotencyKey?: string;
    };
    try {
        body = (await request.json()) as typeof body;
    } catch {
        return json({ message: 'Invalid request body' }, { status: 400 });
    }

    if (!body.idempotencyKey?.trim()) {
        return json({ message: 'idempotencyKey is required' }, { status: 400 });
    }

    if (body.householdAction !== 'create' && body.householdAction !== 'join') {
        return json({ message: 'householdAction must be create or join' }, { status: 400 });
    }

    try {
        const db = requireDb(platform);
        const auth = await getAuthContext(request, platform);
        const normalizedEmail = (body.email ?? '').trim().toLowerCase();
        if (!auth.userId && !normalizedEmail) {
            return json({ message: 'Email is required' }, { status: 400 });
        }
        const userScope = auth.userId ?? `anonymous:${normalizedEmail}`;
        const existing = await getIdempotentResponse(
            db,
            '/api/register/complete',
            body.idempotencyKey,
            userScope
        );
        if (existing) {
            return existing;
        }

        if (auth.socialProvider === 'microsoft' && !auth.userId) {
            return json(
                { message: 'Authentication required for social continuation' },
                { status: 401 }
            );
        }

        const result = await completeRegistration(db, {
            name: body.name ?? '',
            email: body.email,
            password: body.password,
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
                return replay;
            }
        }
        return json(result, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Database binding is not configured':
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
                    console.error('POST /api/register/complete failed', error);
                    return json({ message: 'Service temporarily unavailable' }, { status: 503 });
            }
        }

        console.error('POST /api/register/complete failed with non-Error value', error);
        return json({ message: 'Service temporarily unavailable' }, { status: 503 });
    }
};
