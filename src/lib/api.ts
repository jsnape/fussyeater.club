export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number
    ) {
        super(message);
    }
}

type FetchLike = typeof fetch;

async function runApiFetch<T>(
    fetcher: FetchLike,
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> {
    const response = await fetcher(input, {
        credentials: 'include',
        ...init,
        headers: {
            'content-type': 'application/json',
            ...(init?.headers ?? {})
        }
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
            const payload = (await response.json()) as { message?: string };
            if (payload.message) {
                message = payload.message;
            }
        } catch {
            // no-op
        }

        throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    return runApiFetch<T>(fetch, input, init);
}

export async function apiFetchWith<T>(
    fetcher: FetchLike,
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> {
    return runApiFetch<T>(fetcher, input, init);
}
