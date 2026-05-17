<script lang="ts">
    import type { components } from '$lib/api-types';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';
    import { SvelteSet } from 'svelte/reactivity';
    import { CartPlusOutline } from 'flowbite-svelte-icons';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';

    type ShoppingListResponse = components['schemas']['ShoppingListResponse'];
    type ShoppingListCategory = components['schemas']['ShoppingListCategory'];
    type ShoppingListItem = components['schemas']['ShoppingListItem'];
    type ShoppingAllergenAlert = components['schemas']['ShoppingAllergenAlert'];

    let { data }: { data: { list: ShoppingListResponse | null } } = $props();

    let list = $derived(data.list);
    let weekStart = $derived(list?.weekStart ?? '');

    // Checked items persisted in localStorage per week
    let checkedItems = new SvelteSet<string>();
    let collapsedCategories = new SvelteSet<string>();
    let showChecked = $state(false);

    // Load/save checked state from localStorage when weekStart changes
    $effect(() => {
        if (!weekStart) return;
        if (typeof window === 'undefined') return;

        const key = `shopping-checked-${weekStart}`;
        const stored = localStorage.getItem(key);
        checkedItems.clear();
        if (stored) {
            for (const item of JSON.parse(stored) as string[]) {
                checkedItems.add(item);
            }
        }
    });

    function saveChecked() {
        if (!weekStart || typeof window === 'undefined') return;
        const key = `shopping-checked-${weekStart}`;
        localStorage.setItem(key, JSON.stringify([...checkedItems]));
    }

    function toggleItem(ingredient: string) {
        if (checkedItems.has(ingredient)) {
            checkedItems.delete(ingredient);
        } else {
            checkedItems.add(ingredient);
        }
        saveChecked();
    }

    function clearAllChecked() {
        checkedItems.clear();
        saveChecked();
        showChecked = false;
    }

    function toggleCategory(category: string) {
        if (collapsedCategories.has(category)) {
            collapsedCategories.delete(category);
        } else {
            collapsedCategories.add(category);
        }
    }

    // Week navigation
    function navigateWeek(offset: number) {
        const d = new Date(weekStart + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() + offset * 7);
        const newWeek = d.toISOString().slice(0, 10);
        void goto(`${resolve('/shopping')}?week=${newWeek}`);
    }

    // Week label: "Week of 12 – 18 May 2025"
    let weekLabel = $derived.by(() => {
        if (!weekStart) return '';
        const start = new Date(weekStart + 'T00:00:00Z');
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);

        const startDay = start.getUTCDate();
        const endDay = end.getUTCDate();
        const endMonth = end.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
        const endYear = end.getUTCFullYear();

        if (start.getUTCMonth() === end.getUTCMonth()) {
            return `Week of ${startDay}\u2009–\u2009${endDay} ${endMonth} ${endYear}`;
        }
        const startMonth = start.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
        return `Week of ${startDay} ${startMonth}\u2009–\u2009${endDay} ${endMonth} ${endYear}`;
    });

    // All items flattened for progress/checked calculations
    let allItems = $derived(list?.categories.flatMap((c) => c.items) ?? []);
    let checkedCount = $derived(allItems.filter((i) => checkedItems.has(i.ingredient)).length);
    let totalCount = $derived(list?.totalItems ?? 0);
    let progressPercent = $derived(totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0);

    // Unchecked items per category
    function uncheckedItemsFor(cat: ShoppingListCategory): ShoppingListItem[] {
        return cat.items.filter((i) => !checkedItems.has(i.ingredient));
    }

    // All checked items across categories
    let allCheckedItems = $derived(allItems.filter((i) => checkedItems.has(i.ingredient)));

    // Categories that still have unchecked items
    let activeCategories = $derived(
        (list?.categories ?? []).filter((c) => uncheckedItemsFor(c).length > 0)
    );

    // Format quantity: "500g", "2 tbsp"
    function formatQuantity(amount?: number, unit?: string): string {
        if (!amount && !unit) return '';
        const amountStr = amount != null ? String(amount) : '';
        if (!unit) return amountStr;
        if (!amount && amount !== 0) return unit;
        const spacer = unit.length <= 3 ? '' : ' ';
        return `${amountStr}${spacer}${unit}`;
    }

    // Allergen badge colour
    function alertColour(alert: ShoppingAllergenAlert): string {
        return alert.reason === 'allergy'
            ? 'bg-red-100 text-red-700 border-red-200'
            : 'bg-amber-100 text-amber-700 border-amber-200';
    }

    function alertTooltip(alert: ShoppingAllergenAlert): string {
        const label = alert.reason === 'allergy' ? 'Allergy' : 'Dislike';
        return `${alert.memberName}: ${label}${alert.severity ? ` (${alert.severity})` : ''}`;
    }
</script>

<main class="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
    {#if !list || list.totalItems === 0}
        <h1 class="text-3xl font-bold text-slate-900">Shopping List</h1>
        <div class="mt-10">
            <EmptyState
                heading="No shopping list yet"
                description="Once you plan your meals for the week, we'll generate an allergen-aware shopping list sorted by aisle."
                actionLabel="Go to meal planner"
                actionHref={resolve('/planner')}
            >
                {#snippet icon()}
                    <CartPlusOutline class="h-12 w-12 text-primary-400" />
                {/snippet}
            </EmptyState>
        </div>
    {:else}
        <!-- Header with week nav -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 class="text-3xl font-bold text-slate-900">Shopping List</h1>
            <div class="flex flex-col items-end gap-1">
                <span class="text-sm font-medium text-slate-600">{weekLabel}</span>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        onclick={() => navigateWeek(-1)}
                        class="rounded-lg px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50"
                    >
                        ← Prev
                    </button>
                    <button
                        type="button"
                        onclick={() => navigateWeek(1)}
                        class="rounded-lg px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700">
                    {checkedCount} of {totalCount} items
                </span>
                <span class="font-medium {progressPercent === 100 ? 'text-green-600' : 'text-slate-500'}">
                    {progressPercent}%
                </span>
            </div>
            <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    class="h-full rounded-full transition-all duration-300 {progressPercent === 100 ? 'bg-green-500' : 'bg-primary-500'}"
                    style="width: {progressPercent}%"
                ></div>
            </div>
        </div>

        <!-- Category sections (unchecked items only) -->
        <div class="mt-6 space-y-4">
            {#each activeCategories as category (category.category)}
                {@const items = uncheckedItemsFor(category)}
                {@const isCollapsed = collapsedCategories.has(category.category)}
                <div class="rounded-2xl bg-white shadow-sm">
                    <!-- Category header -->
                    <button
                        type="button"
                        onclick={() => toggleCategory(category.category)}
                        class="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                        <span class="flex items-center gap-2 text-lg font-semibold text-slate-800">
                            <span>{category.emoji}</span>
                            {category.category}
                            <span class="text-sm font-normal text-slate-400">({items.length})</span>
                        </span>
                        <span
                            class="text-slate-400 transition-transform duration-200 {isCollapsed ? '-rotate-90' : ''}"
                        >
                            ▼
                        </span>
                    </button>

                    <!-- Item list -->
                    {#if !isCollapsed}
                        <ul class="divide-y divide-slate-50 px-5 pb-3">
                            {#each items as item (item.ingredient)}
                                <li class="flex items-start gap-3 py-3">
                                    <!-- Checkbox -->
                                    <button
                                        type="button"
                                        onclick={() => toggleItem(item.ingredient)}
                                        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 text-white transition-colors hover:border-primary-400"
                                        aria-label="Mark {item.ingredient} as checked"
                                    >
                                        &nbsp;
                                    </button>

                                    <!-- Name & recipe pills -->
                                    <div class="min-w-0 flex-1">
                                        <span class="font-semibold text-slate-800">{item.ingredient}</span>
                                        {#if item.recipeSources.length > 0}
                                            <div class="mt-1 flex flex-wrap gap-1">
                                                {#each item.recipeSources as recipe (recipe)}
                                                    <span class="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                        {recipe}
                                                    </span>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- Quantity + alerts -->
                                    <div class="flex shrink-0 items-center gap-2 text-right">
                                        {#if item.totalAmount || item.unit}
                                            <span class="text-sm font-medium text-slate-600">
                                                {formatQuantity(item.totalAmount, item.unit)}
                                            </span>
                                        {/if}
                                        {#each item.allergenAlerts as alert (`${alert.memberName}-${alert.reason}`)}
                                            <span
                                                class="inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium {alertColour(alert)}"
                                                title={alertTooltip(alert)}
                                            >
                                                ⚠
                                            </span>
                                        {/each}
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            {/each}
        </div>

        <!-- Checked items section -->
        {#if allCheckedItems.length > 0}
            <div class="mt-6 rounded-2xl bg-white shadow-sm">
                <button
                    type="button"
                    onclick={() => (showChecked = !showChecked)}
                    class="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                    <span class="flex items-center gap-2 text-lg font-semibold text-slate-500">
                        ✓ Checked items
                        <span class="text-sm font-normal text-slate-400">({allCheckedItems.length})</span>
                    </span>
                    <span
                        class="text-slate-400 transition-transform duration-200 {showChecked ? '' : '-rotate-90'}"
                    >
                        ▼
                    </span>
                </button>

                {#if showChecked}
                    <div class="px-5 pb-2">
                        <button
                            type="button"
                            onclick={clearAllChecked}
                            class="mb-3 text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                            Clear all
                        </button>
                        <ul class="divide-y divide-slate-50">
                            {#each allCheckedItems as item (item.ingredient)}
                                <li class="flex items-start gap-3 py-3 opacity-50">
                                    <!-- Checked checkbox -->
                                    <button
                                        type="button"
                                        onclick={() => toggleItem(item.ingredient)}
                                        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-primary-500 bg-primary-500 text-white transition-colors"
                                        aria-label="Uncheck {item.ingredient}"
                                    >
                                        ✓
                                    </button>

                                    <div class="min-w-0 flex-1">
                                        <span class="font-semibold text-slate-500 line-through">{item.ingredient}</span>
                                    </div>

                                    {#if item.totalAmount || item.unit}
                                        <span class="shrink-0 text-sm text-slate-400 line-through">
                                            {formatQuantity(item.totalAmount, item.unit)}
                                        </span>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</main>
