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
	const payload = new TextEncoder().encode(password);
	const digest = await crypto.subtle.digest('SHA-256', payload);
	const bytes = new Uint8Array(digest);
	return Array.from(bytes)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}
