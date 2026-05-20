<script lang="ts">
    import { Badge, Button, Input, Label, Radio, Select, Textarea } from 'flowbite-svelte';
    import { untrack } from 'svelte';
    import { mergeDefaultAllergens } from '$lib/food-group-defaults';
    import { STANDARD_ALLERGEN_OPTIONS } from '$lib/allergens';

    type CanonicalIngredient = {
        id: string;
        name: string;
        foodGroup: string;
        allergens: string[];
        plantColour?: string;
        aliases: string[];
        description?: string;
    };

    type CreateIngredientRequest = {
        name: string;
        foodGroup: string;
        allergens: string[];
        plantColour?: string | null;
        aliases: string[];
        description?: string | null;
    };

    let {
        ingredient = null,
        isEdit = false,
        onSave,
        onCancel
    }: {
        ingredient?: CanonicalIngredient | null;
        isEdit?: boolean;
        onSave: (data: CreateIngredientRequest) => Promise<void>;
        onCancel: () => void;
    } = $props();

    // --- Form state (snapshot initial prop values) ---
    let name = $state(untrack(() => ingredient?.name ?? ''));
    let foodGroup = $state(untrack(() => ingredient?.foodGroup ?? ''));
    let allergens = $state<string[]>(untrack(() => ingredient?.allergens ?? []));
    let plantColour = $state(untrack(() => ingredient?.plantColour ?? ''));
    let aliases = $state<string[]>(untrack(() => ingredient?.aliases ?? []));
    let description = $state(untrack(() => ingredient?.description ?? ''));

    let aliasDraft = $state('');
    let isSubmitting = $state(false);
    let submitError = $state('');

    // --- Constants ---
    const foodGroupItems = [
    { value: '', name: 'Select a food group…' },
        { value: 'dairy', name: 'Dairy' },
        { value: 'meat', name: 'Meat' },
        { value: 'poultry', name: 'Poultry' },
        { value: 'fish', name: 'Fish' },
        { value: 'shellfish', name: 'Shellfish' },
        { value: 'grain', name: 'Grain' },
        { value: 'fruit', name: 'Fruit' },
        { value: 'vegetable', name: 'Vegetable' },
        { value: 'herb', name: 'Herb' },
        { value: 'spice', name: 'Spice' },
        { value: 'legume', name: 'Legume' },
        { value: 'nut', name: 'Nut' },
        { value: 'seed', name: 'Seed' },
        { value: 'oil', name: 'Oil' },
        { value: 'condiment', name: 'Condiment' },
        { value: 'sweetener', name: 'Sweetener' },
        { value: 'other', name: 'Other' }
    ];

    const standardAllergens = STANDARD_ALLERGEN_OPTIONS;

    const plantFoodGroups = new Set(['fruit', 'vegetable', 'herb', 'legume']);

    const plantColourOptions = [
        { value: 'red', label: 'Red', dot: 'bg-red-500' },
        { value: 'orange', label: 'Orange', dot: 'bg-orange-500' },
        { value: 'yellow', label: 'Yellow', dot: 'bg-yellow-400' },
        { value: 'green', label: 'Green', dot: 'bg-green-500' },
        { value: 'blue-purple', label: 'Blue / purple', dot: 'bg-purple-500' },
        { value: 'white-brown', label: 'White / brown', dot: 'bg-amber-200' },
        { value: 'multicolour', label: 'Multicolour', dot: 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500' }
    ];

    // --- Derived state ---
    const isPlant = $derived(plantFoodGroups.has(foodGroup));

    const canSubmit = $derived(
        name.trim() !== '' &&
            foodGroup !== '' &&
            (!isPlant || plantColour !== '') &&
            !isSubmitting
    );

    // --- Clear plant colour when switching to non-plant ---
    $effect(() => {
        if (!isPlant) {
            plantColour = '';
        }
    });

    // --- Auto-select default allergens when food group changes ---
    let lastFoodGroup = untrack(() => ingredient?.foodGroup ?? '');
    $effect(() => {
        const fg = foodGroup;
        if (fg && fg !== lastFoodGroup) {
            const current = untrack(() => allergens);
            allergens = mergeDefaultAllergens(fg, current);
        }
        lastFoodGroup = fg;
    });

    // --- Allergen toggle ---
    function toggleAllergen(allergen: string): void {
        if (allergens.includes(allergen)) {
            allergens = allergens.filter((a) => a !== allergen);
        } else {
            allergens = [...allergens, allergen];
        }
    }

    // --- Alias management ---
    function addAlias(): void {
        const alias = aliasDraft.trim().toLowerCase();
        if (!alias || aliases.includes(alias)) {
            aliasDraft = '';
            return;
        }
        aliases = [...aliases, alias];
        aliasDraft = '';
    }

    function removeAlias(alias: string): void {
        aliases = aliases.filter((a) => a !== alias);
    }

    // --- Submit ---
    async function handleSubmit(): Promise<void> {
        submitError = '';
        isSubmitting = true;
        try {
            const data: CreateIngredientRequest = {
                name: name.trim(),
                foodGroup,
                allergens,
                plantColour: isPlant && plantColour ? plantColour : null,
                aliases,
                description: description.trim() || null
            };
            await onSave(data);
        } catch (error) {
            if (error instanceof Error) {
                submitError = error.message || 'Something went wrong.';
            } else {
                submitError = 'Something went wrong.';
            }
        } finally {
            isSubmitting = false;
        }
    }
</script>

<form
    class="space-y-8"
    onsubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
    }}
>
    <!-- Error message -->
    {#if submitError}
        <p class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {submitError}
        </p>
    {/if}

    <!-- Name -->
    <div>
        <Label for="ingredient-name" class="mb-2">Name *</Label>
        <Input
            id="ingredient-name"
            type="text"
            bind:value={name}
            placeholder="e.g. Cheddar cheese"
            required
        />
    </div>

    <!-- Food group -->
    <div>
        <Label for="food-group" class="mb-2">Food group *</Label>
        <Select id="food-group" items={foodGroupItems} bind:value={foodGroup} />
    </div>

    <!-- Allergens -->
    <fieldset>
        <legend class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Allergens</legend>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {#each standardAllergens as { value, label } (value)}
                <label class="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={allergens.includes(value)}
                        onchange={() => toggleAllergen(value)}
                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    {label}
                </label>
            {/each}
        </div>
    </fieldset>

    <!-- Plant colour (conditional) -->
    {#if isPlant}
        <fieldset>
            <legend class="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Plant colour *
            </legend>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {#each plantColourOptions as { value, label, dot } (value)}
                    <Radio name="plant-colour" {value} bind:group={plantColour}>
                        <span class="flex items-center gap-2">
                            <span class="inline-block h-3 w-3 rounded-full {dot}"></span>
                            {label}
                        </span>
                    </Radio>
                {/each}
            </div>
        </fieldset>
    {/if}

    <!-- Aliases -->
    <div>
        <Label for="alias-input" class="mb-2">Aliases</Label>
        <div class="flex gap-2">
            <Input
                id="alias-input"
                type="text"
                bind:value={aliasDraft}
                placeholder="Add an alias"
                class="flex-1"
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addAlias();
                    }
                }}
            />
            <Button
                color="alternative"
                onclick={addAlias}
                disabled={!aliasDraft.trim()}
                class="min-h-[44px] min-w-[44px]"
            >
                Add
            </Button>
        </div>

        {#if aliases.length > 0}
            <div class="mt-3 flex flex-wrap gap-2">
                {#each aliases as alias (alias)}
                    <Badge color="primary" class="flex items-center gap-1 text-sm">
                        {alias}
                        <button
                            type="button"
                            class="ml-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-xs hover:text-red-600"
                            onclick={() => removeAlias(alias)}
                            aria-label={`Remove alias ${alias}`}
                        >
                            ✕
                        </button>
                    </Badge>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Description -->
    <div>
        <Label for="ingredient-description" class="mb-2">Description</Label>
        <Textarea
            id="ingredient-description"
            bind:value={description}
            placeholder="Optional description"
            rows={3}
        />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-4">
        <Button
            type="submit"
            color="primary"
            disabled={!canSubmit}
            class="min-h-[44px] min-w-[44px]"
        >
            {#if isSubmitting}
                {isEdit ? 'Saving…' : 'Creating…'}
            {:else}
                {isEdit ? 'Save changes' : 'Create ingredient'}
            {/if}
        </Button>
        <Button
            color="alternative"
            onclick={onCancel}
            class="min-h-[44px] min-w-[44px]"
        >
            Cancel
        </Button>
    </div>
</form>
