<script lang="ts">
    import { Card } from 'flowbite-svelte';
    import { ChartPieOutline, CheckCircleOutline, CogOutline } from 'flowbite-svelte-icons';

    const principles = [
        {
            title: 'Trust',
            description: 'Clear hierarchy and positive feedback states for busy families.',
            icon: CheckCircleOutline,
            label: 'Trust and reliability',
            iconClass: 'h-6 w-6 text-green-600'
        },
        {
            title: 'Consistency',
            description: 'Token-driven colors, spacing, and shadows across all pages.',
            icon: ChartPieOutline,
            label: 'Visual consistency',
            iconClass: 'h-6 w-6 text-primary-700'
        },
        {
            title: 'System',
            description: 'Tailwind utility-first styling with Flowbite components first.',
            icon: CogOutline,
            label: 'Implementation system',
            iconClass: 'h-6 w-6 text-primary-700'
        }
    ];
</script>

<section class="grid gap-4 md:grid-cols-3">
    {#each principles as principle (principle.title)}
        <Card class="border-primary-200 bg-white">
            <div class="space-y-2 p-2">
                <principle.icon class={principle.iconClass} aria-label={principle.label} />
                <h2 class="text-lg font-semibold text-primary-900">{principle.title}</h2>
                <p class="text-sm text-primary-800">{principle.description}</p>
            </div>
        </Card>
    {/each}
</section>
