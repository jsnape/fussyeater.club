<script lang="ts">
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Store Cupboard</h1>
<p>Items your household keeps stocked all the time.</p>

{#if !data.storeCupboard}
    <p>No store cupboard has been set up yet.</p>
{:else}
    <p>Updated: {data.storeCupboard.updatedAt}</p>

    {#if data.storeCupboard.items.length === 0}
        <p>Your cupboard is currently empty.</p>
    {:else}
        <ul>
            {#each data.storeCupboard.items as item (`${item.name}-${item.category}`)}
                <li>{item.name} ({item.category}){#if item.alwaysStocked} - always stocked{/if}</li>
            {/each}
        </ul>
    {/if}
{/if}

<h3>Edit Store Cupboard</h3>
{#if form?.success}
    <p>Store cupboard saved successfully.</p>
{:else if form?.message}
    <p>{form.message}</p>
{/if}
<form method="POST">
    <label>
        Items JSON
        <textarea name="itemsJson" rows="6">{JSON.stringify(data.storeCupboard?.items ?? [], null, 2)}</textarea>
    </label>
    <button type="submit">Save Store Cupboard</button>
</form>
