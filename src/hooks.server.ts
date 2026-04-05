import type { Handle } from '@sveltejs/kit';
import { ensureRequestId } from '$lib/server/observability';

export const handle: Handle = async ({ event, resolve }) => {
    const requestId = ensureRequestId(event.request);
    event.locals.requestId = requestId;

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
    response.headers.set('x-request-id', requestId);
    return response;
};
