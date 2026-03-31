<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h1>Recipes</h1>
<p>Browse and manage your recipes.</p>

{#if data.recipes.length === 0}
    <p>No recipes yet. Create your first recipe to get started!</p>
{:else}
    <ul>
        {#each data.recipes as recipe}
            <li>
                <a href="/recipes/{recipe.id}">{recipe.title}</a>
                {#if recipe.description}
                    <span> — {recipe.description}</span>
                {/if}
            </li>
        {/each}
    </ul>
{/if}
