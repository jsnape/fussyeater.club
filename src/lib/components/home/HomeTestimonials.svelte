<script lang="ts">
    import { QuoteSolid } from 'flowbite-svelte-icons';

    const testimonials = [
        {
            quote:
                "Finally a meal planner that understands my son won't eat anything mushy. We've had three new foods this month!",
            name: 'Sarah M.',
            subtitle: 'Mum of 2, one with sensory issues',
            initial: 'S',
            color: 'bg-primary-500'
        },
        {
            quote:
                'The allergy filters give me peace of mind. I used to triple-check everything — now the app does it for me.',
            name: 'James K.',
            subtitle: 'Dad of 3, one with nut allergy',
            initial: 'J',
            color: 'bg-emerald-500'
        },
        {
            quote:
                'We went from five meals on rotation to actually trying new recipes every week. The kids even help pick!',
            name: 'Priya D.',
            subtitle: 'Mum of 2, one fussy eater',
            initial: 'P',
            color: 'bg-amber-500'
        }
    ] as const;
</script>

<section class="space-y-10">
    <h2 class="text-center text-3xl font-bold text-slate-900">What Parents Say</h2>

    <div class="grid gap-8 md:grid-cols-2">
        {#each testimonials as testimonial (testimonial.name)}
            <div class="rounded-2xl bg-white p-8 shadow-sm">
                <QuoteSolid class="mb-4 h-8 w-8 text-primary-300" />
                <p class="mb-6 text-lg italic text-slate-700">"{testimonial.quote}"</p>
                <div class="flex items-center gap-3">
                    <div
                        class="{testimonial.color} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    >
                        {testimonial.initial}
                    </div>
                    <div>
                        <p class="font-semibold text-slate-900">{testimonial.name}</p>
                        <p class="text-sm text-slate-500">{testimonial.subtitle}</p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>
