<script lang="ts">
    import HomeCtaPanel from '$lib/components/home/HomeCtaPanel.svelte';
    import HomeFeatureGrid from '$lib/components/home/HomeFeatureGrid.svelte';
    import HomeHeroSection from '$lib/components/home/HomeHeroSection.svelte';
    import HomeRecipePreview from '$lib/components/home/HomeRecipePreview.svelte';
    import HomeTestimonials from '$lib/components/home/HomeTestimonials.svelte';
</script>

<main class="min-h-dvh bg-slate-50">
    <HomeHeroSection />

    <div class="mx-auto max-w-6xl space-y-16 px-6 py-16 md:px-10 md:py-24">
        <HomeFeatureGrid />

        <HomeRecipePreview />

        <HomeTestimonials />
    </div>

    <HomeCtaPanel />
</main>
