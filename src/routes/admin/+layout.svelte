<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	let sidebarOpen = $state(false);

	const navLinks = [
		{ label: 'Ingredients', href: resolve('/admin/ingredients'), path: '/admin/ingredients', disabled: false },
		{ label: 'Unmapped', href: resolve('/admin/ingredients/unmapped'), path: '/admin/ingredients/unmapped', disabled: false },
		{ label: 'Users', href: '', path: '/admin/users', disabled: true, badge: 'Coming soon' },
		{ label: 'Reports', href: '', path: '/admin/reports', disabled: true, badge: 'Coming soon' }
	];

	let currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

{#if !data.isAdmin}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<div class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
				<svg
					class="h-8 w-8 text-red-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
					/>
				</svg>
			</div>
			<h1 class="mb-2 text-xl font-semibold text-slate-900">Access denied</h1>
			<p class="mb-6 text-sm text-slate-500">
				You don't have permission to access the admin area.
			</p>
			<a
				href={resolve('/')}
				class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
			>
				Go home
			</a>
		</div>
	</div>
{:else}
	<div class="flex min-h-[calc(100dvh-4rem)]">
		<!-- Mobile sidebar toggle -->
		<button
			type="button"
			class="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg md:hidden"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			aria-label="Toggle admin menu"
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				{#if sidebarOpen}
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				{/if}
			</svg>
		</button>

		<!-- Mobile overlay -->
		{#if sidebarOpen}
			<button
				type="button"
				class="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
				onclick={closeSidebar}
				aria-label="Close sidebar"
			></button>
		{/if}

		<!-- Sidebar -->
		<aside
			class="fixed z-40 flex h-[calc(100dvh-4rem)] w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:sticky md:top-16 md:z-auto md:translate-x-0"
			class:translate-x-0={sidebarOpen}
			class:-translate-x-full={!sidebarOpen}
		>
			<div class="border-b border-slate-200 px-4 py-3">
				<h2 class="text-sm font-semibold tracking-wide text-slate-400 uppercase">Admin</h2>
			</div>

			<nav class="flex-1 overflow-y-auto px-3 py-4">
				<ul class="space-y-1">
					{#each navLinks as link (link.path)}
						<li>
							{#if link.disabled}
								<span
									class="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
								>
									{link.label}
									{#if link.badge}
										<span
											class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-400"
										>
											{link.badge}
										</span>
									{/if}
								</span>
							{:else}
								<a
									href={link.href}
									onclick={closeSidebar}
									class="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(
										link.path
									)
										? 'bg-primary-50 text-primary-700'
										: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
								>
									{link.label}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</nav>
		</aside>

		<!-- Main content -->
		<div class="flex-1">
			{@render children()}
		</div>
	</div>
{/if}
