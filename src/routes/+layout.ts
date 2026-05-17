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
            canManageHousehold?: boolean;
            isAdmin?: boolean;
        }>(fetch, '/api/auth/session');
        const sessionUser = session.user ?? null;
        const canManageHousehold = Boolean(session.canManageHousehold);
        const isAdmin = Boolean(session.isAdmin);

        if (!sessionUser) {
            return { sessionUser, canManageHousehold: false, isAdmin: false };
        }

        return { sessionUser, canManageHousehold, isAdmin };
    } catch {
        return { sessionUser: null as SessionUser | null, canManageHousehold: false, isAdmin: false };
    }
};
