<script lang="ts">
	import type { components } from '$lib/api-types';
	import { apiFetch, ApiError } from '$lib/api';
	import { getCookieValue } from '$lib/browser/cookies';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import {
		ExclamationCircleOutline,
		HeartOutline,
		ThumbsDownOutline,
		PlusOutline,
		CloseOutline,
		CheckOutline
	} from 'flowbite-svelte-icons';

	type MemberProfile = components['schemas']['MemberProfile'];
	type AllergyEntry = components['schemas']['AllergyEntry'];
	type SaveProfileRequest = components['schemas']['SaveProfileRequest'];
	type HouseholdMember = components['schemas']['HouseholdMember'];

	const TEXTURE_PRESETS = ['Mushy', 'Slimy', 'Crunchy', 'Mixed Textures', 'Chewy', 'Stringy', 'Grainy'];

	const SEVERITY_OPTIONS: { value: AllergyEntry['severity']; label: string }[] = [
		{ value: 'severe', label: 'Severe' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'mild', label: 'Mild' }
	];

	let {
		profiles,
		members,
		syncEnabled
	}: {
		profiles: MemberProfile[];
		members: HouseholdMember[];
		syncEnabled: boolean;
	} = $props();

	// Local copies of prop-seeded state. These are intentionally one-way:
	// the component owns the state after mount, and saves via API on user action.
	let syncOn = $state(false);
	let syncSaving = $state(false);

	let selectedUserId = $state('');

	// Sync from props when they change (e.g. after navigation or re-fetch)
	$effect(() => {
		syncOn = syncEnabled;
	});

	$effect(() => {
		if (members.length > 0 && !members.some((m) => m.userId === selectedUserId)) {
			selectedUserId = members[0].userId;
			loadProfileIntoEditor(members[0].userId);
		}
	});

	let selectedMember = $derived(members.find((m) => m.userId === selectedUserId));

	// --- Build editable profile state from props ---
	function getProfileForUser(userId: string): MemberProfile | undefined {
		return profiles.find((p) => p.userId === userId);
	}

	function buildInitialProfile(userId: string) {
		const profile = getProfileForUser(userId);
		return {
			allergies: profile?.allergies ? profile.allergies.map((a) => ({ ...a })) : [],
			textures: profile?.textures ? [...profile.textures] : [],
			safeFoods: profile?.safeFoods ? [...profile.safeFoods] : [],
			dislikes: profile?.dislikes ? [...profile.dislikes] : []
		};
	}

	const initial = buildInitialProfile('');
	let editAllergies = $state<AllergyEntry[]>(initial.allergies);
	let editTextures = $state<string[]>(initial.textures);
	let editSafeFoods = $state<string[]>(initial.safeFoods);
	let editDislikes = $state<string[]>(initial.dislikes);

	function loadProfileIntoEditor(userId: string) {
		const data = buildInitialProfile(userId);
		editAllergies = data.allergies;
		editTextures = data.textures;
		editSafeFoods = data.safeFoods;
		editDislikes = data.dislikes;
	}

	function selectMember(userId: string) {
		selectedUserId = userId;
		loadProfileIntoEditor(userId);
	}

	// --- Allergy inline form ---
	let allergyIngredient = $state('');
	let allergySeverity = $state<AllergyEntry['severity']>('moderate');
	let showAllergyForm = $state(false);

	function addAllergy() {
		const trimmed = allergyIngredient.trim();
		if (!trimmed) return;
		editAllergies = [...editAllergies, { ingredient: trimmed, severity: allergySeverity }];
		allergyIngredient = '';
		allergySeverity = 'moderate';
		showAllergyForm = false;
	}

	function removeAllergy(index: number) {
		editAllergies = editAllergies.filter((_, i) => i !== index);
	}

	// --- Custom texture ---
	let showCustomTexture = $state(false);
	let customTextureInput = $state('');

	function toggleTexture(texture: string) {
		if (editTextures.includes(texture)) {
			editTextures = editTextures.filter((t) => t !== texture);
		} else {
			editTextures = [...editTextures, texture];
		}
	}

	function addCustomTexture() {
		const trimmed = customTextureInput.trim();
		if (!trimmed || editTextures.includes(trimmed)) return;
		editTextures = [...editTextures, trimmed];
		customTextureInput = '';
		showCustomTexture = false;
	}

	// --- Safe foods ---
	let safeFoodInput = $state('');

	function addSafeFood() {
		const trimmed = safeFoodInput.trim();
		if (!trimmed || editSafeFoods.includes(trimmed)) return;
		editSafeFoods = [...editSafeFoods, trimmed];
		safeFoodInput = '';
	}

	function removeSafeFood(index: number) {
		editSafeFoods = editSafeFoods.filter((_, i) => i !== index);
	}

	// --- Dislikes ---
	let dislikeInput = $state('');

	function addDislike() {
		const trimmed = dislikeInput.trim();
		if (!trimmed || editDislikes.includes(trimmed)) return;
		editDislikes = [...editDislikes, trimmed];
		dislikeInput = '';
	}

	function removeDislike(index: number) {
		editDislikes = editDislikes.filter((_, i) => i !== index);
	}

	// --- Save ---
	let saving = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state('');

	async function saveProfile() {
		if (!selectedUserId) return;

		saving = true;
		saveSuccess = false;
		saveError = '';

		const body: SaveProfileRequest = {
			allergies: editAllergies,
			textures: editTextures,
			safeFoods: editSafeFoods,
			dislikes: editDislikes
		};

		try {
			await apiFetch(`/api/households/profiles/${selectedUserId}`, {
				method: 'PUT',
				headers: { 'x-csrf-token': getCookieValue('csrf-token') ?? '' },
				body: JSON.stringify(body)
			});

			// Update local profiles array
			const existingIndex = profiles.findIndex((p) => p.userId === selectedUserId);
			const updatedProfile: MemberProfile = {
				userId: selectedUserId,
				name: selectedMember?.name ?? '',
				role: selectedMember?.role ?? '',
				allergies: [...editAllergies],
				textures: [...editTextures],
				safeFoods: [...editSafeFoods],
				dislikes: [...editDislikes]
			};

			if (existingIndex >= 0) {
				profiles[existingIndex] = updatedProfile;
			} else {
				profiles = [...profiles, updatedProfile];
			}

			saveSuccess = true;
			setTimeout(() => (saveSuccess = false), 3000);
		} catch (err) {
			if (err instanceof ApiError) {
				saveError = err.message;
			} else {
				saveError = 'Failed to save profile. Please try again.';
			}
		} finally {
			saving = false;
		}
	}

	// --- Sync toggle ---
	async function toggleSync() {
		const newValue = !syncOn;
		syncSaving = true;

		try {
			await apiFetch('/api/households/settings', {
				method: 'PUT',
				headers: { 'x-csrf-token': getCookieValue('csrf-token') ?? '' },
				body: JSON.stringify({ syncProfilesEnabled: newValue })
			});
			syncOn = newValue;
		} catch {
			// Revert on failure — syncOn stays as-is
		} finally {
			syncSaving = false;
		}
	}

	// --- Helpers ---
	function severityColor(severity: AllergyEntry['severity']): string {
		switch (severity) {
			case 'severe':
				return 'bg-red-100 text-red-700';
			case 'moderate':
				return 'bg-amber-100 text-amber-700';
			case 'mild':
				return 'bg-blue-100 text-blue-700';
		}
	}

	function getInitial(name: string): string {
		return name.charAt(0).toUpperCase();
	}
</script>

{#if members.length === 0}
	<EmptyState
		heading="No family members"
		description="Add members to your household before setting up dietary profiles."
	/>
{:else}
	<div class="space-y-6">
		<!-- Sync Toggle Card -->
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-semibold text-slate-900">
						Apply Profiles to Recipes & Planner
					</h3>
					<p class="mt-1 text-sm text-slate-500">
						Automatically filter recipes and meal plans based on dietary profiles.
					</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={syncOn}
					aria-label="Toggle profile sync"
					disabled={syncSaving}
					onclick={toggleSync}
					class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 {syncOn
						? 'bg-primary-600'
						: 'bg-slate-200'}"
				>
					<span
						class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {syncOn
							? 'translate-x-5'
							: 'translate-x-0'}"
					></span>
				</button>
			</div>
		</div>

		<!-- Family Member Selector -->
		<div class="flex gap-3 overflow-x-auto pb-2">
			{#each members as member (member.userId)}
				<button
					type="button"
					onclick={() => selectMember(member.userId)}
					class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all {selectedUserId ===
					member.userId
						? 'bg-primary-600 text-white shadow-sm'
						: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
				>
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold {selectedUserId ===
						member.userId
							? 'bg-white/20 text-white'
							: 'bg-primary-100 text-primary-700'}"
					>
						{getInitial(member.name)}
					</span>
					{member.name}
				</button>
			{/each}
		</div>

		<!-- Profile Editor -->
		{#if selectedMember}
			<div class="space-y-6">
				<!-- Allergies & Intolerances -->
				<div class="rounded-2xl bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-2">
						<ExclamationCircleOutline class="h-5 w-5 text-red-500" />
						<h3 class="text-base font-semibold text-slate-900">Allergies & Intolerances</h3>
					</div>

					{#if editAllergies.length > 0}
						<div class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
							{#each editAllergies as allergy, i (i)}
								<div
									class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
								>
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-slate-800">{allergy.ingredient}</span>
										<span
											class="rounded-full px-2 py-0.5 text-xs font-medium {severityColor(allergy.severity)}"
										>
											{allergy.severity}
										</span>
									</div>
									<button
										type="button"
										onclick={() => removeAllergy(i)}
										class="ml-2 text-slate-400 hover:text-red-500"
										aria-label="Remove {allergy.ingredient}"
									>
										<CloseOutline class="h-4 w-4" />
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="mb-4 text-sm text-slate-500">No allergies added yet.</p>
					{/if}

					{#if showAllergyForm}
						<div class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
							<div class="flex-1">
								<label for="allergy-ingredient" class="mb-1 block text-xs font-medium text-slate-600">
									Ingredient
								</label>
								<input
									id="allergy-ingredient"
									type="text"
									bind:value={allergyIngredient}
									placeholder="e.g. Peanuts"
									class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
									onkeydown={(e: KeyboardEvent) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											addAllergy();
										}
									}}
								/>
							</div>
							<div class="w-36">
								<label for="allergy-severity" class="mb-1 block text-xs font-medium text-slate-600">
									Severity
								</label>
								<select
									id="allergy-severity"
									bind:value={allergySeverity}
									class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
								>
									{#each SEVERITY_OPTIONS as opt (opt.value)}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</select>
							</div>
							<div class="flex gap-2">
								<button
									type="button"
									onclick={addAllergy}
									disabled={!allergyIngredient.trim()}
									class="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
								>
									Add
								</button>
								<button
									type="button"
									onclick={() => (showAllergyForm = false)}
									class="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<button
							type="button"
							onclick={() => (showAllergyForm = true)}
							class="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
						>
							<PlusOutline class="h-4 w-4" />
							Add Allergy
						</button>
					{/if}
				</div>

				<!-- Sensory & Textures -->
				<div class="rounded-2xl bg-white p-6 shadow-sm">
					<h3 class="mb-2 text-base font-semibold text-slate-900">Sensory & Textures</h3>
					<p class="mb-4 text-sm text-slate-500">
						What textures does {selectedMember.name} struggle with?
					</p>

					<div class="mb-4 flex flex-wrap gap-2">
						{#each TEXTURE_PRESETS as texture (texture)}
							<button
								type="button"
								onclick={() => toggleTexture(texture)}
								class="rounded-full px-4 py-2 text-sm font-medium transition-colors {editTextures.includes(texture)
									? 'bg-primary-600 text-white'
									: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
							>
								{texture}
							</button>
						{/each}

						<!-- Show custom textures not in presets -->
						{#each editTextures.filter((t) => !TEXTURE_PRESETS.includes(t)) as texture (texture)}
							<button
								type="button"
								onclick={() => toggleTexture(texture)}
								class="flex items-center gap-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white"
							>
								{texture}
								<CloseOutline class="h-3 w-3" />
							</button>
						{/each}
					</div>

					{#if showCustomTexture}
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={customTextureInput}
								placeholder="Custom texture"
								class="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
								onkeydown={(e: KeyboardEvent) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addCustomTexture();
									}
								}}
							/>
							<button
								type="button"
								onclick={addCustomTexture}
								disabled={!customTextureInput.trim()}
								class="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
							>
								Add
							</button>
							<button
								type="button"
								onclick={() => (showCustomTexture = false)}
								class="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
							>
								Cancel
							</button>
						</div>
					{:else}
						<button
							type="button"
							onclick={() => (showCustomTexture = true)}
							class="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
						>
							<PlusOutline class="h-4 w-4" />
							Add Custom
						</button>
					{/if}
				</div>

				<!-- Safe Foods -->
				<div class="rounded-2xl bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-2">
						<HeartOutline class="h-5 w-5 text-pink-500" />
						<div>
							<h3 class="text-base font-semibold text-slate-900">Safe Foods</h3>
							<p class="text-sm text-slate-500">Always accepted ingredients</p>
						</div>
					</div>

					{#if editSafeFoods.length > 0}
						<div class="mb-4 flex flex-wrap gap-2">
							{#each editSafeFoods as food, i (i)}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
								>
									{food}
									<button
										type="button"
										onclick={() => removeSafeFood(i)}
										class="ml-0.5 text-slate-400 hover:text-red-500"
										aria-label="Remove {food}"
									>
										<CloseOutline class="h-3 w-3" />
									</button>
								</span>
							{/each}
						</div>
					{/if}

					<input
						type="text"
						bind:value={safeFoodInput}
						placeholder="Plain Pasta, Chicken Nuggets, Apples"
						class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-primary-500"
						onkeydown={(e: KeyboardEvent) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addSafeFood();
							}
						}}
					/>
				</div>

				<!-- Dislikes -->
				<div class="rounded-2xl bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-2">
						<ThumbsDownOutline class="h-5 w-5 text-slate-400" />
						<div>
							<h3 class="text-base font-semibold text-slate-900">Dislikes</h3>
							<p class="text-sm text-slate-500">Try to avoid, but not allergic</p>
						</div>
					</div>

					{#if editDislikes.length > 0}
						<div class="mb-4 flex flex-wrap gap-2">
							{#each editDislikes as item, i (i)}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
								>
									{item}
									<button
										type="button"
										onclick={() => removeDislike(i)}
										class="ml-0.5 text-slate-400 hover:text-red-500"
										aria-label="Remove {item}"
									>
										<CloseOutline class="h-3 w-3" />
									</button>
								</span>
							{/each}
						</div>
					{/if}

					<input
						type="text"
						bind:value={dislikeInput}
						placeholder="Broccoli, Onions, Mushrooms"
						class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary-500 focus:ring-primary-500"
						onkeydown={(e: KeyboardEvent) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addDislike();
							}
						}}
					/>
				</div>

				<!-- Save Button & Feedback -->
				<div class="flex items-center gap-4">
					<button
						type="button"
						onclick={saveProfile}
						disabled={saving}
						class="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
					>
						{#if saving}
							<svg
								class="h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								></path>
							</svg>
							Saving…
						{:else}
							Save Changes
						{/if}
					</button>

					{#if saveSuccess}
						<span class="flex items-center gap-1 text-sm font-medium text-green-600">
							<CheckOutline class="h-4 w-4" />
							Profile saved!
						</span>
					{/if}

					{#if saveError}
						<span class="text-sm font-medium text-red-600">{saveError}</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}
