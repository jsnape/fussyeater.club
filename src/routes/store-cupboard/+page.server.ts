import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const itemsJson = String(formData.get('itemsJson') ?? '[]').trim();

        let items: unknown;
        try {
            items = JSON.parse(itemsJson || '[]');
        } catch {
            return fail(400, { message: 'Items JSON is invalid.' });
        }

        const response = await fetch('/api/store-cupboard', {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });

        if (!response.ok) {
            return fail(response.status, { message: 'Unable to save store cupboard.' });
        }

        return { success: true };
    },
};
