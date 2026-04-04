import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';
import { redeemInviteCode } from '$lib/server/invite';
import { getAuthContext } from '$lib/server/security';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!isFeatureEnabled(platform, FEATURE_FLAGS.registrationV2Enabled)) {
		return json({ message: 'Not found' }, { status: 404 });
	}

	let body: { code?: string };
	try {
		body = (await request.json()) as { code?: string };
	} catch {
		return json({ message: 'Invalid request body' }, { status: 400 });
	}

	const code = body.code?.trim();
	if (!code) {
		return json({ message: 'Invite code is required' }, { status: 400 });
	}

	try {
		const db = requireDb(platform);
		const auth = getAuthContext(request);
		const result = await redeemInviteCode(db, code, auth.userId);
		return json(result);
	} catch (error) {
		if (error instanceof Error) {
			switch (error.message) {
				case 'INVITE_NOT_FOUND':
					return json({ message: 'Invite not found' }, { status: 404 });
				case 'INVITE_NOT_JOINABLE':
					return json(
						{ message: 'Invite is expired, revoked, or exhausted' },
						{ status: 410 }
					);
				case 'ALREADY_IN_HOUSEHOLD':
					return json({ message: 'Already in a household' }, { status: 409 });
				default:
					return json({ message: 'Service temporarily unavailable' }, { status: 503 });
			}
		}

		return json({ message: 'Service temporarily unavailable' }, { status: 503 });
	}
};
