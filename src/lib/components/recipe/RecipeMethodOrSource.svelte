<script lang="ts">
    import { Button, Input, Label, Radio, Select, Textarea } from 'flowbite-svelte';
    import type { components } from '$lib/api-types';

    type RecipeSourceReference = components['schemas']['RecipeSourceReference'];

    let {
        mode,
        recipeType = $bindable(),
        steps = $bindable(),
        sourceKind = $bindable(),
        sourceLabel = $bindable(),
        sourceUrl = $bindable(),
        sourceBookTitle = $bindable(),
        sourcePageNumber = $bindable(),
        sourceIsbn = $bindable()
    }: {
        mode: 'view' | 'edit';
        recipeType: 'full' | 'reference';
        steps: string[];
        sourceKind: 'url' | 'book';
        sourceLabel: string;
        sourceUrl: string;
        sourceBookTitle: string;
        sourcePageNumber: string;
        sourceIsbn: string;
    } = $props();

    let methodDraft = $state('');

    const sourceKindItems = [
        { value: 'url', name: 'URL' },
        { value: 'book', name: 'Book' }
    ];

    // Clear the other section when type changes (edit mode only)
    let previousType = $state<'full' | 'reference'>(recipeType);
    $effect(() => {
        const current = recipeType;
        if (current !== previousType) {
            if (current === 'full') {
                sourceLabel = '';
                sourceUrl = '';
                sourceBookTitle = '';
                sourcePageNumber = '';
                sourceIsbn = '';
            } else {
                steps = [];
                methodDraft = '';
            }
            previousType = current;
        }
    });

    function addMethodStep(): void {
        const step = methodDraft.trim();
        if (!step) return;
        steps = [...steps, step];
        methodDraft = '';
    }

    function removeMethodStep(index: number): void {
        steps = steps.filter((_, i) => i !== index);
    }

    let viewSourceReference = $derived.by((): RecipeSourceReference | null => {
        if (recipeType !== 'reference') return null;
        if (!sourceLabel.trim()) return null;
        const ref: RecipeSourceReference = { kind: sourceKind, label: sourceLabel };
        if (sourceKind === 'url' && sourceUrl) ref.url = sourceUrl;
        if (sourceKind === 'book') {
            if (sourceBookTitle) ref.bookTitle = sourceBookTitle;
            const pn = parseInt(sourcePageNumber, 10);
            if (!isNaN(pn) && pn > 0) ref.pageNumber = pn;
            if (sourceIsbn) ref.isbn = sourceIsbn;
        }
        return ref;
    });
</script>

{#if mode === 'edit'}
    <div class="flex gap-6">
        <Radio name="recipe-type" value="full" bind:group={recipeType}>
            <span class="text-sm">Write method steps</span>
        </Radio>
        <Radio name="recipe-type" value="reference" bind:group={recipeType}>
            <span class="text-sm">Link to source</span>
        </Radio>
    </div>

    {#if recipeType === 'full'}
        <div class="mt-4">
            <p class="text-sm text-primary-700">Add at least one step.</p>

            <div class="mt-4 rounded-lg border border-primary-200 bg-white p-5">
                <Label for="method-step" class="mb-1 text-sm font-medium text-primary-700"
                    >Step description</Label
                >
                <Textarea
                    id="method-step"
                    bind:value={methodDraft}
                    placeholder="Describe this step"
                    rows={2}
                    aria-required="true"
                    class="w-full"
                />
                <div class="mt-4">
                    <Button
                        color="alternative"
                        onclick={addMethodStep}
                        disabled={!methodDraft.trim()}
                        class="min-h-[44px] min-w-[44px]"
                    >
                        + Add step
                    </Button>
                </div>
            </div>

            {#if steps.length > 0}
                <ol class="mt-4 list-inside list-decimal space-y-2">
                    {#each steps as step, i (i)}
                        <li
                            class="flex items-start justify-between rounded-md border border-primary-200 bg-white px-4 py-3"
                        >
                            <span class="text-sm text-primary-900">
                                <span class="font-semibold">{i + 1}.</span>
                                {step}
                            </span>
                            <Button
                                color="red"
                                size="xs"
                                onclick={() => removeMethodStep(i)}
                                aria-label={`Remove step ${i + 1}`}
                                class="ml-3 min-h-[44px] min-w-[44px] shrink-0"
                            >
                                Remove
                            </Button>
                        </li>
                    {/each}
                </ol>
            {/if}
        </div>
    {:else}
        <div class="mt-4">
            <div class="rounded-lg border border-primary-200 bg-white p-5">
                <div>
                    <Label for="source-kind" class="mb-1 text-sm font-medium text-primary-700"
                        >Source type</Label
                    >
                    <Select id="source-kind" items={sourceKindItems} bind:value={sourceKind} />
                </div>

                <div class="mt-4">
                    <Label for="source-label" class="mb-1 text-sm font-medium text-primary-700"
                        >Label</Label
                    >
                    <Input
                        id="source-label"
                        type="text"
                        bind:value={sourceLabel}
                        placeholder="Name or description of the source"
                        aria-required="true"
                    />
                </div>

                {#if sourceKind === 'url'}
                    <div class="mt-4">
                        <Label for="source-url" class="mb-1 text-sm font-medium text-primary-700"
                            >URL</Label
                        >
                        <Input
                            id="source-url"
                            type="url"
                            bind:value={sourceUrl}
                            placeholder="https://example.com/recipe"
                            aria-required="true"
                        />
                    </div>
                {:else}
                    <div class="mt-4">
                        <Label
                            for="source-book-title"
                            class="mb-1 text-sm font-medium text-primary-700">Book title</Label
                        >
                        <Input
                            id="source-book-title"
                            type="text"
                            bind:value={sourceBookTitle}
                            placeholder="Title of the book"
                        />
                    </div>
                    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label
                                for="source-page"
                                class="mb-1 text-sm font-medium text-primary-700">Page number</Label
                            >
                            <Input
                                id="source-page"
                                type="number"
                                bind:value={sourcePageNumber}
                                min="1"
                            />
                        </div>
                        <div>
                            <Label
                                for="source-isbn"
                                class="mb-1 text-sm font-medium text-primary-700">ISBN</Label
                            >
                            <Input
                                id="source-isbn"
                                type="text"
                                bind:value={sourceIsbn}
                                placeholder="e.g. 978-0-13-468599-1"
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
{:else if recipeType === 'full' && steps.length > 0}
    <ol class="space-y-4">
        {#each steps as step, i (i)}
            <li class="flex gap-4">
                <span
                    class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800"
                >
                    {i + 1}
                </span>
                <div class="prose-primary prose max-w-none pt-0.5">
                    <p>{step}</p>
                </div>
            </li>
        {/each}
    </ol>
{:else if recipeType === 'reference' && viewSourceReference}
    <div class="rounded-lg border border-primary-200 bg-white p-5">
        {#if viewSourceReference.kind === 'url'}
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <p class="text-primary-700">
                <a
                    href={viewSourceReference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-primary-700 underline hover:text-primary-900"
                >
                    {viewSourceReference.label}
                    <span class="text-xs">↗</span>
                </a>
            </p>
            <!-- eslint-enable svelte/no-navigation-without-resolve -->
        {:else if viewSourceReference.kind === 'book'}
            <div class="space-y-1 text-primary-700">
                <p class="font-medium">{viewSourceReference.label}</p>
                {#if viewSourceReference.bookTitle}
                    <p>
                        <span class="text-primary-500">Book:</span>
                        <em>{viewSourceReference.bookTitle}</em>
                    </p>
                {/if}
                {#if viewSourceReference.pageNumber}
                    <p>
                        <span class="text-primary-500">Page:</span>
                        {viewSourceReference.pageNumber}
                    </p>
                {/if}
                {#if viewSourceReference.isbn}
                    <p>
                        <span class="text-primary-500">ISBN:</span>
                        {viewSourceReference.isbn}
                    </p>
                {/if}
            </div>
        {/if}
    </div>
{/if}
