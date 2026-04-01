import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDb, requireHouseholdId } from '$lib/server/db';

type StoreCupboardItem = {
    name: string;
    category: string;
    alwaysStocked: boolean;
};

type StoreCupboard = {
    id: string;
    householdId: string;
    items: StoreCupboardItem[];
    updatedAt: string;
};

type StoreCupboardRow = {
    id: string;
    household_id: string;
    items_json: string;
    updated_utc: string;
};

type UpsertStoreCupboardRequest = {
    items: StoreCupboardItem[];
};

function validateUpsertPayload(payload: Partial<UpsertStoreCupboardRequest>): asserts payload is UpsertStoreCupboardRequest {
    if (!Array.isArray(payload.items)) {
        throw error(400, 'Items must be an array.');
    }
}

export async function GET(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);

    const row = await db
        .prepare(
            `SELECT id, household_id, items_json, updated_utc
             FROM store_cupboards
             WHERE household_id = ?
             ORDER BY updated_utc DESC
             LIMIT 1`
        )
        .bind(householdId)
        .first<StoreCupboardRow>();

    if (!row) {
        return new Response(null, { status: 404 });
    }

    const storeCupboard: StoreCupboard = {
        id: row.id,
        householdId: row.household_id,
        items: JSON.parse(row.items_json),
        updatedAt: row.updated_utc,
    };

    return json(storeCupboard);
}

export async function PUT(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);
    const payload = (await event.request.json()) as Partial<UpsertStoreCupboardRequest>;

    validateUpsertPayload(payload);

    const existing = await db
        .prepare(
            `SELECT id
             FROM store_cupboards
             WHERE household_id = ?
             ORDER BY updated_utc DESC
             LIMIT 1`
        )
        .bind(householdId)
        .first<{ id: string }>();

    const storeCupboardId = existing?.id ?? crypto.randomUUID();
    const nowUtc = new Date().toISOString();

    await db
        .prepare(
            `INSERT INTO store_cupboards (id, household_id, items_json, updated_utc)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                items_json = excluded.items_json,
                updated_utc = excluded.updated_utc`
        )
        .bind(storeCupboardId, householdId, JSON.stringify(payload.items), nowUtc)
        .run();

    const storeCupboard: StoreCupboard = {
        id: storeCupboardId,
        householdId,
        items: payload.items,
        updatedAt: nowUtc,
    };

    return json(storeCupboard);
}
