<script lang="ts">
    import HomeHealthCard from '$lib/components/home/HomeHealthCard.svelte';
</script>

<main class="min-h-dvh bg-slate-50 px-6 py-10 md:px-10 md:py-16">
    <section class="mx-auto max-w-3xl space-y-6">
        <h1 class="text-2xl font-semibold text-slate-900">Status</h1>
        <p class="text-base text-slate-700">Platform health is checked when this page loads.</p>
        <HomeHealthCard />
    </section>
</main>
