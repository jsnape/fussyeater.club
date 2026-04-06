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

    let sessionUser: SessionUser | null = null;
    let canManageHousehold = false;
    try {
        const session = await apiFetchWith<{
            user?: SessionUser | null;
            canManageHousehold?: boolean;
        }>(fetch, '/api/auth/session');
        sessionUser = session.user ?? null;
        canManageHousehold = Boolean(session.canManageHousehold);
    } catch {
        return { sessionUser: null as SessionUser | null, canManageHousehold: false };
    }

    if (!sessionUser) {
        return { sessionUser, canManageHousehold: false };
    }

    return { sessionUser, canManageHousehold };
};
