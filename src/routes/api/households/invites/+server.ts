import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { createHouseholdInvite, listHouseholdInvites } from '$lib/server/invite';
import { getIdempotentResponse, saveIdempotentResponse } from '$lib/server/idempotency';
import { requireOwnerHouseholdId } from '$lib/server/household';
import { getAuthContext, requireCsrf } from '$lib/server/security';

export const GET: RequestHandler = async ({ request, platform }) => {
	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		return json({ message: 'Not found' }, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}

	try {
		const db = requireDb(platform);
		const householdId = await requireOwnerHouseholdId(db, auth.userId);
		const invites = await listHouseholdInvites(db, householdId);
		return json({ invites });
	} catch (error) {
		if (error instanceof Error && error.message === 'FORBIDDEN_NOT_OWNER') {
			return json({ message: 'Forbidden' }, { status: 403 });
		}
		return json({ message: 'Service temporarily unavailable' }, { status: 503 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		return json({ message: 'Not found' }, { status: 404 });
	}

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}

	try {
		requireCsrf(request);
	} catch {
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
		return json({ message: 'Invalid request body' }, { status: 400 });
	}

	if (!body.idempotencyKey?.trim()) {
		return json({ message: 'idempotencyKey is required' }, { status: 400 });
	}

	if (!Number.isInteger(body.maxUses) || (body.maxUses ?? 0) < 1) {
		return json({ message: 'maxUses must be a positive integer' }, { status: 400 });
	}

	const expiresInDays = body.expiresInDays ?? 7;
	if (!Number.isInteger(expiresInDays) || expiresInDays < 1) {
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
				return replay;
			}
		}

		return json(responseBody, { status: 201 });
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === 'FORBIDDEN_NOT_OWNER') {
				return json({ message: 'Forbidden' }, { status: 403 });
			}
			if (error.message === 'INVALID_INVITE_INPUT') {
				return json({ message: 'Invalid invite configuration' }, { status: 400 });
			}
			if (error.message === 'INVITE_CODE_GENERATION_FAILED') {
				return json(
					{ message: 'Unable to generate a unique invite code' },
					{ status: 503 }
				);
			}
		}

		return json({ message: 'Service temporarily unavailable' }, { status: 503 });
	}
};
