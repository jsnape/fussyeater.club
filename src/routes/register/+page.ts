import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';

export const load: PageLoad = async ({ url, fetch }) => {
    const inviteCode = url.searchParams.get('invite')?.toUpperCase() ?? '';

    let socialContinuation = false;
    let socialEmail = '';
    try {
        const session = await apiFetchWith<{
            user?: { email: string | null; authProvider?: string };
        }>(fetch, '/api/auth/session');
        if (session.user?.authProvider === 'microsoft') {
            socialContinuation = true;
            socialEmail = session.user.email ?? '';
        }
    } catch {
        // ignore session probe failure, fallback to email/password flow
    }

    return {
        inviteCode,
        socialContinuation,
        socialEmail
    };
};
