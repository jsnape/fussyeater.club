import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDb, requireHouseholdId } from '$lib/server/db';

type MealSlot = {
    date: string;
    mealType: string;
    recipeId: string;
    servings: number;
};

type MealPlan = {
    id: string;
    householdId: string;
    title: string;
    startDate: string;
    endDate: string;
    meals: MealSlot[];
    createdAt: string;
};

type MealPlanRow = {
    id: string;
    household_id: string;
    title: string;
    start_date: string;
    end_date: string;
    meals_json: string;
    created_utc: string;
};

type UpsertMealPlanRequest = {
    title: string;
    startDate: string;
    endDate: string;
    meals: MealSlot[];
};

function validateUpsertPayload(payload: Partial<UpsertMealPlanRequest>): asserts payload is UpsertMealPlanRequest {
    if (!payload.title || !payload.title.trim()) {
        throw error(400, 'Title is required.');
    }

    if (!payload.startDate || !payload.endDate) {
        throw error(400, 'Start and end dates are required.');
    }

    if (!Array.isArray(payload.meals)) {
        throw error(400, 'Meals must be an array.');
    }
}

export async function GET(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);

    const row = await db
        .prepare(
            `SELECT id, household_id, title, start_date, end_date, meals_json, created_utc
             FROM meal_plans
             WHERE household_id = ?
             ORDER BY created_utc DESC
             LIMIT 1`
        )
        .bind(householdId)
        .first<MealPlanRow>();

    if (!row) {
        return new Response(null, { status: 404 });
    }

    const mealPlan: MealPlan = {
        id: row.id,
        householdId: row.household_id,
        title: row.title,
        startDate: row.start_date,
        endDate: row.end_date,
        meals: JSON.parse(row.meals_json),
        createdAt: row.created_utc,
    };

    return json(mealPlan);
}

export async function PUT(event: RequestEvent) {
    const db = requireDb(event);
    const householdId = requireHouseholdId(event);
    const payload = (await event.request.json()) as Partial<UpsertMealPlanRequest>;

    validateUpsertPayload(payload);

    const existing = await db
        .prepare(
            `SELECT id
             FROM meal_plans
             WHERE household_id = ?
             ORDER BY created_utc DESC
             LIMIT 1`
        )
        .bind(householdId)
        .first<{ id: string }>();

    const mealPlanId = existing?.id ?? crypto.randomUUID();
    const nowUtc = new Date().toISOString();

    await db
        .prepare(
            `INSERT INTO meal_plans (id, household_id, title, start_date, end_date, meals_json, created_utc)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                start_date = excluded.start_date,
                end_date = excluded.end_date,
                meals_json = excluded.meals_json`
        )
        .bind(
            mealPlanId,
            householdId,
            payload.title,
            payload.startDate,
            payload.endDate,
            JSON.stringify(payload.meals),
            nowUtc
        )
        .run();

    const mealPlan: MealPlan = {
        id: mealPlanId,
        householdId,
        title: payload.title,
        startDate: payload.startDate,
        endDate: payload.endDate,
        meals: payload.meals,
        createdAt: nowUtc,
    };

    return json(mealPlan);
}
