<script lang="ts">
    import {
        CalendarWeekOutline,
        CartPlusOutline,
        PrinterOutline,
        LinkOutline
    } from 'flowbite-svelte-icons';

    type Props = {
        recipeTitle: string;
    };

    let { recipeTitle }: Props = $props();

    let copied = $state(false);

    function handlePrint() {
        window.print();
    }

    async function handleShare() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch {
            // Clipboard API may be unavailable (e.g. non-HTTPS, permissions)
        }
    }
</script>

<div class="rounded-2xl bg-white p-6 shadow-sm">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</h3>

    <div class="mt-4 flex flex-col gap-3">
        <!-- Add to Meal Plan (placeholder) -->
        <button
            disabled
            title="Coming soon"
            class="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-transparent opacity-50 cursor-not-allowed"
        >
            <CalendarWeekOutline class="h-4 w-4 text-slate-400" />
            Add to Meal Plan
        </button>

        <!-- Add to Shopping List (placeholder) -->
        <button
            disabled
            title="Coming soon"
            class="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-transparent opacity-50 cursor-not-allowed"
        >
            <CartPlusOutline class="h-4 w-4 text-slate-400" />
            Add to Shopping List
        </button>

        <!-- Print Recipe -->
        <button
            onclick={handlePrint}
            class="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
            <PrinterOutline class="h-4 w-4 text-slate-400" />
            Print Recipe
        </button>

        <!-- Share (copy link) -->
        <button
            onclick={handleShare}
            class="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
            <LinkOutline class="h-4 w-4 text-slate-400" />
            {#if copied}
                Copied!
            {:else}
                Share
            {/if}
        </button>
    </div>
</div>
