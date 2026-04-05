import type { Handle } from '@sveltejs/kit';

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

    return resolve(event);
};
