<script lang="ts">
    import HomeHealthCard from '$lib/components/home/HomeHealthCard.svelte';
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
    <section class="mx-auto max-w-3xl space-y-4">
        <h1 class="text-2xl font-semibold text-primary-900">Status</h1>
        <p class="text-sm text-primary-800">Platform health is checked when this page loads.</p>
        <HomeHealthCard />
    </section>
</main>
