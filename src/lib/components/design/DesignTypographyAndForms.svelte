<script lang="ts">
    import { Card, Input, Label } from 'flowbite-svelte';
</script>

<section class="grid gap-4 lg:grid-cols-2">
    <Card class="border-primary-200 bg-white">
        <div class="space-y-4 p-2">
            <h2 class="text-xl font-semibold text-primary-900">Typography</h2>
            <div class="space-y-3">
                <h3 class="text-3xl font-semibold text-primary-900">
                    Heading Sample (Varela Round)
                </h3>
                <p class="text-base leading-relaxed text-primary-800">
                    Body sample in Nunito Sans. The system favors warm, practical language and clear
                    readability on mobile-first layouts.
                </p>
                <p class="text-sm text-primary-700">Minimum mobile body text size: 16px.</p>
            </div>
        </div>
    </Card>

    <Card class="border-primary-200 bg-white">
        <div class="space-y-4 p-2">
            <h2 class="text-xl font-semibold text-primary-900">Form Patterns</h2>
            <div>
                <Label for="demo-email" class="mb-2 block text-sm font-medium text-primary-900"
                    >Email</Label
                >
                <Input id="demo-email" type="email" placeholder="parent@example.com" />
            </div>
            <div>
                <Label for="demo-search" class="mb-2 block text-sm font-medium text-primary-900"
                    >Recipe search</Label
                >
                <Input id="demo-search" type="search" placeholder="chicken pasta" />
            </div>
            <p class="text-xs text-primary-700">
                All interactive controls should keep visible focus styles.
            </p>
        </div>
    </Card>
</section>
