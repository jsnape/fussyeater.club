import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('register page load', () => {
    it('should prefill invite code from query param', async () => {
        const data = (await load({
            url: new URL('http://localhost/register?invite=abc123'),
            fetch: async () => new Response(JSON.stringify({ user: null }), { status: 200 })
        } as never)) as {
            inviteCode: string;
            socialContinuation: boolean;
            socialEmail: string;
        };

        expect(data.inviteCode).toBe('ABC123');
        expect(data.socialContinuation).toBe(false);
        expect(data.socialEmail).toBe('');
    });

    it('should enable social continuation for microsoft sessions', async () => {
        const data = (await load({
            url: new URL('http://localhost/register'),
            fetch: async () =>
                new Response(
                    JSON.stringify({
                        user: { email: 'social@example.com', authProvider: 'microsoft' }
                    }),
                    { status: 200 }
                )
        } as never)) as {
            socialContinuation: boolean;
            socialEmail: string;
        };

        expect(data.socialContinuation).toBe(true);
        expect(data.socialEmail).toBe('social@example.com');
    });

    it('should fallback to standard flow when session probe fails', async () => {
        const data = (await load({
            url: new URL('http://localhost/register'),
            fetch: async () => {
                throw new Error('network failure');
            }
        } as never)) as {
            socialContinuation: boolean;
            socialEmail: string;
        };

        expect(data.socialContinuation).toBe(false);
        expect(data.socialEmail).toBe('');
    });
});
