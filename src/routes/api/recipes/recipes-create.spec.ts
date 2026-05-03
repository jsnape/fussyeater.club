import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from '$lib/server/test-db';
import { POST } from './+server';

describe('POST /api/recipes', () => {
	const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

	afterEach(() => {
		for (const pair of pairs.splice(0)) {
			pair.cleanup();
		}
	});

	async function seedUser(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
		await pair.first
			.prepare("INSERT INTO users (id, email, name) VALUES ('user-1', 'user@example.com', 'User')")
			.run();
		await pair.first
			.prepare("INSERT INTO households (id, owner_user_id, name) VALUES ('house-1', 'user-1', 'Family')")
			.run();
		await pair.first
			.prepare("INSERT INTO household_memberships (user_id, household_id, role) VALUES ('user-1', 'house-1', 'owner')")
			.run();
		await pair.first
			.prepare("INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-1', 'user-1', datetime('now', '+7 day'))")
			.run();
	}

	async function seedUserNoHousehold(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
		await pair.first
			.prepare("INSERT INTO users (id, email, name) VALUES ('user-2', 'user2@example.com', 'User2')")
			.run();
		await pair.first
			.prepare("INSERT INTO user_sessions (id, user_id, expires_at) VALUES ('sess-2', 'user-2', datetime('now', '+7 day'))")
			.run();
	}

	function makeEvent(
		db: ReturnType<typeof createTestDbPair>['first'],
		body: Record<string, unknown>,
		headers: Record<string, string> = {}
	) {
		const url = new URL('http://localhost/api/recipes');
		const { cookie: extraCookie, ...otherHeaders } = headers;
		const cookieParts = ['csrf-token=test-csrf'];
		if (extraCookie) cookieParts.push(extraCookie);

		return {
			request: new Request(url.toString(), {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-csrf-token': 'test-csrf',
					cookie: cookieParts.join('; '),
					...otherHeaders
				},
				body: JSON.stringify(body)
			}),
			platform: { env: { DB: db } },
			url,
			params: {}
		} as never;
	}

	const validFullRecipe = {
		title: 'Spaghetti Carbonara',
		type: 'full',
		visibility: 'public',
		ingredients: [{ amount: 400, unit: 'g', ingredient: 'spaghetti' }],
		method: ['Cook spaghetti.', 'Serve.'],
		tags: ['italian']
	};

	it('should create a full recipe and return 201', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const response = await POST(makeEvent(pair.first, validFullRecipe, { cookie: 'session=sess-1' }));
		const body = await response.json() as Record<string, unknown>;

		expect(response.status).toBe(201);
		expect(body.id).toBe('spaghetti-carbonara');
		expect(body.title).toBe('Spaghetti Carbonara');
		expect(body.type).toBe('full');
		expect(body.method).toEqual(['Cook spaghetti.', 'Serve.']);
	});

	it('should create a reference recipe and return 201', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const body = {
			title: 'Book Recipe',
			type: 'reference',
			visibility: 'public',
			ingredients: [{ ingredient: 'flour' }],
			sourceReference: { kind: 'book', label: 'My Cookbook', pageNumber: 42 }
		};

		const response = await POST(makeEvent(pair.first, body, { cookie: 'session=sess-1' }));
		const result = await response.json() as Record<string, unknown>;

		expect(response.status).toBe(201);
		expect(result.id).toBe('book-recipe');
		expect(result.type).toBe('reference');
		expect(result.sourceReference).toMatchObject({ kind: 'book', label: 'My Cookbook' });
		expect(result.method).toBeUndefined();
	});

	it('should return 401 for unauthenticated requests', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);

		const response = await POST(makeEvent(pair.first, validFullRecipe));
		expect(response.status).toBe(401);
	});

	it('should return 403 when CSRF token is missing', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);

		const url = new URL('http://localhost/api/recipes');
		const event = {
			request: new Request(url.toString(), {
				method: 'POST',
				headers: { 'content-type': 'application/json', cookie: 'session=sess-1' },
				body: JSON.stringify(validFullRecipe)
			}),
			platform: { env: { DB: pair.first } },
			url,
			params: {}
		} as never;

		const response = await POST(event);
		expect(response.status).toBe(403);
		const result = await response.json();
		expect(result.message).toBe('CSRF verification failed');
	});

	it('should return 400 when title is missing', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const response = await POST(
			makeEvent(pair.first, { ...validFullRecipe, title: '' }, { cookie: 'session=sess-1' })
		);
		const body = await response.json() as { errors: Array<{ field: string }> };

		expect(response.status).toBe(400);
		expect(body.errors.some((e) => e.field === 'title')).toBe(true);
	});

	it('should return 400 when ingredients are empty', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const response = await POST(
			makeEvent(pair.first, { ...validFullRecipe, ingredients: [] }, { cookie: 'session=sess-1' })
		);

		expect(response.status).toBe(400);
	});

	it('should return 400 when full recipe has no method', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const response = await POST(
			makeEvent(pair.first, { ...validFullRecipe, method: [] }, { cookie: 'session=sess-1' })
		);

		expect(response.status).toBe(400);
	});

	it('should return 400 when reference recipe has method steps', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const body = {
			title: 'Bad Ref',
			type: 'reference',
			ingredients: [{ ingredient: 'flour' }],
			method: ['Step 1'],
			sourceReference: { kind: 'book', label: 'Book' }
		};

		const response = await POST(makeEvent(pair.first, body, { cookie: 'session=sess-1' }));
		expect(response.status).toBe(400);
	});

	it('should return 400 when reference recipe has no source reference', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const body = {
			title: 'No Source Ref',
			type: 'reference',
			ingredients: [{ ingredient: 'flour' }]
		};

		const response = await POST(makeEvent(pair.first, body, { cookie: 'session=sess-1' }));
		expect(response.status).toBe(400);
	});

	it('should return 403 when creating private recipe without household', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUserNoHousehold(pair);

		const response = await POST(
			makeEvent(
				pair.first,
				{ ...validFullRecipe, visibility: 'private' },
				{ cookie: 'session=sess-2' }
			)
		);

		expect(response.status).toBe(403);
	});

	it('should allow public recipe without household membership', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUserNoHousehold(pair);

		const response = await POST(
			makeEvent(
				pair.first,
				{ ...validFullRecipe, visibility: 'public' },
				{ cookie: 'session=sess-2' }
			)
		);

		expect(response.status).toBe(201);
	});

	it('should default visibility to private', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const { visibility: _, ...noVisibility } = validFullRecipe;
		const response = await POST(makeEvent(pair.first, noVisibility, { cookie: 'session=sess-1' }));
		const body = await response.json() as Record<string, unknown>;

		expect(response.status).toBe(201);
		expect(body.visibility).toBe('private');
	});

	it('should handle slug collision gracefully', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const first = await POST(makeEvent(pair.first, validFullRecipe, { cookie: 'session=sess-1' }));
		expect(first.status).toBe(201);

		const second = await POST(makeEvent(pair.first, validFullRecipe, { cookie: 'session=sess-1' }));
		const body = await second.json() as Record<string, unknown>;

		expect(second.status).toBe(201);
		expect(body.id).toBe('spaghetti-carbonara-2');
	});

	it('should return 400 for invalid imageUrl', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const response = await POST(
			makeEvent(
				pair.first,
				{ ...validFullRecipe, imageUrl: 'not-a-url' },
				{ cookie: 'session=sess-1' }
			)
		);

		expect(response.status).toBe(400);
	});

	it('should trim and deduplicate tags', async () => {
		const pair = createTestDbPair();
		pairs.push(pair);
		await seedUser(pair);

		const response = await POST(
			makeEvent(
				pair.first,
				{ ...validFullRecipe, tags: ['Italian', 'ITALIAN', ' quick '] },
				{ cookie: 'session=sess-1' }
			)
		);
		const body = await response.json() as Record<string, unknown>;

		expect(response.status).toBe(201);
		expect(body.tags).toEqual(['italian', 'quick']);
	});
});
