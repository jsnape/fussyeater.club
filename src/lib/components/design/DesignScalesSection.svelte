<script lang="ts">
    import { Card } from 'flowbite-svelte';
    import type { ScaleToken } from '$lib/components/design/design-tokens';

    let {
        spacingTokens,
        elevationTokens
    }: { spacingTokens: ScaleToken[]; elevationTokens: ScaleToken[] } = $props();
</script>

<section class="grid gap-4 lg:grid-cols-2">
    <Card class="border-primary-200 bg-white">
        <div class="space-y-3 p-2">
            <h2 class="text-xl font-semibold text-primary-900">Spacing Scale</h2>
            {#each spacingTokens as item (item.token)}
                <div
                    class="flex items-center justify-between rounded-lg border border-primary-100 px-3 py-2"
                >
                    <span class="text-sm font-medium text-primary-900">{item.token}</span>
                    <span class="text-sm text-primary-700">{item.value}</span>
                </div>
            {/each}
        </div>
    </Card>

    <Card class="border-primary-200 bg-white">
        <div class="space-y-3 p-2">
            <h2 class="text-xl font-semibold text-primary-900">Elevation Scale</h2>
            {#each elevationTokens as item (item.token)}
                <div
                    class="rounded-lg border border-primary-100 bg-primary-50 px-3 py-3"
                    style={`box-shadow: var(${item.token});`}
                >
                    <p class="text-sm font-medium text-primary-900">{item.token}</p>
                    <p class="text-xs text-primary-700">{item.value}</p>
                </div>
            {/each}
        </div>
    </Card>
</section>
