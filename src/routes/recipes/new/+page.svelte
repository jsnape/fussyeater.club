<script lang="ts">
    import RecipeForm from '$lib/components/recipe/RecipeForm.svelte';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let { data } = $props();
</script>

<RecipeForm mode="create" />
