<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from 'flowbite-svelte';
    import { CheckCircleOutline } from 'flowbite-svelte-icons';

    let isAuthenticated = $derived(Boolean(page.data.sessionUser));
</script>

<section class="rounded-xl border border-primary-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div class="flex min-w-0 items-start gap-3 pr-1 sm:pr-4">
            <CheckCircleOutline class="mt-0.5 h-5 w-5 text-green-600" aria-label="Trust signal" />
            <p class="text-sm leading-relaxed text-primary-800">
                Families using FussyEater Club can organize meals around preferences and allergies
                with less stress and more confidence.
            </p>
        </div>
        {#if !isAuthenticated}
            <Button color="yellow" href={resolve('/register')}>Register</Button>
        {/if}
    </div>
</section>
