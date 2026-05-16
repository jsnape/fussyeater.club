<script lang="ts">
    import { Badge, Button, Card } from 'flowbite-svelte';
</script>

<Card class="w-full max-w-none border-slate-200/60 bg-white shadow-md">
    <div class="space-y-8 p-6 sm:p-10">
        <Badge color="green" class="w-fit">Family recipes for picky eaters</Badge>
        <div class="space-y-3">
            <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Make dinner easier for everyone at the table
            </h1>
            <p class="max-w-2xl text-lg leading-relaxed text-slate-600">
                Discover recipes your family will actually eat, plan a full week in minutes, and
                build shopping lists tailored to allergies and preferences.
            </p>
        </div>
        <!-- Hero image source attribution: Unsplash (free license), original: https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1600&q=80&license=free -->
        <img
            src="/images/home-hero-family-meal.jpg"
            alt="Family-style meal spread on a dinner table"
            class="h-64 w-full rounded-2xl object-cover sm:h-80"
            loading="lazy"
        />
        <div class="flex flex-wrap items-center gap-4">
            <Button color="yellow" size="lg">Start meal planning</Button>
            <Button color="light" size="lg">Browse recipes</Button>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl bg-primary-50 p-4 text-base text-slate-900">
                <p class="font-semibold">Allergy-aware</p>
                <p class="text-slate-600">Filter by family needs</p>
            </div>
            <div class="rounded-xl bg-primary-50 p-4 text-base text-slate-900">
                <p class="font-semibold">Fast planning</p>
                <p class="text-slate-600">Build a weekly plan quickly</p>
            </div>
            <div class="rounded-xl bg-primary-50 p-4 text-base text-slate-900">
                <p class="font-semibold">Shopping ready</p>
                <p class="text-slate-600">Auto-generate grocery lists</p>
            </div>
        </div>
    </div>
</Card>
