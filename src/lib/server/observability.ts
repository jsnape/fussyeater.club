import { json } from '@sveltejs/kit';

const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

const REDACTED_KEYS = new Set([
    'authorization',
    'cookie',
    'set-cookie',
    'password',
    'confirmpassword',
    'token',
    'joinintenttoken',
    'code',
    'email',
    'userscope'
]);

type LogFields = Record<string, unknown>;
type LogLevel = 'info' | 'warn' | 'error';

function normalizeRequestId(candidate: string | null): string | null {
    if (!candidate) {
        return null;
    }

    const value = candidate.trim();
    if (!REQUEST_ID_PATTERN.test(value)) {
        return null;
    }

    return value;
}

export function ensureRequestId(request: Request): string {
    const inbound = normalizeRequestId(request.headers.get(REQUEST_ID_HEADER));
    if (inbound) {
        return inbound;
    }

    return crypto.randomUUID().replaceAll('-', '').slice(0, 16);
}

export function resolveEventRequestId(event: { request: Request; locals?: App.Locals }): string {
    if (event.locals?.requestId) {
        return event.locals.requestId;
    }

    const requestId = ensureRequestId(event.request);
    if (event.locals) {
        event.locals.requestId = requestId;
    }
    return requestId;
}

function redactValue(value: unknown, keyHint = ''): unknown {
    const normalizedKey = keyHint.toLowerCase();

    if (REDACTED_KEYS.has(normalizedKey)) {
        return '[REDACTED]';
    }

    if (Array.isArray(value)) {
        return value.map((item) => redactValue(item));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, redactValue(nestedValue, key)])
        );
    }

    return value;
}

function emit(level: LogLevel, eventName: string, requestId: string, fields: LogFields): void {
    const payload = {
        timestamp: new Date().toISOString(),
        level,
        event: eventName,
        requestId,
        ...redactValue(fields)
    };

    const line = JSON.stringify(payload);
    if (level === 'warn') {
        console.warn(line);
        return;
    }

    if (level === 'error') {
        console.error(line);
        return;
    }

    console.info(line);
}

export function logInfo(eventName: string, requestId: string, fields: LogFields = {}): void {
    emit('info', eventName, requestId, fields);
}

export function logWarn(eventName: string, requestId: string, fields: LogFields = {}): void {
    emit('warn', eventName, requestId, fields);
}

export function logError(eventName: string, requestId: string, fields: LogFields = {}): void {
    emit('error', eventName, requestId, fields);
}

function withRequestIdHeaders(headers: HeadersInit | undefined, requestId: string): Headers {
    const resolved = new Headers(headers);
    resolved.set(REQUEST_ID_HEADER, requestId);
    return resolved;
}

export function jsonWithRequestId(
    body: unknown,
    requestId: string,
    init: ResponseInit = {}
): Response {
    return json(body, {
        ...init,
        headers: withRequestIdHeaders(init.headers, requestId)
    });
}

export function responseWithRequestId(
    body: BodyInit | null,
    requestId: string,
    init: ResponseInit = {}
): Response {
    return new Response(body, {
        ...init,
        headers: withRequestIdHeaders(init.headers, requestId)
    });
}
