<script lang="ts">
  import { Badge, Button } from "flowbite-svelte";
</script>

<section class="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm md:p-8">
  <div class="flex flex-wrap items-center gap-3">
    <Badge color="red">Design System</Badge>
    <Badge color="yellow">Tailwind + Flowbite</Badge>
  </div>
  <h1 class="mt-4 text-3xl font-semibold tracking-tight text-primary-900 md:text-4xl">FussyEater Design Showcase</h1>
  <p class="mt-3 max-w-3xl text-base leading-relaxed text-primary-800">
    This page demonstrates the brand tokens, typography scale, spacing, elevation, and reusable UI patterns used
    for the family recipe and meal planning experience.
  </p>
  <div class="mt-6 flex flex-wrap items-center gap-3">
    <Button color="yellow" size="lg">Primary CTA</Button>
    <Button color="light" size="lg">Secondary Action</Button>
  </div>
</section>
