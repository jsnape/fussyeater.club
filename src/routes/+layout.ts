import type { LayoutLoad } from './$types';

type SessionUser = {
    id: string;
    email: string | null;
    name: string | null;
    authProvider: string;
};

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends('auth:session');

    try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
            return { sessionUser: null as SessionUser | null };
        }

        const session = (await response.json()) as {
            user?: SessionUser | null;
        };
        return { sessionUser: session.user ?? null };
    } catch {
        return { sessionUser: null as SessionUser | null };
    }
};
