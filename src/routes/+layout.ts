import type { LayoutLoad } from './$types';
import { ApiError, apiFetchWith } from '$lib/api';

type SessionUser = {
    id: string;
    email: string | null;
    name: string | null;
    authProvider: string;
};

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends('auth:session');

    let sessionUser: SessionUser | null = null;
    try {
        const session = await apiFetchWith<{
            user?: SessionUser | null;
        }>(fetch, '/api/auth/session');
        sessionUser = session.user ?? null;
    } catch {
        return { sessionUser: null as SessionUser | null, canManageHousehold: false };
    }

    if (!sessionUser) {
        return { sessionUser, canManageHousehold: false };
    }

    try {
        await apiFetchWith(fetch, '/api/households/members');
        return { sessionUser, canManageHousehold: true };
    } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
            return { sessionUser, canManageHousehold: false };
        }
        return { sessionUser, canManageHousehold: false };
    }
};
