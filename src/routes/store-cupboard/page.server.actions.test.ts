import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

describe('store-cupboard page action', () => {
    it('should return failure when items JSON is invalid', async () => {
        const formData = new FormData();
        formData.set('itemsJson', '{invalid json');

        const request = new Request('http://localhost/store-cupboard', {
            method: 'POST',
            body: formData,
        });

        const fetchMock = vi.fn();

        const result = await actions.default({ request, fetch: fetchMock } as any);

        expect(result).toMatchObject({
            status: 400,
            data: { message: 'Items JSON is invalid.' },
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return success when API update succeeds', async () => {
        const formData = new FormData();
        formData.set('itemsJson', '[]');

        const request = new Request('http://localhost/store-cupboard', {
            method: 'POST',
            body: formData,
        });

        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

        const result = await actions.default({ request, fetch: fetchMock } as any);

        expect(result).toEqual({ success: true });
    });
});
