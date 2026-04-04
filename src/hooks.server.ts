import type { Handle } from '@sveltejs/kit';
import { FEATURE_FLAGS, isFeatureEnabled } from '$lib/server/feature-flags';

export const handle: Handle = async ({ event, resolve }) => {
	const csrfCookie = event.cookies.get('csrf-token');
	if (!csrfCookie) {
		event.cookies.set('csrf-token', crypto.randomUUID(), {
			path: '/',
			httpOnly: false,
			sameSite: 'strict',
			secure: event.url.protocol === 'https:'
		});
	}

	const response = await resolve(event);
	if (!isFeatureEnabled(event.platform, FEATURE_FLAGS.registrationV2Enabled)) {
		return response;
	}

	return response;
};
