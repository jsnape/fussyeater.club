import { describe, expect, it } from 'vitest';
import { POST } from './+server';
import { createTestDbPair } from '$lib/server/test-db';

describe('POST /api/invites/redeem', () => {
	it('should return 404 when invite code is not found', async () => {
		const { first } = createTestDbPair();

		const response = await POST({
			request: new Request('http://localhost/api/invites/redeem', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ code: 'UNKNOWN1' })
			}),
			platform: {
				env: { DB: first, AUTH_REGISTRATION_V2_ENABLED: 'true' }
			}
		} as never);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({ message: 'Invite not found' });
	});
});
