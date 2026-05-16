<script lang="ts">
    import { CalendarWeekOutline } from 'flowbite-svelte-icons';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';
</script>

<main class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
    <h1 class="text-3xl font-bold text-slate-900">Meal Planner</h1>
    <div class="mt-10">
        <EmptyState
            heading="Your weekly plan starts here"
            description="Drag and drop recipes into your weekly calendar. We'll check every meal against your family's dietary profiles."
        >
            {#snippet icon()}
                <CalendarWeekOutline class="h-12 w-12 text-primary-400" />
            {/snippet}
        </EmptyState>
    </div>
</main>
