import type { PageLoad } from './$types';
import { apiFetchWith } from '$lib/api';

export const load: PageLoad = async ({ url, fetch }) => {
    const inviteCode = url.searchParams.get('invite')?.toUpperCase() ?? '';

    let microsoftOAuthEnabled = false;
    try {
        const session = await apiFetchWith<{
            featureFlags?: { microsoftOAuthEnabled?: boolean };
        }>(fetch, '/api/auth/session');
        microsoftOAuthEnabled = Boolean(session.featureFlags?.microsoftOAuthEnabled);
    } catch {
        // ignore session probe failure and keep Microsoft OAuth disabled by default
    }

    return { inviteCode, microsoftOAuthEnabled };
};
