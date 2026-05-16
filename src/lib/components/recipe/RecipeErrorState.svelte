<script lang="ts">
    import { Button } from 'flowbite-svelte';

    let {
        title,
        message,
        actionLabel = 'Browse recipes',
        actionHref = '/recipes'
    }: {
        title: string;
        message: string;
        actionLabel?: string;
        actionHref?: string;
    } = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
    <h1 class="text-2xl font-semibold text-slate-900">{title}</h1>
    <p class="mt-4 text-base text-slate-600">{message}</p>
    <div class="mt-6">
        <Button href={actionHref} color="primary">{actionLabel}</Button>
    </div>
</div>
