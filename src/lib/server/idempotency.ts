import { json } from '@sveltejs/kit';
import type { DbLike } from './db';

type IdempotencyRecord = {
    result_status: number;
    result_body: string;
};
const PENDING_RESULT_STATUS = 0;

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
    if (existing.result_status === PENDING_RESULT_STATUS) {
        return null;
    }

    try {
        return json(JSON.parse(existing.result_body), { status: existing.result_status });
    } catch {
        return null;
    }
}

export async function reserveIdempotencyKey(
    db: DbLike,
    endpoint: string,
    idempotencyKey: string,
    userScope: string
): Promise<boolean> {
    const result = await db
        .prepare(
            `INSERT INTO idempotency_keys (idempotency_key, endpoint, user_id, result_status, result_body)
 VALUES (?1, ?2, ?3, ?4, ?5)
 ON CONFLICT(idempotency_key, endpoint, user_id)
 DO NOTHING`
        )
        .bind(idempotencyKey, endpoint, userScope, PENDING_RESULT_STATUS, '{}')
        .run();

    return (result.meta?.changes ?? 0) === 1;
}

export async function hasPendingIdempotencyKey(
    db: DbLike,
    endpoint: string,
    idempotencyKey: string,
    userScope: string
): Promise<boolean> {
    const existing = await db
        .prepare(
            `SELECT result_status
 FROM idempotency_keys
 WHERE idempotency_key = ?1 AND endpoint = ?2 AND user_id = ?3`
        )
        .bind(idempotencyKey, endpoint, userScope)
        .first<{ result_status: number }>();

    return existing?.result_status === PENDING_RESULT_STATUS;
}

export async function finalizeIdempotentResponse(
    db: DbLike,
    endpoint: string,
    idempotencyKey: string,
    userScope: string,
    status: number,
    body: unknown
): Promise<boolean> {
    const result = await db
        .prepare(
            `UPDATE idempotency_keys
 SET result_status = ?4, result_body = ?5
 WHERE idempotency_key = ?1 AND endpoint = ?2 AND user_id = ?3 AND result_status = ?6`
        )
        .bind(idempotencyKey, endpoint, userScope, status, JSON.stringify(body), PENDING_RESULT_STATUS)
        .run();

    return (result.meta?.changes ?? 0) === 1;
}

export async function releasePendingIdempotencyKey(
    db: DbLike,
    endpoint: string,
    idempotencyKey: string,
    userScope: string
): Promise<void> {
    await db
        .prepare(
            `DELETE FROM idempotency_keys
 WHERE idempotency_key = ?1 AND endpoint = ?2 AND user_id = ?3 AND result_status = ?4`
        )
        .bind(idempotencyKey, endpoint, userScope, PENDING_RESULT_STATUS)
        .run();
}

export async function saveIdempotentResponse(
    db: DbLike,
    endpoint: string,
    idempotencyKey: string,
    userScope: string,
    status: number,
    body: unknown
): Promise<boolean> {
    const result = await db
        .prepare(
            `INSERT INTO idempotency_keys (idempotency_key, endpoint, user_id, result_status, result_body)
 VALUES (?1, ?2, ?3, ?4, ?5)
 ON CONFLICT(idempotency_key, endpoint, user_id)
 DO NOTHING`
        )
        .bind(idempotencyKey, endpoint, userScope, status, JSON.stringify(body))
        .run();

    return (result.meta?.changes ?? 0) === 1;
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
