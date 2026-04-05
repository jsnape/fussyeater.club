// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    interface Env extends Cloudflare.Env {
        DB: import('$lib/server/db').DbLike;
        AUTH_REGISTRATION_V2_ENABLED?: string;
        AUTH_INVITE_MULTIUSE_ENABLED?: string;
        AUTH_MICROSOFT_OAUTH_ENABLED?: string;
        BETTER_AUTH_SECRET?: string;
        BETTER_AUTH_URL?: string;
        MICROSOFT_CLIENT_ID?: string;
        MICROSOFT_CLIENT_SECRET?: string;
    }

    namespace App {
        interface Platform {
            env: Env;
            ctx: ExecutionContext;
            caches: CacheStorage;
            cf?: IncomingRequestCfProperties;
        }

        // interface Error {}
        interface Locals {
            requestId?: string;
        }
        // interface PageData {}
        // interface PageState {}
    }
}

export {};
