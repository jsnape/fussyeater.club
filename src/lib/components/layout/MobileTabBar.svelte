<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { HomeSolid, BookOpenSolid, CalendarWeekSolid, CartSolid } from 'flowbite-svelte-icons';

    type Tab = {
        label: string;
        href: string;
        icon: typeof HomeSolid;
        isActive: (pathname: string) => boolean;
    };

    let { isAuthenticated }: { isAuthenticated: boolean } = $props();

    const tabs: Tab[] = [
        {
            label: 'Home',
            href: resolve('/'),
            icon: HomeSolid,
            isActive: (pathname: string) => pathname === '/'
        },
        {
            label: 'Recipes',
            href: resolve('/recipes'),
            icon: BookOpenSolid,
            isActive: (pathname: string) => pathname.startsWith('/recipes')
        },
        {
            label: 'Planner',
            href: resolve('/planner'),
            icon: CalendarWeekSolid,
            isActive: (pathname: string) => pathname.startsWith('/planner')
        },
        {
            label: 'Shopping',
            href: resolve('/shopping'),
            icon: CartSolid,
            isActive: (pathname: string) => pathname.startsWith('/shopping')
        }
    ];
</script>

{#if isAuthenticated}
    <nav
        class="fixed bottom-0 inset-x-0 z-50 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.06)] md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
    >
        <div class="grid grid-cols-4">
            {#each tabs as tab (tab.href)}
                {@const active = tab.isActive(page.url.pathname)}
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href pre-resolved in tabs array -->
                <a
                    href={tab.href}
                    class="flex flex-col items-center justify-center py-2 gap-1 {active
                        ? 'text-primary-600'
                        : 'text-slate-400'}"
                    aria-current={active ? 'page' : undefined}
                >
                    <tab.icon class="h-5 w-5" />
                    <span class="text-xs font-medium">{tab.label}</span>
                </a>
            {/each}
        </div>
    </nav>
{/if}
