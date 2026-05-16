<script lang="ts">
    import DesignColorTokensSection from '$lib/components/design/DesignColorTokensSection.svelte';
    import {
        colorTokens,
        elevationTokens,
        spacingTokens
    } from '$lib/components/design/design-tokens';
    import DesignHeroSection from '$lib/components/design/DesignHeroSection.svelte';
    import DesignPrinciplesGrid from '$lib/components/design/DesignPrinciplesGrid.svelte';
    import DesignScalesSection from '$lib/components/design/DesignScalesSection.svelte';
    import DesignTypographyAndForms from '$lib/components/design/DesignTypographyAndForms.svelte';
</script>

<main class="min-h-dvh bg-slate-50 px-6 py-10 md:px-10 md:py-16">
    <div class="mx-auto max-w-6xl space-y-10">
        <DesignHeroSection />

        <DesignPrinciplesGrid />

        <DesignColorTokensSection {colorTokens} />

        <DesignTypographyAndForms />

        <DesignScalesSection {spacingTokens} {elevationTokens} />
    </div>
</main>
