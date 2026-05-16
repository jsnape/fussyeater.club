<script lang="ts">
    import { Card } from 'flowbite-svelte';
    import { BookOpenOutline, CartPlusOutline, ClockOutline } from 'flowbite-svelte-icons';

    const features = [
        {
            title: 'Recipe library',
            description: 'Save family-approved meals and avoid repetitive guesswork.',
            icon: BookOpenOutline,
            iconLabel: 'Recipe library'
        },
        {
            title: 'Weekly planning',
            description: 'Drag and arrange meals by day with minimal effort.',
            icon: ClockOutline,
            iconLabel: 'Weekly planning'
        },
        {
            title: 'Shopping list',
            description: 'Export consolidated grocery lists based on your meal plan.',
            icon: CartPlusOutline,
            iconLabel: 'Shopping list'
        }
    ];
</script>

<section class="grid gap-6 md:grid-cols-3">
    {#each features as feature (feature.title)}
        <Card class="border-slate-200/60 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div class="space-y-4 p-6">
                <feature.icon class="h-8 w-8 text-primary-500" aria-label={feature.iconLabel} />
                <h3 class="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p class="text-base text-slate-600">{feature.description}</p>
            </div>
        </Card>
    {/each}
</section>
