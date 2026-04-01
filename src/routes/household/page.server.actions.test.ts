import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

describe('household page action', () => {
    it('should return success when API update succeeds', async () => {
        const formData = new FormData();
        formData.set('name', 'Family Home');
        formData.set('inviteCode', 'JOIN123');

        const request = new Request('http://localhost/household', {
            method: 'POST',
            body: formData,
        });

        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

        const result = await actions.default({ request, fetch: fetchMock } as any);

        expect(result).toEqual({ success: true });
        expect(fetchMock).toHaveBeenCalledWith('/api/household', expect.objectContaining({ method: 'PUT' }));
    });

    it('should return action failure when API update fails', async () => {
        const formData = new FormData();
        formData.set('name', 'Family Home');
        formData.set('inviteCode', 'JOIN123');

        const request = new Request('http://localhost/household', {
            method: 'POST',
            body: formData,
        });

        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));

        const result = await actions.default({ request, fetch: fetchMock } as any);

        expect(result).toMatchObject({
            status: 500,
            data: { message: 'Unable to save household.' },
        });
    });
});
