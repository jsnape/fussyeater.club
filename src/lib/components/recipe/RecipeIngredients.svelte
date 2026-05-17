<script lang="ts">
    import { Button, Input, Label } from 'flowbite-svelte';
    import { resolve } from '$app/paths';
    import type { components } from '$lib/api-types';

    type RecipeIngredient = components['schemas']['RecipeIngredient'];

    type IngredientGroup = {
        name: string;
        items: RecipeIngredient[];
    };

    interface IngredientDraft {
        amount: string;
        unit: string;
        ingredient: string;
        ingredientGroup: string;
        preparation: string;
    }

    let {
        mode,
        ingredients = $bindable(),
        servings = 0
    }: {
        mode: 'view' | 'edit';
        ingredients: RecipeIngredient[];
        servings?: number;
    } = $props();

    let servingMultiplier = $state(1);
    let adjustedServings = $derived(servings > 0 ? Math.round(servings * servingMultiplier) : 0);

    function increaseServings(): void {
        servingMultiplier = servingMultiplier + 0.5;
    }

    function decreaseServings(): void {
        if (servingMultiplier > 0.5) {
            servingMultiplier = servingMultiplier - 0.5;
        }
    }

    function scaleAmount(amount: number | undefined): string {
        if (amount === undefined) return '';
        const scaled = amount * servingMultiplier;
        return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1);
    }

    let ingredientDraft = $state<IngredientDraft>({
        amount: '',
        unit: '',
        ingredient: '',
        ingredientGroup: '',
        preparation: ''
    });

    let ingredientGroups = $derived.by(() => {
        const groupOrder: string[] = [];
        const groupItems: Record<string, RecipeIngredient[]> = {};

        for (const ing of ingredients) {
            const key = ing.ingredientGroup ?? '';
            if (!(key in groupItems)) {
                groupItems[key] = [];
                groupOrder.push(key);
            }
            groupItems[key].push(ing);
        }

        const named: IngredientGroup[] = [];
        let ungrouped: IngredientGroup | null = null;

        for (const key of groupOrder) {
            const items = groupItems[key];
            if (key === '') {
                ungrouped = { name: 'Other', items };
            } else {
                named.push({ name: key, items });
            }
        }

        if (ungrouped) named.push(ungrouped);
        return named;
    });

    function addIngredient(): void {
        const name = ingredientDraft.ingredient.trim();
        if (!name) return;

        const entry: RecipeIngredient = { ingredient: name };
        const amt = parseFloat(ingredientDraft.amount);
        if (!isNaN(amt) && amt > 0) entry.amount = amt;
        if (ingredientDraft.unit.trim()) entry.unit = ingredientDraft.unit.trim();
        if (ingredientDraft.ingredientGroup.trim())
            entry.ingredientGroup = ingredientDraft.ingredientGroup.trim();
        if (ingredientDraft.preparation.trim())
            entry.preparation = { type: 'text', text: ingredientDraft.preparation.trim() };

        ingredients = [...ingredients, entry];
        ingredientDraft = {
            amount: '',
            unit: '',
            ingredient: '',
            ingredientGroup: '',
            preparation: ''
        };
    }

    function removeIngredient(index: number): void {
        ingredients = ingredients.filter((_, i) => i !== index);
    }
</script>

{#snippet ingredientLine(ing: RecipeIngredient)}
    {@const amount = mode === 'view' ? scaleAmount(ing.amount) : (ing.amount ? String(ing.amount) : '')}
    {@const unit = ing.unit ?? ''}
    {@const unitSep = unit.length >= 4 ? ' ' : ''}
    {@const qty = [amount, unit].filter(Boolean).join(unitSep)}
    <span>
        {#if qty}{qty}&nbsp;{/if}{ing.ingredient}{#if ing.preparation}
            {#if ing.preparation.type === 'recipe-link' && ing.preparation.recipeId}
                &nbsp;(<a
                    href={resolve(`/recipes/${ing.preparation.recipeId}`)}
                    class="text-primary-600 underline hover:text-primary-800"
                    >{ing.preparation.recipeLabel ?? ing.preparation.text ?? 'recipe'}</a
                >)
            {:else if ing.preparation.text}
                &nbsp;({ing.preparation.text})
            {/if}
        {/if}
    </span>
{/snippet}

{#if mode === 'edit'}
    <p class="text-sm text-slate-600">Add at least one ingredient.</p>

    <div class="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <Label for="ing-group" class="mb-1 text-sm font-medium text-slate-700"
                    >Group (optional)</Label
                >
                <Input
                    id="ing-group"
                    type="text"
                    bind:value={ingredientDraft.ingredientGroup}
                    placeholder="e.g. Sauce"
                />
            </div>
            <div>
                <Label for="ing-amount" class="mb-1 text-sm font-medium text-slate-700"
                    >Amount (optional)</Label
                >
                <Input
                    id="ing-amount"
                    type="number"
                    bind:value={ingredientDraft.amount}
                    placeholder="e.g. 2"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <Label for="ing-unit" class="mb-1 text-sm font-medium text-slate-700"
                    >Unit (optional)</Label
                >
                <Input
                    id="ing-unit"
                    type="text"
                    bind:value={ingredientDraft.unit}
                    placeholder="e.g. cups"
                />
            </div>
            <div>
                <Label for="ing-name" class="mb-1 text-sm font-medium text-slate-700"
                    >Ingredient</Label
                >
                <Input
                    id="ing-name"
                    type="text"
                    bind:value={ingredientDraft.ingredient}
                    placeholder="Ingredient name"
                    aria-required="true"
                />
            </div>
        </div>
        <div class="mt-3">
            <Label for="ing-prep" class="mb-1 text-sm font-medium text-slate-700"
                >Preparation (optional)</Label
            >
            <Input
                id="ing-prep"
                type="text"
                bind:value={ingredientDraft.preparation}
                placeholder="e.g. finely chopped"
            />
        </div>
        <div class="mt-4">
            <Button
                color="alternative"
                onclick={addIngredient}
                disabled={!ingredientDraft.ingredient.trim()}
                class="min-h-[44px] min-w-[44px]"
            >
                + Add ingredient
            </Button>
        </div>
    </div>

    {#if ingredients.length > 0}
        <ul class="mt-4 space-y-3">
            {#each ingredients as ing, i (i)}
                <li
                    class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                    <span class="text-sm text-slate-900">
                        {#if ing.ingredientGroup}<span class="font-medium"
                                >[{ing.ingredientGroup}]</span
                            >&nbsp;{/if}
                        {#if ing.amount}{ing.amount}{/if}
                        {#if ing.unit}&nbsp;{ing.unit}{/if}
                        {ing.ingredient}
                        {#if ing.preparation?.text}
                            <span class="text-slate-500">— {ing.preparation.text}</span>
                        {/if}
                    </span>
                    <Button
                        color="red"
                        size="xs"
                        onclick={() => removeIngredient(i)}
                        aria-label={`Remove ingredient ${ing.ingredient}`}
                        class="min-h-[44px] min-w-[44px]"
                    >
                        Remove
                    </Button>
                </li>
            {/each}
        </ul>
    {/if}
{:else if ingredients.length > 0}
    {#if servings > 0}
        <div class="mb-4 flex items-center gap-3">
            <span class="text-sm font-medium text-slate-600">Serves</span>
            <div class="flex items-center gap-1">
                <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                    onclick={decreaseServings}
                    disabled={servingMultiplier <= 0.5}
                    aria-label="Decrease servings"
                >
                    −
                </button>
                <span class="min-w-[2rem] text-center text-sm font-semibold text-slate-900">
                    {adjustedServings}
                </span>
                <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                    onclick={increaseServings}
                    aria-label="Increase servings"
                >
                    +
                </button>
            </div>
            {#if servingMultiplier !== 1}
                <span class="text-xs text-slate-400">({servingMultiplier}×)</span>
            {/if}
        </div>
    {/if}
    {#each ingredientGroups as group (group.name)}
        {#if ingredientGroups.length > 1}
            <h3 class="mt-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                {group.name}
            </h3>
        {/if}
        <ul class="mt-2 space-y-2">
            {#each group.items as ing (ing.ingredient)}
                <li class="flex items-baseline gap-3 text-slate-700">
                    <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400"
                    ></span>
                    {@render ingredientLine(ing)}
                </li>
            {/each}
        </ul>
    {/each}
{/if}
