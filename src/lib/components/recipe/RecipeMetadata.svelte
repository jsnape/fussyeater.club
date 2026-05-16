<script lang="ts">
    import { Input, Label } from 'flowbite-svelte';

    let {
        mode,
        prepMinutes = $bindable(),
        cookMinutes = $bindable(),
        servings = $bindable(),
        yieldText = $bindable()
    }: {
        mode: 'view' | 'edit';
        prepMinutes: string;
        cookMinutes: string;
        servings: string;
        yieldText: string;
    } = $props();

    let prepNum = $derived(parseInt(prepMinutes, 10));
    let cookNum = $derived(parseInt(cookMinutes, 10));
    let totalMinutes = $derived((isNaN(prepNum) ? 0 : prepNum) + (isNaN(cookNum) ? 0 : cookNum));
    let hasPrep = $derived(!isNaN(prepNum) && prepNum > 0);
    let hasCook = $derived(!isNaN(cookNum) && cookNum > 0);
    let servingsNum = $derived(parseInt(servings, 10));
    let hasServings = $derived(!isNaN(servingsNum) && servingsNum > 0);
    let hasYield = $derived(yieldText.trim() !== '');
    let hasAny = $derived(hasPrep || hasCook || hasServings || hasYield);
</script>

{#if mode === 'edit'}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
            <Label for="prep-minutes" class="mb-1 text-sm font-medium text-slate-700"
                >Prep (minutes)</Label
            >
            <Input id="prep-minutes" type="number" bind:value={prepMinutes} min="0" />
        </div>
        <div>
            <Label for="cook-minutes" class="mb-1 text-sm font-medium text-slate-700"
                >Cook (minutes)</Label
            >
            <Input id="cook-minutes" type="number" bind:value={cookMinutes} min="0" />
        </div>
        <div>
            <Label for="servings" class="mb-1 text-sm font-medium text-slate-700">Servings</Label>
            <Input id="servings" type="number" bind:value={servings} min="1" />
        </div>
        <div>
            <Label for="yield-text" class="mb-1 text-sm font-medium text-slate-700">Yield</Label>
            <Input
                id="yield-text"
                type="text"
                bind:value={yieldText}
                placeholder="e.g. 12 muffins"
                maxlength={100}
            />
        </div>
    </div>
{:else if hasAny}
    <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        {#if hasPrep}
            <span class="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                <span class="text-slate-400">🕐</span> Prep: {prepNum} min
            </span>
        {/if}
        {#if hasCook}
            <span class="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                <span class="text-slate-400">🔥</span> Cook: {cookNum} min
            </span>
        {/if}
        {#if totalMinutes > 0 && hasPrep && hasCook}
            <span class="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 font-medium text-primary-700">
                Total: {totalMinutes} min
            </span>
        {/if}
        {#if hasServings}
            <span class="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                <span class="text-slate-400">🍽</span> Serves {servingsNum}
            </span>
        {/if}
        {#if hasYield}
            <span class="rounded-lg bg-slate-50 px-3 py-1.5">
                {yieldText}
            </span>
        {/if}
    </div>
{/if}
