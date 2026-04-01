// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
            householdId: string | null;
            accessUserEmail: string | null;
        }
		// interface PageData {}
		// interface PageState {}
		interface Platform {
            env: {
                DB: D1Database;
                REQUIRE_ACCESS_AUTH?: string;
                DEFAULT_HOUSEHOLD_ID?: string;
            };
        }
	}
}

export {};
