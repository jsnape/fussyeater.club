<script lang="ts">
  import { onMount } from "svelte";

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

<div class="p-8">
  <section class="max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <h2 class="text-lg font-semibold text-gray-900">API Health</h2>
    <div class="mt-3 flex items-center gap-3">
      <span
        class="h-3.5 w-3.5 rounded-full"
        class:bg-green-500={healthState === "healthy"}
        class:bg-red-500={healthState !== "healthy"}
        aria-hidden="true"
      ></span>
      <p class="text-sm text-gray-700">{statusText}</p>
    </div>

    <button
      type="button"
      class="mt-4 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
      onclick={() => void checkHealth()}
    >
      Check again
    </button>
  </section>
</div>

