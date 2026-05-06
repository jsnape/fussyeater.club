<script lang="ts">
    import { Badge, Button, Input } from 'flowbite-svelte';

    let {
        mode,
        tags = $bindable()
    }: {
        mode: 'view' | 'edit';
        tags: string[];
    } = $props();

    let tagDraft = $state('');

    function addTag(): void {
        const tag = tagDraft.trim().toLowerCase();
        if (!tag || tags.includes(tag)) {
            tagDraft = '';
            return;
        }
        tags = [...tags, tag];
        tagDraft = '';
    }

    function removeTag(tag: string): void {
        tags = tags.filter((t) => t !== tag);
    }
</script>

{#if mode === 'edit'}
    <div class="flex gap-2">
        <Input
            id="tag-input"
            type="text"
            bind:value={tagDraft}
            placeholder="Add a tag"
            class="flex-1"
            onkeydown={(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                }
            }}
        />
        <Button
            color="alternative"
            onclick={addTag}
            disabled={!tagDraft.trim()}
            class="min-h-[44px] min-w-[44px]"
        >
            Add
        </Button>
    </div>

    {#if tags.length > 0}
        <div class="mt-3 flex flex-wrap gap-2">
            {#each tags as tag (tag)}
                <Badge color="primary" class="flex items-center gap-1 text-sm">
                    {tag}
                    <button
                        type="button"
                        class="ml-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-xs hover:text-red-600"
                        onclick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                    >
                        ✕
                    </button>
                </Badge>
            {/each}
        </div>
    {/if}
{:else if tags.length > 0}
    <div class="flex flex-wrap gap-2">
        {#each tags as tag (tag)}
            <Badge color="primary">{tag}</Badge>
        {/each}
    </div>
{/if}
