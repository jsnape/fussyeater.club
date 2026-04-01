import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const name = String(formData.get('name') ?? '').trim();
        const inviteCode = String(formData.get('inviteCode') ?? '').trim();

        const response = await fetch('/api/household', {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                name,
                inviteCode,
            }),
        });

        if (!response.ok) {
            return fail(response.status, { message: 'Unable to save household.' });
        }

        return { success: true };
    },
};
