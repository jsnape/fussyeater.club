import type { LayoutLoad } from './$types';
import { apiFetchWith } from '$lib/api';

type SessionUser = {
    id: string;
    email: string | null;
    name: string | null;
    authProvider: string;
};

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends('auth:session');

    try {
        const session = await apiFetchWith<{
            user?: SessionUser | null;
        }>(fetch, '/api/auth/session');
        return { sessionUser: session.user ?? null };
    } catch {
        return { sessionUser: null as SessionUser | null };
    }
};
