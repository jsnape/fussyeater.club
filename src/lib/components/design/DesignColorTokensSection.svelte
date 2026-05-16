<script lang="ts">
    import type { ColorToken } from '$lib/components/design/design-tokens';

    let { colorTokens }: { colorTokens: ColorToken[] } = $props();
</script>

<section class="rounded-2xl bg-white p-8 shadow-md">
    <h2 class="text-xl font-semibold text-slate-900">Color Tokens</h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each colorTokens as color (color.token)}
            <div class="rounded-xl border border-slate-200 p-4">
                <div
                    class="h-14 rounded-lg border border-black/10"
                    style={`background-color: var(${color.token});`}
                    aria-label={`${color.name} swatch`}
                ></div>
                <p class="mt-3 text-sm font-semibold text-slate-900">{color.name}</p>
                <p class="text-xs text-slate-500">{color.token}</p>
                <p class="text-xs text-slate-500">{color.hex}</p>
            </div>
        {/each}
    </div>
</section>
