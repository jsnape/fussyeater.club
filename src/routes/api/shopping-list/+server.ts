import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDb, requireHouseholdId } from '$lib/server/db';

type ShoppingItem = {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    isChecked: boolean;
};

type ShoppingList = {
    id: string;
    householdId: string;
    mealPlanId: string;
    items: ShoppingItem[];
    createdAt: string;
};

type ShoppingListRow = {
    id: string;
    household_id: string;
    meal_plan_id: string;
    items_json: string;
    created_utc: string;
};

type UpsertShoppingListRequest = {
    mealPlanId: string;
    items: ShoppingItem[];
};

function validateUpsertPayload(payload: Partial<UpsertShoppingListRequest>): asserts payload is UpsertShoppingListRequest {
    if (!payload.mealPlanId || !payload.mealPlanId.trim()) {
        throw error(400, 'Meal plan id is required.');
    }

    if (!Array.isArray(payload.items)) {
        throw error(400, 'Items must be an array.');
    }
}

export async function GET(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);

    const row = await db
        .prepare(
            `SELECT id, household_id, meal_plan_id, items_json, created_utc
             FROM shopping_lists
             WHERE household_id = ?
             ORDER BY created_utc DESC
             LIMIT 1`
        )
        .bind(householdId)
        .first<ShoppingListRow>();

    if (!row) {
        return new Response(null, { status: 404 });
    }

    const shoppingList: ShoppingList = {
        id: row.id,
        householdId: row.household_id,
        mealPlanId: row.meal_plan_id,
        items: JSON.parse(row.items_json),
        createdAt: row.created_utc,
    };

    return json(shoppingList);
}

export async function PUT(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);
    const payload = (await event.request.json()) as Partial<UpsertShoppingListRequest>;

    validateUpsertPayload(payload);

    const existing = await db
        .prepare(
            `SELECT id
             FROM shopping_lists
             WHERE household_id = ?
             ORDER BY created_utc DESC
             LIMIT 1`
        )
        .bind(householdId)
        .first<{ id: string }>();

    const shoppingListId = existing?.id ?? crypto.randomUUID();
    const nowUtc = new Date().toISOString();

    await db
        .prepare(
            `INSERT INTO shopping_lists (id, household_id, meal_plan_id, items_json, created_utc)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                meal_plan_id = excluded.meal_plan_id,
                items_json = excluded.items_json,
                created_utc = excluded.created_utc`
        )
        .bind(
            shoppingListId,
            householdId,
            payload.mealPlanId,
            JSON.stringify(payload.items),
            nowUtc
        )
        .run();

    const shoppingList: ShoppingList = {
        id: shoppingListId,
        householdId,
        mealPlanId: payload.mealPlanId,
        items: payload.items,
        createdAt: nowUtc,
    };

    return json(shoppingList);
}
