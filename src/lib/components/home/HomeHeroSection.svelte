<script lang="ts">
  import { Badge, Button, Card } from "flowbite-svelte";
</script>

<Card class="border-primary-200 bg-white shadow-sm">
  <div class="space-y-6 p-2 sm:p-4">
    <Badge color="red" class="w-fit">Family recipes for picky eaters</Badge>
    <div class="space-y-3">
      <h1 class="text-3xl font-semibold tracking-tight text-primary-900 sm:text-4xl">
        Make dinner easier for everyone at the table
      </h1>
      <p class="max-w-2xl text-base leading-relaxed text-primary-800">
        Discover recipes your family will actually eat, plan a full week in minutes, and build shopping lists
        tailored to allergies and preferences.
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Button color="yellow" size="lg">Start meal planning</Button>
      <Button color="light" size="lg">Browse recipes</Button>
    </div>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900">
        <p class="font-semibold">Allergy-aware</p>
        <p class="text-primary-800">Filter by family needs</p>
      </div>
      <div class="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900">
        <p class="font-semibold">Fast planning</p>
        <p class="text-primary-800">Build a weekly plan quickly</p>
      </div>
      <div class="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900">
        <p class="font-semibold">Shopping ready</p>
        <p class="text-primary-800">Auto-generate grocery lists</p>
      </div>
    </div>
  </div>
</Card>
