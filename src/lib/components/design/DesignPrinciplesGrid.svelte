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
            iconClass: 'h-6 w-6 text-primary-500'
        },
        {
            title: 'System',
            description: 'Tailwind utility-first styling with Flowbite components first.',
            icon: CogOutline,
            label: 'Implementation system',
            iconClass: 'h-6 w-6 text-primary-500'
        }
    ];
</script>

<section class="grid gap-6 md:grid-cols-3">
    {#each principles as principle (principle.title)}
        <Card class="border-slate-200/60 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div class="space-y-4 p-6">
                <principle.icon class={principle.iconClass} aria-label={principle.label} />
                <h2 class="text-lg font-semibold text-slate-900">{principle.title}</h2>
                <p class="text-base text-slate-600">{principle.description}</p>
            </div>
        </Card>
    {/each}
</section>
