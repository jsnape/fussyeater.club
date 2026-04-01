import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

describe('meal-plan page action', () => {
    it('should return failure when meals JSON is invalid', async () => {
        const formData = new FormData();
        formData.set('title', 'Week Plan');
        formData.set('startDate', '2026-01-01');
        formData.set('endDate', '2026-01-07');
        formData.set('mealsJson', '{invalid json');

        const request = new Request('http://localhost/meal-plan', {
            method: 'POST',
            body: formData,
        });

        const fetchMock = vi.fn();

        const result = await actions.default({ request, fetch: fetchMock } as any);

        expect(result).toMatchObject({
            status: 400,
            data: { message: 'Meals JSON is invalid.' },
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return success when API update succeeds', async () => {
        const formData = new FormData();
        formData.set('title', 'Week Plan');
        formData.set('startDate', '2026-01-01');
        formData.set('endDate', '2026-01-07');
        formData.set('mealsJson', '[]');

        const request = new Request('http://localhost/meal-plan', {
            method: 'POST',
            body: formData,
        });

        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

        const result = await actions.default({ request, fetch: fetchMock } as any);

        expect(result).toEqual({ success: true });
    });
});
