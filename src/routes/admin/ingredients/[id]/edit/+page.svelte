<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { apiFetch, ApiError } from '$lib/api';
    import { getCookieValue } from '$lib/browser/cookies';
    import IngredientForm from '$lib/components/admin/IngredientForm.svelte';

    type CreateIngredientRequest = {
        name: string;
        foodGroup: string;
        allergens: string[];
        plantColour?: string | null;
        aliases: string[];
        description?: string | null;
    };

    let { data }: { data: PageData } = $props();

    let error = $state('');

    async function handleSave(formData: CreateIngredientRequest): Promise<void> {
        error = '';
        const csrfToken = getCookieValue('csrf-token');
        const headers: Record<string, string> = {};
        if (csrfToken) headers['x-csrf-token'] = csrfToken;

        try {
            await apiFetch(`/api/admin/ingredients/${data.ingredient.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(formData)
            });
            await goto(resolve('/admin/ingredients'));
        } catch (err) {
            if (err instanceof ApiError) {
                error = err.message || `Request failed (${err.status}).`;
            } else {
                error = 'Network error. Please try again.';
            }
            throw new Error(error);
        }
    }

    function handleCancel(): void {
        void goto(resolve('/admin/ingredients'));
    }
</script>

<main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
    <div class="flex items-center gap-4">
        <a
            href={resolve('/admin/ingredients')}
            class="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
            ← Back to ingredients
        </a>
    </div>
    <h1 class="mt-4 text-2xl font-semibold text-slate-900">
        Edit {data.ingredient.name}
    </h1>
    <p class="mt-1 text-sm text-slate-500">Update ingredient details</p>

    {#if error}
        <p class="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
        </p>
    {/if}

    <div class="mt-8">
        <IngredientForm
            ingredient={data.ingredient}
            isEdit={true}
            onSave={handleSave}
            onCancel={handleCancel}
        />
    </div>
</main>
