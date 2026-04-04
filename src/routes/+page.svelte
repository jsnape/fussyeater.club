<script lang="ts">
  import HomeCtaPanel from "$lib/components/home/HomeCtaPanel.svelte";
  import HomeFeatureGrid from "$lib/components/home/HomeFeatureGrid.svelte";
  import HomeHealthCard from "$lib/components/home/HomeHealthCard.svelte";
  import HomeHeroSection from "$lib/components/home/HomeHeroSection.svelte";
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
  <div class="mx-auto max-w-6xl space-y-8">
    <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
      <HomeHeroSection />
      <HomeHealthCard />
    </section>

    <HomeFeatureGrid />

    <HomeCtaPanel />
  </div>
</main>

