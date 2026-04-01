import { createApiClient, type Household } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch);

    try {
        const household: Household = await api.household.getCurrent();
        return { household };
    } catch {
        return { household: null };
    }
};
