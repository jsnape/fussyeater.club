import { json } from '@sveltejs/kit';
import type { DbLike } from './db';

type IdempotencyRecord = {
	result_status: number;
	result_body: string;
};

export async function getIdempotentResponse(
	db: DbLike,
	endpoint: string,
	idempotencyKey: string,
	userScope: string
): Promise<Response | null> {
	const existing = await db
		.prepare(
			`SELECT result_status, result_body
 FROM idempotency_keys
 WHERE idempotency_key = ?1 AND endpoint = ?2 AND user_id = ?3`
		)
		.bind(idempotencyKey, endpoint, userScope)
		.first<IdempotencyRecord>();

	if (!existing) {
		return null;
	}

	return json(JSON.parse(existing.result_body), { status: existing.result_status });
}

export async function saveIdempotentResponse(
	db: DbLike,
	endpoint: string,
	idempotencyKey: string,
	userScope: string,
	status: number,
	body: unknown
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO idempotency_keys (idempotency_key, endpoint, user_id, result_status, result_body)
 VALUES (?1, ?2, ?3, ?4, ?5)
 ON CONFLICT(idempotency_key, endpoint, user_id)
 DO UPDATE SET result_status = excluded.result_status, result_body = excluded.result_body`
		)
		.bind(idempotencyKey, endpoint, userScope, status, JSON.stringify(body))
		.run();
}

export function badRequest(message: string): Response {
	return json({ message }, { status: 400 });
}

export function serviceUnavailableResponse(): Response {
	return json({ message: 'Service temporarily unavailable' }, { status: 503 });
}

export function createJsonResponse(body: unknown, init: ResponseInit): Response {
	return json(body, init);
}
