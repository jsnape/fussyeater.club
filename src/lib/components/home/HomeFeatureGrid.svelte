<script lang="ts">
  import { Card } from "flowbite-svelte";
  import { BookOpenSolid, CartPlusSolid, ClockSolid } from "flowbite-svelte-icons";

  const features = [
    {
      title: "Recipe library",
      description: "Save family-approved meals and avoid repetitive guesswork.",
      icon: BookOpenSolid,
      iconLabel: "Recipe library"
    },
    {
      title: "Weekly planning",
      description: "Drag and arrange meals by day with minimal effort.",
      icon: ClockSolid,
      iconLabel: "Weekly planning"
    },
    {
      title: "Shopping list",
      description: "Export consolidated grocery lists based on your meal plan.",
      icon: CartPlusSolid,
      iconLabel: "Shopping list"
    }
  ];
</script>

<section class="grid gap-4 md:grid-cols-3">
  {#each features as feature (feature.title)}
    <Card class="border-primary-200 bg-white">
      <div class="space-y-2 p-2 sm:p-3">
        <feature.icon class="h-6 w-6 text-primary-700" aria-label={feature.iconLabel} />
        <h3 class="text-base font-semibold text-primary-900">{feature.title}</h3>
        <p class="text-sm text-primary-800">{feature.description}</p>
      </div>
    </Card>
  {/each}
</section>
