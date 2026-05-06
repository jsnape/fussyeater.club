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
    code?: string;
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

const MAX_INVITE_CODE_GENERATION_ATTEMPTS = 5;
const MAX_ACTIVE_INVITES_IN_LIST = 1;
const MAX_HISTORICAL_INVITES_IN_LIST = 20;
const UNIQUE_INVITE_CODE_CONSTRAINT_PATTERN = /unique.*household_invites\.code/i;
const UNIQUE_ACTIVE_INVITE_CONSTRAINT_PATTERN = /idx_household_invites_single_active/i;

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
    expiresInDays: number
): Promise<InviteCreateResult> {
    if (maxUses < 1 || expiresInDays < 1) {
        throw new Error('INVALID_INVITE_INPUT');
    }

    const expiresAt = addDaysIso(expiresInDays);
    const activeInvite = await db
        .prepare(
            `SELECT id
 FROM household_invites
 WHERE household_id = ?1 AND revoked_at IS NULL AND status = 'active'
 ORDER BY updated_at DESC, id DESC
 LIMIT 1`
        )
        .bind(householdId)
        .first<{ id: string }>();

    if (activeInvite) {
        const mutationTimestamp = nowIso();
        await db
            .prepare(
                `UPDATE household_invites
 SET status = 'revoked', revoked_at = ?1, updated_at = ?1
 WHERE id = ?2 AND revoked_at IS NULL AND status = 'active'`
            )
            .bind(mutationTimestamp, activeInvite.id)
            .run();
    }

    for (
        let insertAttempt = 0;
        insertAttempt < MAX_INVITE_CODE_GENERATION_ATTEMPTS;
        insertAttempt += 1
    ) {
        const inviteId = crypto.randomUUID();
        const code = createInviteCode();
        try {
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
        } catch (error) {
            if (
                error instanceof Error &&
                UNIQUE_INVITE_CODE_CONSTRAINT_PATTERN.test(error.message)
            ) {
                continue;
            }
            if (
                error instanceof Error &&
                UNIQUE_ACTIVE_INVITE_CONSTRAINT_PATTERN.test(error.message)
            ) {
                throw new Error('ACTIVE_INVITE_CONFLICT', { cause: error });
            }
            throw error;
        }
    }

    throw new Error('INVITE_CODE_GENERATION_FAILED');
}

export async function listHouseholdInvites(
    db: DbLike,
    householdId: string
): Promise<InviteListItem[]> {
    // Returns a bounded list for MVP: latest active invite (if any) plus up to
    // MAX_HISTORICAL_INVITES_IN_LIST most recently updated non-active invites.
    const invites = await db
        .prepare(
            `SELECT id, code, status, expires_at, max_uses, remaining_uses, revoked_at, updated_at
  FROM household_invites
  WHERE household_id = ?1
  -- latest updates first so the bounded list keeps the most recently modified invites
  ORDER BY updated_at DESC, id DESC`
        )
        .bind(householdId)
        .all<InviteRow & { updated_at: string }>();

    const mapped = (invites.results ?? []).map((invite) => {
        const resolvedStatus = resolveInviteStatus(invite);
        return {
            id: invite.id,
            codeMasked: maskInviteCode(invite.code),
            code: resolvedStatus === 'active' ? invite.code : undefined,
            maxUses: invite.max_uses,
            remainingUses: invite.remaining_uses,
            expiresAt: invite.expires_at,
            status: resolvedStatus
        } satisfies InviteListItem;
    });

    // MVP bounded list: at most one active invite + the 20 most recently updated historical invites.
    const active = mapped
        .filter((invite) => invite.status === 'active')
        .slice(0, MAX_ACTIVE_INVITES_IN_LIST);
    const historical = mapped
        .filter((invite) => invite.status !== 'active')
        .slice(0, MAX_HISTORICAL_INVITES_IN_LIST);
    return [...active, ...historical];
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
