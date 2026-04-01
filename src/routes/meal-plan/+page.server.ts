import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();

        const title = String(formData.get('title') ?? '').trim();
        const startDate = String(formData.get('startDate') ?? '').trim();
        const endDate = String(formData.get('endDate') ?? '').trim();
        const mealsJson = String(formData.get('mealsJson') ?? '[]').trim();

        let meals: unknown;
        try {
            meals = JSON.parse(mealsJson || '[]');
        } catch {
            return fail(400, { message: 'Meals JSON is invalid.' });
        }

        const response = await fetch('/api/meal-plan', {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                title,
                startDate,
                endDate,
                meals,
            }),
        });

        if (!response.ok) {
            return fail(response.status, { message: 'Unable to save meal plan.' });
        }

        return { success: true };
    },
};
