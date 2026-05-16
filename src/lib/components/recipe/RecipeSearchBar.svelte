<script lang="ts">
    import { SearchOutline } from 'flowbite-svelte-icons';
    import { untrack } from 'svelte';

    let {
        query = $bindable(),
        onSearch
    }: {
        query: string;
        onSearch: (query: string) => void;
    } = $props();

    let lastSearched = $state(untrack(() => query));

    $effect(() => {
        const currentQuery = query;
        if (currentQuery === lastSearched) return;

        const timeout = setTimeout(() => {
            lastSearched = currentQuery;
            onSearch(currentQuery);
        }, 300);

        return () => clearTimeout(timeout);
    });

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            lastSearched = query;
            onSearch(query);
        }
    }
</script>

<div class="relative w-full">
    <SearchOutline class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
        type="search"
        placeholder="Search recipes..."
        aria-label="Search recipes"
        bind:value={query}
        onkeydown={handleKeydown}
        class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
    />
</div>
