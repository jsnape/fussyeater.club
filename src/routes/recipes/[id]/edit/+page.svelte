<script lang="ts">
    import type { PageData } from './$types';
    import RecipeErrorState from '$lib/components/recipe/RecipeErrorState.svelte';
    import RecipeForm from '$lib/components/recipe/RecipeForm.svelte';

    let { data }: { data: PageData } = $props();
</script>

{#if data.error === 'not-found'}
    <RecipeErrorState
        title="Recipe not found"
        message="We couldn't find the recipe you're looking for. It may have been removed or the link may be incorrect."
    />
{:else if data.error === 'forbidden'}
    <RecipeErrorState
        title="You can't edit this recipe"
        message="You don't have permission to edit this recipe. Only the creator or household members can edit it."
    />
{:else if data.error === 'unavailable'}
    <RecipeErrorState
        title="Something went wrong"
        message="We're having trouble loading this recipe right now. Please try again later."
    />
{:else if data.recipe}
    <RecipeForm mode="edit" recipe={data.recipe} />
{/if}
