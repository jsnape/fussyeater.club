<script lang="ts">
	import { page } from '$app/state';
	import { apiFetch, ApiError } from '$lib/api';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let inviteCode = $derived(page.url.searchParams.get('invite')?.toUpperCase() ?? '');
	let loginError = $state('');
	let isSubmitting = $state(false);

	const registerHref = $derived(
		inviteCode ? `/register?invite=${encodeURIComponent(inviteCode)}` : '/register'
	);

	async function submitLogin(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		loginError = '';
		isSubmitting = true;
		try {
			await apiFetch('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});
			await goto('/');
		} catch (error) {
			if (error instanceof ApiError) {
				loginError =
					error.status === 401 ? 'Invalid credentials.' : 'Unable to sign in right now.';
				return;
			}
			loginError = 'Unable to sign in right now.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
	<section class="mx-auto max-w-md rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
		<h1 class="text-2xl font-semibold text-primary-900">Log in</h1>
		<p class="mt-2 text-sm text-primary-700">Use your email and password to continue.</p>

		{#if inviteCode}
			<div
				class="mt-4 rounded-md border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800"
			>
				<p class="font-medium">Invite detected: {inviteCode}</p>
				<label class="mt-2 block text-xs font-medium text-primary-700" for="invite-code"
					>Invite code</label
				>
				<input
					id="invite-code"
					class="mt-1 w-full rounded-md border border-primary-300 bg-white px-3 py-2 font-mono text-sm uppercase"
					type="text"
					value={inviteCode}
					readonly
				/>
				<p class="mt-1">
					Need an account?
					<a class="text-primary-900 underline" href={registerHref}
						>Register with this invite</a
					>
				</p>
			</div>
		{/if}

		<form class="mt-6 space-y-4" onsubmit={submitLogin}>
			<div>
				<label class="mb-1 block text-sm font-medium text-primary-900" for="email"
					>Email</label
				>
				<input
					id="email"
					class="w-full rounded-md border border-primary-300 px-3 py-2"
					type="email"
					autocomplete="email"
					bind:value={email}
					required
				/>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium text-primary-900" for="password"
					>Password</label
				>
				<input
					id="password"
					class="w-full rounded-md border border-primary-300 px-3 py-2"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					required
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Signing in…' : 'Log in'}
			</button>
			{#if loginError}
				<p class="text-sm text-red-700">{loginError}</p>
			{/if}
		</form>

		<div class="mt-4 border-t border-primary-200 pt-4">
			<button
				type="button"
				class="w-full rounded-md border border-primary-300 px-4 py-2 text-sm font-medium text-primary-900"
			>
				Continue with Microsoft
			</button>
		</div>
	</section>
</main>
