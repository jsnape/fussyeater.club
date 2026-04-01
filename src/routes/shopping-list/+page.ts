import { createApiClient, type ShoppingList } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const api = createApiClient(fetch);

    try {
        const shoppingList: ShoppingList = await api.shoppingList.getCurrent();
        return { shoppingList };
    } catch {
        return { shoppingList: null };
    }
};
