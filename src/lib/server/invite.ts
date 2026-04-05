import {
    addDaysIso,
    addMinutesIso,
    createInviteCode,
    createOpaqueToken,
    maskInviteCode,
    nowIso,
    type DbLike
} from './db';

export type InviteRedeemResult = {
    joinIntentToken: string;
    household: {
        id: string;
        name: string;
    };
    remainingUses: number;
    expiresAt: string;
};

export type InviteCreateResult = {
    id: string;
    code: string;
    maxUses: number;
    remainingUses: number;
    expiresAt: string;
};

export type InviteListItem = {
    id: string;
    codeMasked: string;
    maxUses: number;
    remainingUses: number;
    expiresAt: string;
    status: 'active' | 'expired' | 'exhausted' | 'revoked';
};

type InviteRow = {
    id: string;
    household_id: string;
    code: string;
    status: string;
    expires_at: string;
    max_uses: number;
    remaining_uses: number;
    revoked_at: string | null;
    household_name: string;
};

function resolveInviteStatus(
    invite: Pick<InviteRow, 'status' | 'expires_at' | 'remaining_uses' | 'revoked_at'>
): InviteListItem['status'] {
    if (invite.revoked_at || invite.status === 'revoked') {
        return 'revoked';
    }

    if (invite.remaining_uses <= 0 || invite.status === 'exhausted') {
        return 'exhausted';
    }

    if (new Date(invite.expires_at).getTime() <= Date.now() || invite.status === 'expired') {
        return 'expired';
    }

    return 'active';
}

export async function redeemInviteCode(
    db: DbLike,
    code: string,
    userId: string | null
): Promise<InviteRedeemResult> {
    const normalizedCode = code.trim().toUpperCase();
    const invite = await db
        .prepare(
            `SELECT i.id, i.household_id, i.code, i.status, i.expires_at, i.max_uses, i.remaining_uses, i.revoked_at,
h.name as household_name
 FROM household_invites i
 JOIN households h ON h.id = i.household_id
 WHERE i.code = ?1`
        )
        .bind(normalizedCode)
        .first<InviteRow>();

    if (!invite) {
        throw new Error('INVITE_NOT_FOUND');
    }

    const status = resolveInviteStatus(invite);
    if (status === 'expired' || status === 'exhausted' || status === 'revoked') {
        await db
            .prepare('UPDATE household_invites SET status = ?1, updated_at = ?2 WHERE id = ?3')
            .bind(status, nowIso(), invite.id)
            .run();
        throw new Error('INVITE_NOT_JOINABLE');
    }

    if (userId) {
        const membership = await db
            .prepare('SELECT household_id FROM household_memberships WHERE user_id = ?1')
            .bind(userId)
            .first<{ household_id: string }>();
        if (membership) {
            throw new Error('ALREADY_IN_HOUSEHOLD');
        }
    }

    const joinIntentToken = createOpaqueToken();
    await db
        .prepare(
            `INSERT INTO join_intents (token, invite_id, household_id, issued_for_user_id, expires_at)
 VALUES (?1, ?2, ?3, ?4, ?5)`
        )
        .bind(joinIntentToken, invite.id, invite.household_id, userId, addMinutesIso(30))
        .run();

    return {
        joinIntentToken,
        household: {
            id: invite.household_id,
            name: invite.household_name
        },
        remainingUses: invite.remaining_uses,
        expiresAt: invite.expires_at
    };
}

export async function createHouseholdInvite(
    db: DbLike,
    householdId: string,
    createdByUserId: string,
    maxUses: number,
    expiresInDays: number,
    regenerate: boolean
): Promise<InviteCreateResult> {
    if (maxUses < 1 || expiresInDays < 1) {
        throw new Error('INVALID_INVITE_INPUT');
    }

    if (regenerate) {
        await db
            .prepare(
                `UPDATE household_invites
 SET status = 'revoked', revoked_at = ?1, updated_at = ?1
 WHERE household_id = ?2 AND revoked_at IS NULL AND status = 'active'`
            )
            .bind(nowIso(), householdId)
            .run();
    }

    let code = createInviteCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const existing = await db
            .prepare('SELECT id FROM household_invites WHERE code = ?1')
            .bind(code)
            .first<{ id: string }>();
        if (!existing) {
            break;
        }
        code = createInviteCode();
    }

    const stillExisting = await db
        .prepare('SELECT id FROM household_invites WHERE code = ?1')
        .bind(code)
        .first<{ id: string }>();
    if (stillExisting) {
        throw new Error('INVITE_CODE_GENERATION_FAILED');
    }

    const inviteId = crypto.randomUUID();
    const expiresAt = addDaysIso(expiresInDays);
    await db
        .prepare(
            `INSERT INTO household_invites (
id, household_id, code, status, expires_at, max_uses, remaining_uses, created_by_user_id
 ) VALUES (?1, ?2, ?3, 'active', ?4, ?5, ?5, ?6)`
        )
        .bind(inviteId, householdId, code, expiresAt, maxUses, createdByUserId)
        .run();

    return {
        id: inviteId,
        code,
        maxUses,
        remainingUses: maxUses,
        expiresAt
    };
}

export async function listHouseholdInvites(
    db: DbLike,
    householdId: string
): Promise<InviteListItem[]> {
    const invites = await db
        .prepare(
            `SELECT id, code, status, expires_at, max_uses, remaining_uses, revoked_at
 FROM household_invites
 WHERE household_id = ?1
 ORDER BY created_at DESC`
        )
        .bind(householdId)
        .all<InviteRow>();

    return (invites.results ?? []).map((invite) => {
        const status = resolveInviteStatus(invite);
        return {
            id: invite.id,
            codeMasked: maskInviteCode(invite.code),
            maxUses: invite.max_uses,
            remainingUses: invite.remaining_uses,
            expiresAt: invite.expires_at,
            status
        };
    });
}

export async function revokeHouseholdInvite(
    db: DbLike,
    householdId: string,
    inviteId: string
): Promise<boolean> {
    const invite = await db
        .prepare('SELECT id FROM household_invites WHERE id = ?1 AND household_id = ?2')
        .bind(inviteId, householdId)
        .first<{ id: string }>();

    if (!invite) {
        return false;
    }

    await db
        .prepare(
            `UPDATE household_invites
 SET status = 'revoked', revoked_at = ?1, updated_at = ?1
 WHERE id = ?2`
        )
        .bind(nowIso(), inviteId)
        .run();

    return true;
}
