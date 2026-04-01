import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();

        const mealPlanId = String(formData.get('mealPlanId') ?? '').trim();
        const itemsJson = String(formData.get('itemsJson') ?? '[]').trim();

        let items: unknown;
        try {
            items = JSON.parse(itemsJson || '[]');
        } catch {
            return fail(400, { message: 'Items JSON is invalid.' });
        }

        const response = await fetch('/api/shopping-list', {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                mealPlanId,
                items,
            }),
        });

        if (!response.ok) {
            return fail(response.status, { message: 'Unable to save shopping list.' });
        }

        return { success: true };
    },
};
