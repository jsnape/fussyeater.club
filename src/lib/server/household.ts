import type { DbLike } from './db';

export type HouseholdMembership = {
    householdId: string;
    role: string;
};

export type HouseholdMember = {
    userId: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
};

export async function getMembership(
    db: DbLike,
    userId: string
): Promise<HouseholdMembership | null> {
    const membership = await db
        .prepare(
            `SELECT household_id as householdId, role
 FROM household_memberships
 WHERE user_id = ?1`
        )
        .bind(userId)
        .first<HouseholdMembership>();

    return membership;
}

export async function getOwnerHouseholdId(db: DbLike, userId: string): Promise<string | null> {
    const household = await db
        .prepare(
            `SELECT id
 FROM households
 WHERE owner_user_id = ?1
 LIMIT 1`
        )
        .bind(userId)
        .first<{ id: string }>();

    return household?.id ?? null;
}

export async function requireOwnerHouseholdId(db: DbLike, userId: string): Promise<string> {
    const householdId = await getOwnerHouseholdId(db, userId);
    if (!householdId) {
        throw new Error('FORBIDDEN_NOT_OWNER');
    }

    return householdId;
}

export async function listHouseholdMembers(
    db: DbLike,
    householdId: string
): Promise<HouseholdMember[]> {
    const members = await db
        .prepare(
            `SELECT
                 hm.user_id as userId,
                 u.name as name,
                 u.email as email,
                 hm.role as role,
                 CASE
                     WHEN instr(hm.created_at, 'T') > 0 THEN hm.created_at
                     ELSE strftime('%Y-%m-%dT%H:%M:%SZ', hm.created_at)
                 END as joinedAt
              FROM household_memberships hm
              JOIN users u ON u.id = hm.user_id
              WHERE hm.household_id = ?1
             ORDER BY hm.created_at ASC, hm.user_id ASC`
        )
        .bind(householdId)
        .all<HouseholdMember>();

    return members.results ?? [];
}
