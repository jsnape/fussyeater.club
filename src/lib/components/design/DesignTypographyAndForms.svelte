<script lang="ts">
    import { Card, Input, Label } from 'flowbite-svelte';
</script>

<section class="grid gap-6 lg:grid-cols-2">
    <Card class="border-slate-200/60 bg-white shadow-sm">
        <div class="space-y-4 p-6">
            <h2 class="text-xl font-semibold text-slate-900">Typography</h2>
            <div class="space-y-4">
                <h3 class="text-3xl font-bold text-slate-900">
                    Heading Sample (Quicksand)
                </h3>
                <p class="text-base leading-relaxed text-slate-700">
                    Body sample in Nunito Sans. The system favors warm, practical language and clear
                    readability on mobile-first layouts.
                </p>
                <p class="text-sm text-slate-500">Minimum mobile body text size: 16px.</p>
            </div>
        </div>
    </Card>

    <Card class="border-slate-200/60 bg-white shadow-sm">
        <div class="space-y-4 p-6">
            <h2 class="text-xl font-semibold text-slate-900">Form Patterns</h2>
            <div>
                <Label for="demo-email" class="mb-2 block text-sm font-medium text-slate-900"
                    >Email</Label
                >
                <Input id="demo-email" type="email" placeholder="parent@example.com" />
            </div>
            <div>
                <Label for="demo-search" class="mb-2 block text-sm font-medium text-slate-900"
                    >Recipe search</Label
                >
                <Input id="demo-search" type="search" placeholder="chicken pasta" />
            </div>
            <p class="text-xs text-slate-500">
                All interactive controls should keep visible focus styles.
            </p>
        </div>
    </Card>
</section>
