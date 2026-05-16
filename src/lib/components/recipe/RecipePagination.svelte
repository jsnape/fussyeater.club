<script lang="ts">
    type Props = {
        page: number;
        totalPages: number;
        total: number;
        pageSize: number;
        onPageChange: (page: number) => void;
    };

    let { page, totalPages, total, pageSize, onPageChange }: Props = $props();

    let isFirstPage = $derived(page <= 1);
    let isLastPage = $derived(page >= totalPages);

    let start = $derived((page - 1) * pageSize + 1);
    let end = $derived(Math.min(page * pageSize, total));

    let pageNumbers = $derived.by(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | '...')[] = [1];
        const windowStart = Math.max(2, page - 2);
        const windowEnd = Math.min(totalPages - 1, page + 2);

        if (windowStart > 2) {
            pages.push('...');
        }

        for (let i = windowStart; i <= windowEnd; i++) {
            pages.push(i);
        }

        if (windowEnd < totalPages - 1) {
            pages.push('...');
        }

        pages.push(totalPages);
        return pages;
    });
</script>

{#if totalPages > 1}
    <nav class="flex flex-col items-center gap-2 border-t border-slate-200 pt-6" aria-label="Pagination">
        <div class="flex items-center justify-center gap-1">
            <button
                class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={isFirstPage}
                onclick={() => onPageChange(page - 1)}
            >
                ← Previous
            </button>

            {#each pageNumbers as entry, idx (typeof entry === 'number' ? entry : `ellipsis-${idx}`)}
                {#if entry === '...'}
                    <span class="min-w-[2rem] h-8 flex items-center justify-center text-sm text-slate-400 cursor-default">
                        …
                    </span>
                {:else}
                    <button
                        class="min-w-[2rem] h-8 rounded-lg text-sm {entry === page
                            ? 'bg-primary-600 text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-100'}"
                        onclick={() => onPageChange(entry)}
                        aria-current={entry === page ? 'page' : undefined}
                    >
                        {entry}
                    </button>
                {/if}
            {/each}

            <button
                class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={isLastPage}
                onclick={() => onPageChange(page + 1)}
            >
                Next →
            </button>
        </div>

        <p class="text-sm text-slate-500">
            Showing {start}–{end} of {total} recipes
        </p>
    </nav>
{/if}
