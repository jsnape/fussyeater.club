<script lang="ts">
  import { onMount } from "svelte";
  import { Badge, Button, Card } from "flowbite-svelte";
  import { BookOpenSolid, CartPlusSolid, CheckCircleSolid, ClockSolid } from "flowbite-svelte-icons";

  type HealthState = "checking" | "healthy" | "unhealthy";

  let healthState = $state<HealthState>("checking");
  let statusText = $state("Checking API health...");

  const healthyValues = new Set(["healthy", "ok", "up"]);

  async function checkHealth() {
    healthState = "checking";
    statusText = "Checking API health...";

    try {
      const response = await fetch("/api/health", {
        headers: {
          accept: "application/json"
        }
      });

      if (!response.ok) {
        healthState = "unhealthy";
        statusText = `Health check failed (${response.status})`;
        return;
      }

      const body = (await response.json()) as { status?: string };
      const status = body.status?.toLowerCase().trim();

      if (status && healthyValues.has(status)) {
        healthState = "healthy";
        statusText = `API is healthy (${body.status})`;
      } else {
        healthState = "unhealthy";
        statusText = `API is unhealthy (${body.status ?? "unknown status"})`;
      }
    } catch {
      healthState = "unhealthy";
      statusText = "Unable to fetch health status";
    }
  }

  onMount(() => {
    void checkHealth();
  });
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
  <div class="mx-auto max-w-6xl space-y-8">
    <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
      <Card class="border-primary-200 bg-white shadow-sm">
        <div class="space-y-6 p-2 sm:p-4">
          <Badge color="red" class="w-fit">Family recipes for picky eaters</Badge>
          <div class="space-y-3">
            <h1 class="text-3xl font-semibold tracking-tight text-primary-900 sm:text-4xl">
              Make dinner easier for everyone at the table
            </h1>
            <p class="max-w-2xl text-base leading-relaxed text-primary-800">
              Discover recipes your family will actually eat, plan a full week in minutes, and build shopping
              lists tailored to allergies and preferences.
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

      <Card class="border-primary-200 bg-white shadow-sm">
        <div class="space-y-4 p-2 sm:p-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-primary-900">Platform health</h2>
            {#if healthState === "healthy"}
              <Badge color="green">Healthy</Badge>
            {:else if healthState === "checking"}
              <Badge color="yellow">Checking</Badge>
            {:else}
              <Badge color="red">Needs attention</Badge>
            {/if}
          </div>
          <p class="text-sm text-primary-800" aria-live="polite">{statusText}</p>
          <Button color="light" onclick={() => void checkHealth()}>Run health check</Button>
        </div>
      </Card>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <Card class="border-primary-200 bg-white">
        <div class="space-y-2 p-2 sm:p-3">
          <BookOpenSolid class="h-6 w-6 text-primary-700" aria-label="Recipe library" />
          <h3 class="text-base font-semibold text-primary-900">Recipe library</h3>
          <p class="text-sm text-primary-800">Save family-approved meals and avoid repetitive guesswork.</p>
        </div>
      </Card>

      <Card class="border-primary-200 bg-white">
        <div class="space-y-2 p-2 sm:p-3">
          <ClockSolid class="h-6 w-6 text-primary-700" aria-label="Weekly planning" />
          <h3 class="text-base font-semibold text-primary-900">Weekly planning</h3>
          <p class="text-sm text-primary-800">Drag and arrange meals by day with minimal effort.</p>
        </div>
      </Card>

      <Card class="border-primary-200 bg-white">
        <div class="space-y-2 p-2 sm:p-3">
          <CartPlusSolid class="h-6 w-6 text-primary-700" aria-label="Shopping list" />
          <h3 class="text-base font-semibold text-primary-900">Shopping list</h3>
          <p class="text-sm text-primary-800">Export consolidated grocery lists based on your meal plan.</p>
        </div>
      </Card>
    </section>

    <section class="rounded-xl border border-primary-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <CheckCircleSolid class="mt-0.5 h-5 w-5 text-green-600" aria-label="Trust signal" />
          <p class="max-w-2xl text-sm leading-relaxed text-primary-800">
            Families using FussyEater Club can organize meals around preferences and allergies with less stress and
            more confidence.
          </p>
        </div>
        <Button color="yellow">Create your first plan</Button>
      </div>
    </section>
  </div>
</main>

