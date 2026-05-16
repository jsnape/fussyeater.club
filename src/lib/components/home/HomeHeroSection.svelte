<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from 'flowbite-svelte';

    let isAuthenticated = $derived(Boolean(page.data.sessionUser));
</script>

<section class="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
    <div class="mx-auto max-w-7xl">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <!-- Left column: text content -->
            <div class="space-y-8">
                <div class="space-y-4">
                    <h1
                        class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                    >
                        Mealtimes, made&nbsp;happy.
                    </h1>
                    <p class="max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                        Plan allergy-aware meals your fussy eaters will actually enjoy. Respect
                        sensory preferences, skip the stress, and build shopping lists your whole
                        family can trust.
                    </p>
                </div>

                <!-- CTA buttons -->
                <div class="flex flex-wrap items-center gap-4">
                    {#if isAuthenticated}
                        <Button color="yellow" size="lg" href={resolve('/recipes')}>
                            Go to Recipes
                        </Button>
                        <Button color="light" size="lg" href={resolve('/household')}>
                            Plan Your Week
                        </Button>
                    {:else}
                        <Button color="yellow" size="lg" href={resolve('/register')}>
                            Join the Club
                        </Button>
                        <Button color="light" size="lg" href="#how-it-works">
                            See How It Works
                        </Button>
                    {/if}
                </div>

                <!-- Social proof -->
                <div class="flex items-center gap-3">
                    <div class="flex -space-x-2">
                        <div
                            class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-sm font-semibold text-primary-700"
                        >
                            S
                        </div>
                        <div
                            class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-200 text-sm font-semibold text-primary-700"
                        >
                            J
                        </div>
                        <div
                            class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-300 text-sm font-semibold text-primary-800"
                        >
                            A
                        </div>
                    </div>
                    <p class="text-sm text-slate-500">
                        Joined by <span class="font-semibold text-slate-700">2,000+</span> relieved
                        parents
                    </p>
                </div>
            </div>

            <!-- Right column: hero image with floating badges -->
            <div class="relative">
                <!-- Hero image source attribution: Unsplash (free license), original: https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1600&q=80&license=free -->
                <img
                    src="/images/home-hero-family-meal.jpg"
                    alt="Family-style meal spread on a dinner table"
                    class="h-80 w-full rounded-3xl object-cover shadow-lg sm:h-[28rem] lg:h-[32rem]"
                    loading="lazy"
                />

                <!-- Floating badge: win moment -->
                <div
                    class="absolute -bottom-4 -left-4 rounded-2xl bg-white px-5 py-3 shadow-lg sm:bottom-6 sm:left-6"
                >
                    <p class="text-base font-semibold text-slate-900">🎉 Broccoli eaten!</p>
                </div>

                <!-- Floating badge: Sensory-Friendly -->
                <div
                    class="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-primary-700 shadow-md backdrop-blur-sm"
                >
                    Sensory-Friendly
                </div>

                <!-- Floating badge: Allergy-Aware -->
                <div
                    class="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-primary-700 shadow-md backdrop-blur-sm sm:bottom-6 sm:right-6"
                >
                    Allergy-Aware
                </div>
            </div>
        </div>
    </div>
</section>
