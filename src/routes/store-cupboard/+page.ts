import { createApiClient, type StoreCupboard } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch);

    try {
        const storeCupboard: StoreCupboard = await api.storeCupboard.getCurrent();
        return { storeCupboard };
    } catch {
        return { storeCupboard: null };
    }
};
