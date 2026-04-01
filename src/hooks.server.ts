import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const requireAccessAuth = event.platform?.env.REQUIRE_ACCESS_AUTH === 'true';
    const defaultHouseholdId = event.platform?.env.DEFAULT_HOUSEHOLD_ID ?? null;
    const headerHouseholdId = event.request.headers.get('x-household-id');

    event.locals.accessUserEmail =
        event.request.headers.get('cf-access-authenticated-user-email');

    let resolvedHouseholdId: string | null = null;

    if (event.locals.accessUserEmail && event.platform?.env.DB) {
        const membership = await event.platform.env.DB
            .prepare(
                `SELECT household_id
                 FROM household_members
                 WHERE user_email = ?
                 ORDER BY is_primary DESC, created_utc ASC
                 LIMIT 1`
            )
            .bind(event.locals.accessUserEmail)
            .first<{ household_id: string }>();

        resolvedHouseholdId = membership?.household_id ?? null;
    }

    event.locals.householdId = resolvedHouseholdId
        ?? (!requireAccessAuth ? headerHouseholdId : null)
        ?? (!requireAccessAuth ? defaultHouseholdId : null)
        ?? null;

    return resolve(event);
};
