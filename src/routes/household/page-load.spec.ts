import { describe, expect, it, vi } from 'vitest';
import { load } from './+page';

describe('/household page load', () => {
    it('should return members and invites on success', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        members: [
                            {
                                userId: 'owner-1',
                                name: 'Owner',
                                email: 'owner@example.com',
                                role: 'owner',
                                joinedAt: '2026-01-01T00:00:00.000Z'
                            }
                        ]
                    }),
                    { status: 200, headers: { 'content-type': 'application/json' } }
                )
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        invites: [
                            {
                                id: 'inv-1',
                                codeMasked: 'ABC…FGH',
                                maxUses: 3,
                                remainingUses: 2,
                                expiresAt: '2026-01-10T00:00:00.000Z',
                                status: 'active'
                            }
                        ]
                    }),
                    { status: 200, headers: { 'content-type': 'application/json' } }
                )
            );

        const result = (await load({ fetch: fetchMock } as never)) as {
            members: unknown[];
            invites: unknown[];
            loadError: string | null;
        };

        expect(result.loadError).toBeNull();
        expect(result.members).toHaveLength(1);
        expect(result.invites).toHaveLength(1);
    });

    it('should reject non-owner members before loading invites', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ message: 'Forbidden' }), {
                status: 403,
                headers: { 'content-type': 'application/json' }
            })
        );

        await expect(load({ fetch: fetchMock } as never)).rejects.toMatchObject({ status: 403 });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should map non-forbidden api errors to user-friendly load error message', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ message: 'Busy' }), {
                status: 429,
                headers: { 'content-type': 'application/json' }
            })
        );

        const result = (await load({ fetch: fetchMock } as never)) as {
            members: unknown[];
            invites: unknown[];
            loadError: string | null;
        };

        expect(result.members).toEqual([]);
        expect(result.invites).toEqual([]);
        expect(result.loadError).toBe('Too many requests right now. Please try again in a moment.');
    });

    it('should map unknown failures to generic load error message', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('network'));

        const result = (await load({ fetch: fetchMock } as never)) as {
            members: unknown[];
            invites: unknown[];
            loadError: string | null;
        };

        expect(result.members).toEqual([]);
        expect(result.invites).toEqual([]);
        expect(result.loadError).toBe('Unable to load household details right now.');
    });
});
