<script lang="ts">
    import { onMount } from 'svelte';
    import { Badge, Button, Card } from 'flowbite-svelte';

    type HealthState = 'checking' | 'healthy' | 'unhealthy';

    const healthyValues = new Set(['healthy', 'ok', 'up']);

    let healthState = $state<HealthState>('checking');
    let statusText = $state('Checking API health...');

    async function checkHealth() {
        healthState = 'checking';
        statusText = 'Checking API health...';

        try {
            const response = await fetch('/api/health', {
                headers: {
                    accept: 'application/json'
                }
            });

            if (!response.ok) {
                healthState = 'unhealthy';
                statusText = `Health check failed (${response.status})`;
                return;
            }

            const body = (await response.json()) as { status?: string };
            const status = body.status?.toLowerCase().trim();

            if (status && healthyValues.has(status)) {
                healthState = 'healthy';
                statusText = `API is healthy (${body.status})`;
            } else {
                healthState = 'unhealthy';
                statusText = `API is unhealthy (${body.status ?? 'unknown status'})`;
            }
        } catch {
            healthState = 'unhealthy';
            statusText = 'Unable to fetch health status';
        }
    }

    onMount(() => {
        void checkHealth();
    });
</script>

<Card class="border-primary-200 bg-white shadow-sm">
    <div class="space-y-4 p-2 sm:p-4">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-primary-900">Platform health</h2>
            {#if healthState === 'healthy'}
                <Badge color="green">Healthy</Badge>
            {:else if healthState === 'checking'}
                <Badge color="yellow">Checking</Badge>
            {:else}
                <Badge color="red">Needs attention</Badge>
            {/if}
        </div>
        <p class="text-sm text-primary-800" aria-live="polite">{statusText}</p>
        <Button color="light" onclick={() => void checkHealth()}>Run health check</Button>
    </div>
</Card>
