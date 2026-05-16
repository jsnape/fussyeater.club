<script lang="ts">
    import { resolve } from '$app/paths';
    import { ClockOutline } from 'flowbite-svelte-icons';

    const recipes = [
        {
            title: 'Creamy Tomato Pasta',
            time: '25 min',
            tags: ['Dairy-Free', 'Quick'],
            gradient: 'from-rose-100 to-rose-50'
        },
        {
            title: 'Crispy Chicken Dippers',
            time: '35 min',
            tags: ['Nut-Free', 'Freezable'],
            gradient: 'from-amber-100 to-amber-50'
        },
        {
            title: 'Rainbow Veggie Wraps',
            time: '15 min',
            tags: ['Vegetarian', 'No Cook'],
            gradient: 'from-emerald-100 to-emerald-50'
        },
        {
            title: 'Hidden Veg Bolognese',
            time: '40 min',
            tags: ['Dairy-Free', 'Batch Cook'],
            gradient: 'from-primary-100 to-primary-50'
        }
    ] as const;
</script>

<section class="space-y-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-2">
            <p class="text-sm font-semibold uppercase tracking-wider text-primary-600">
                Tested by Kids
            </p>
            <h2 class="text-3xl font-bold text-slate-900">Popular This Week</h2>
        </div>
        <a
            href={resolve('/recipes')}
            class="font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
            Browse all recipes →
        </a>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {#each recipes as recipe (recipe.title)}
            <div
                class="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
                <div
                    class="relative flex h-40 items-center justify-center bg-gradient-to-br {recipe.gradient}"
                >
                    <!-- Utensil icon placeholder -->
                    <svg
                        class="h-12 w-12 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z"
                        />
                    </svg>

                    <div
                        class="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 backdrop-blur"
                    >
                        <ClockOutline class="h-3 w-3" />
                        {recipe.time}
                    </div>
                </div>

                <div class="space-y-2 p-4">
                    <h3 class="font-semibold text-slate-900">{recipe.title}</h3>
                    <div class="flex flex-wrap gap-1.5">
                        {#each recipe.tags as tag (tag)}
                            <span
                                class="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>
