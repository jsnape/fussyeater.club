import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDb, requireHouseholdId } from '$lib/server/db';

type Household = {
    id: string;
    name: string;
    inviteCode: string;
    createdAt: string;
};

type HouseholdRow = {
    id: string;
    name: string;
    invite_code: string | null;
    created_utc: string;
};

type UpsertHouseholdRequest = {
    name: string;
    inviteCode?: string;
};

function validateUpsertPayload(payload: Partial<UpsertHouseholdRequest>): asserts payload is UpsertHouseholdRequest {
    if (!payload.name || !payload.name.trim()) {
        throw error(400, 'Household name is required.');
    }
}

export async function GET(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);

    const row = await db
        .prepare(
            `SELECT id, name, invite_code, created_utc
             FROM households
             WHERE id = ?`
        )
        .bind(householdId)
        .first<HouseholdRow>();

    if (!row) {
        return new Response(null, { status: 404 });
    }

    const household: Household = {
        id: row.id,
        name: row.name,
        inviteCode: row.invite_code ?? '',
        createdAt: row.created_utc,
    };

    return json(household);
}

export async function PUT(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);
    const payload = (await event.request.json()) as Partial<UpsertHouseholdRequest>;

    validateUpsertPayload(payload);

    const nowUtc = new Date().toISOString();

    await db
        .prepare(
            `INSERT INTO households (id, name, invite_code, created_utc)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                invite_code = excluded.invite_code`
        )
        .bind(
            householdId,
            payload.name,
            payload.inviteCode?.trim() || null,
            nowUtc
        )
        .run();

    return json({
        id: householdId,
        name: payload.name,
        inviteCode: payload.inviteCode?.trim() ?? '',
        createdAt: nowUtc,
    });
}
