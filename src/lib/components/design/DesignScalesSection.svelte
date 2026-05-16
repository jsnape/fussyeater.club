<script lang="ts">
    import { Card } from 'flowbite-svelte';
    import type { ScaleToken } from '$lib/components/design/design-tokens';

    let {
        spacingTokens,
        elevationTokens
    }: { spacingTokens: ScaleToken[]; elevationTokens: ScaleToken[] } = $props();
</script>

<section class="grid gap-6 lg:grid-cols-2">
    <Card class="border-slate-200/60 bg-white shadow-sm">
        <div class="space-y-4 p-6">
            <h2 class="text-xl font-semibold text-slate-900">Spacing Scale</h2>
            {#each spacingTokens as item (item.token)}
                <div
                    class="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                >
                    <span class="text-sm font-medium text-slate-900">{item.token}</span>
                    <span class="text-sm text-slate-500">{item.value}</span>
                </div>
            {/each}
        </div>
    </Card>

    <Card class="border-slate-200/60 bg-white shadow-sm">
        <div class="space-y-4 p-6">
            <h2 class="text-xl font-semibold text-slate-900">Elevation Scale</h2>
            {#each elevationTokens as item (item.token)}
                <div
                    class="rounded-lg border border-slate-100 bg-slate-50 px-4 py-4"
                    style={`box-shadow: var(${item.token});`}
                >
                    <p class="text-sm font-medium text-slate-900">{item.token}</p>
                    <p class="text-xs text-slate-500">{item.value}</p>
                </div>
            {/each}
        </div>
    </Card>
</section>
