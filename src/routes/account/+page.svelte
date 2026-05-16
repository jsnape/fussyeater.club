<script lang="ts">
    import { UserSettingsOutline } from 'flowbite-svelte-icons';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';
</script>

<main class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
    <h1 class="text-3xl font-bold text-slate-900">Account Settings</h1>
    <div class="mt-10">
        <EmptyState
            heading="Account settings coming soon"
            description="Manage your profile, notification preferences, and dietary defaults from here."
        >
            {#snippet icon()}
                <UserSettingsOutline class="h-12 w-12 text-primary-400" />
            {/snippet}
        </EmptyState>
    </div>
</main>
