<script lang="ts">
    import { Button, Input } from 'flowbite-svelte';
    import { SearchOutline } from 'flowbite-svelte-icons';

    let {
        query = $bindable(),
        onSearch
    }: {
        query: string;
        onSearch: (query: string) => void;
    } = $props();

    function handleSubmit(event: SubmitEvent): void {
        event.preventDefault();
        onSearch(query);
    }
</script>

<form class="flex gap-2" onsubmit={handleSubmit}>
    <Input type="search" placeholder="Search recipes..." bind:value={query} class="flex-1" />
    <Button type="submit" color="primary">
        <SearchOutline class="mr-1 h-4 w-4" />
        Search
    </Button>
</form>
