export type DbRunResult = {
    success: boolean;
    meta?: {
        changes?: number;
    };
};

export type DbResult<T = Record<string, unknown>> = {
    success: boolean;
    results?: T[];
    meta?: {
        changes?: number;
    };
};

export type DbPrepared = {
    bind: (...values: unknown[]) => DbPrepared;
    run: <T = Record<string, unknown>>() => Promise<DbResult<T>>;
    all: <T = Record<string, unknown>>() => Promise<DbResult<T>>;
    first: <T = Record<string, unknown>>() => Promise<T | null>;
};

export type DbLike = {
    prepare: (query: string) => DbPrepared;
    exec: (query: string) => Promise<DbRunResult>;
};

// Cloudflare Workers WebCrypto currently rejects PBKDF2 iteration counts above 100000.
const PBKDF2_ITERATIONS = 100_000;

export function requireDb(platform?: App.Platform): DbLike {
    const db = platform?.env?.DB as unknown as DbLike | undefined;
    if (!db) {
        throw new Error('Database binding is not configured');
    }

    return db;
}

export function nowIso(): string {
    return new Date().toISOString();
}

export function addMinutesIso(minutes: number): string {
    return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function addDaysIso(days: number): string {
    return new Date(Date.now() + days * 24 * 60 * 60_000).toISOString();
}

export function createOpaqueToken(): string {
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

const INVITE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function createInviteCode(length = 8): string {
    let code = '';
    for (let index = 0; index < length; index += 1) {
        const charIndex = crypto.getRandomValues(new Uint32Array(1))[0] % INVITE_ALPHABET.length;
        code += INVITE_ALPHABET[charIndex];
    }
    return code;
}

export function maskInviteCode(code: string): string {
    if (code.length <= 6) {
        return `${code[0] ?? ''}…${code.at(-1) ?? ''}`;
    }

    return `${code.slice(0, 3)}…${code.slice(-3)}`;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encodedPassword = new TextEncoder().encode(password);
    const keyMaterial = await crypto.subtle.importKey('raw', encodedPassword, 'PBKDF2', false, [
        'deriveBits'
    ]);
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    const hashBytes = new Uint8Array(derivedBits);
    const saltHex = Array.from(salt)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    const hashHex = Array.from(hashBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

    return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, expectedHex] = storedHash.split(':');
    if (!saltHex || !expectedHex) {
        return false;
    }

    const salt = new Uint8Array(
        saltHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []
    );
    const encodedPassword = new TextEncoder().encode(password);
    const keyMaterial = await crypto.subtle.importKey('raw', encodedPassword, 'PBKDF2', false, [
        'deriveBits'
    ]);
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    const actualHex = Array.from(new Uint8Array(derivedBits))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    const expectedBuffer = new TextEncoder().encode(expectedHex);
    const actualBuffer = new TextEncoder().encode(actualHex);
    return constantTimeEqual(expectedBuffer, actualBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let mismatch = 0;
    for (let index = 0; index < a.length; index += 1) {
        mismatch |= a[index] ^ b[index];
    }

    return mismatch === 0;
}
