<script lang="ts">
    import { Badge, Button } from 'flowbite-svelte';
</script>

<section class="rounded-2xl bg-white p-8 shadow-md md:p-10">
    <div class="flex flex-wrap items-center gap-3">
        <Badge color="green">Design System</Badge>
        <Badge color="yellow">Tailwind + Flowbite</Badge>
    </div>
    <h1 class="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        FussyEater Design Showcase
    </h1>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        This page demonstrates the brand tokens, typography scale, spacing, elevation, and reusable
        UI patterns used for the family recipe and meal planning experience.
    </p>
    <div class="mt-8 flex flex-wrap items-center gap-4">
        <Button color="yellow" size="lg">Primary CTA</Button>
        <Button color="light" size="lg">Secondary Action</Button>
    </div>
</section>
