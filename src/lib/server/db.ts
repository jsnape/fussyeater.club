import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireDb(event: RequestEvent): D1Database {
    const db = event.platform?.env.DB;

    if (!db) {
        throw error(500, 'D1 database binding DB is not configured.');
    }

    return db;
}

export function requireHouseholdId(event: RequestEvent): string {
    const requireAccessAuth = event.platform?.env.REQUIRE_ACCESS_AUTH === 'true';
    const accessUserEmail = event.locals.accessUserEmail;

    if (requireAccessAuth && !accessUserEmail) {
        throw error(401, 'Cloudflare Access authentication is required.');
    }

    const householdId =
        event.locals.householdId
        ?? (!requireAccessAuth ? event.platform?.env.DEFAULT_HOUSEHOLD_ID : null)
        ?? null;

    if (!householdId) {
        if (requireAccessAuth) {
            throw error(403, 'No household membership found for authenticated user.');
        }

        throw error(400, 'Missing household context.');
    }

    return householdId;
}
