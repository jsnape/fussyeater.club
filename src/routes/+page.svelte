<script lang="ts">
    import HomeCtaPanel from '$lib/components/home/HomeCtaPanel.svelte';
    import HomeFeatureGrid from '$lib/components/home/HomeFeatureGrid.svelte';
    import HomeHeroSection from '$lib/components/home/HomeHeroSection.svelte';
</script>

<main class="min-h-dvh bg-slate-50 px-6 py-10 md:px-10 md:py-16">
    <div class="mx-auto max-w-6xl space-y-12">
        <section>
            <HomeHeroSection />
        </section>

        <HomeFeatureGrid />

        <HomeCtaPanel />
    </div>
</main>
