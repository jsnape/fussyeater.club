<script lang="ts">
    import { Button } from 'flowbite-svelte';

    let {
        page,
        totalPages,
        onPageChange
    }: {
        page: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    } = $props();

    let isFirstPage = $derived(page <= 1);
    let isLastPage = $derived(page >= totalPages);
</script>

{#if totalPages > 1}
    <nav
        class="flex items-center justify-between border-t border-primary-200 pt-4"
        aria-label="Pagination"
    >
        <Button color="alternative" disabled={isFirstPage} onclick={() => onPageChange(page - 1)}>
            ← Previous
        </Button>
        <span class="text-sm text-primary-700">
            Page {page} of {totalPages}
        </span>
        <Button color="alternative" disabled={isLastPage} onclick={() => onPageChange(page + 1)}>
            Next →
        </Button>
    </nav>
{/if}
